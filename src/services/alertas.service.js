import { AlertasModel } from '../models/alertas.models.js';
import { calculateTotalPages } from '../utils/paginacion.js';
import db from '../config/db.js';
import { getIO } from '../config/socket.js';

const CATEGORIA_PEDIDO_PENDIENTE = 'PEDIDO_PENDIENTE';

/**
 * Obtener alertas paginadas con filtros
 */
export const getAlertasService = async (pagina = 1, limite = 15, filtros = {}) => {
  const paginaActual = parseInt(pagina, 10) || 1;
  const limitePagina = parseInt(limite, 10) || 15;
  const offset = (paginaActual - 1) * limitePagina;

  const [total, rows] = await Promise.all([
    AlertasModel.countAll(filtros),
    AlertasModel.getAll(filtros, limitePagina, offset)
  ]);

  const data = rows.map(row => {
    const infoExtra = typeof row.altInfoExtra === 'string'
      ? JSON.parse(row.altInfoExtra)
      : row.altInfoExtra;

    const esPedido = infoExtra?.tipo_origen === 'PEDIDO';

    return {
      id_alerta: row.altId,
      titulo: row.altTitulo,
      mensaje: row.altMensaje,
      tipo_alerta: row.altTipo,
      categoria: row.altCategoria,
      modulo: row.altModulo,
      fecha: row.altFecha instanceof Date
        ? row.altFecha.toISOString()
        : row.altFecha,
      estado: row.altEstado,
      referencia_id: row.altReferenciaId,
      info_extra: infoExtra,
      accion: {
        url: esPedido ? `/pedidos/${row.altReferenciaId}` : `/ventas/${row.altReferenciaId}`,
        texto: esPedido ? 'Ir a pedido' : 'Ir a venta'
      }
    };
  });

  return {
    meta: {
      paginas_totales: calculateTotalPages(total, limitePagina),
      pagina_actual: paginaActual,
      total,
      limite: limitePagina
    },
    data
  };
};

/**
 * Ejecutar verificación de pagos pendientes desde la vista vw_pagos_pendientes
 *
 * Para cada registro:
 *  - Si tiene monto_pendiente > 0 y fecha vencida → crea alerta (si no existe duplicado)
 *  - Si ya no tiene deuda y hay alerta ACTIVA → cambia estado a RESUELTO
 */
export const ejecutarVerificacionPagos = async () => {
  try {
    console.log('[ALERTAS] Ejecutando verificación de pagos pendientes...');

    const [registros] = await db.query('SELECT * FROM vw_pagos_pendientes');

    if (!registros || registros.length === 0) {
      console.log('[ALERTAS] No se encontraron registros pendientes');
      return;
    }

    for (const row of registros) {
      // Determinar el ID de referencia y tipo de origen
      // Si tiene pedido → referencia = id del pedido; si no → referencia = id de la venta
      const tipoOrigen = row.tipo_origen || (row.pedIdFk ? 'PEDIDO' : 'VENTA');
      const referenciaId = tipoOrigen === 'PEDIDO'
        ? String(row.pedIdFk || row.id_pedido || '')
        : String(row.venId || row.id_venta || '');
      // console.log(referenciaId)
      const categoria = tipoOrigen === 'PEDIDO' ? 'PAGO_PENDIENTE_PEDIDO' : 'PAGO_PENDIENTE_VENTAS';
      const montoPendiente = parseFloat(row.monto_pendiente ?? row.saldo_pendiente ?? 0);
      const fechaLimite = row.fecha_limite ?? row.venFecVenLimit ?? null;

      if (!referenciaId) {
        console.warn('[ALERTAS] Registro sin ID de referencia, saltando', row);
        continue;
      }

      const infoExtra = {
        id_cliente: row.cliId ?? row.cliente_id ?? null,
        nombre_cliente: row.cliente_nombres || `${row.cliNom || ''} ${row.cliApe || ''}`.trim() || null,
        monto_pendiente: montoPendiente,
        fecha_limite: fechaLimite,
        tipo_origen: tipoOrigen
      };

      // Buscar alerta existente para evitar duplicados (altReferenciaId + altCategoria)
      const alertaExistente = await AlertasModel.findByReferenciaYCategoria(referenciaId, categoria);

      const fechaVencida = fechaLimite && new Date(fechaLimite) < new Date();
      // console.log(alertaExistente, montoPendiente)

      if (montoPendiente > 0 && fechaVencida) {
        // — Deuda vencida: crear alerta si no existe —
        if (!alertaExistente) {
          const esPedido = tipoOrigen === 'PEDIDO';
          const titulo = `Pago pendiente - ${esPedido ? 'Pedido' : 'Venta'} #${referenciaId}`;
          const fechaLocal = typeof fechaLimite === 'object' && fechaLimite instanceof Date
            ? fechaLimite.toLocaleDateString('es-PE')
            : new Date(fechaLimite).toLocaleDateString('es-PE');
          const mensaje = `El ${esPedido ? 'pedido' : 'venta'} #${referenciaId} tiene un monto pendiente de $ ${montoPendiente.toFixed(2)} con fecha límite ${fechaLocal}`;

          const insertId = await AlertasModel.create({
            altTitulo: titulo,
            altMensaje: mensaje,
            altTipo: 'WARNING',
            altModulo: 'PAGOS',
            altReferenciaId: referenciaId,
            altCategoria: categoria,
            altInfoExtra: infoExtra
          });

          // Emitir evento socket
          try {
            getIO().emit('nueva-alerta', {
              id_alerta: insertId,
              titulo,
              tipo: 'WARNING',
              categoria,
              referencia_id: referenciaId,
              info_extra: infoExtra,
              accion: {
                url: esPedido ? `/pedidos/${referenciaId}` : `/ventas/${referenciaId}`,
                texto: esPedido ? 'Ir a pedido' : 'Ir a venta'
              }
            });
          } catch (e) {
            console.warn('[ALERTAS] Socket no disponible para emitir nueva-alerta');
          }

          console.log(`[ALERTAS] Alerta creada para ${tipoOrigen} #${referenciaId}`);
        }
      } else if (alertaExistente && alertaExistente.altEstado === 'ACTIVO' && montoPendiente <= 0) {
        // — Deuda resuelta: marcar alerta como RESUELTO —
        await AlertasModel.updateEstado(alertaExistente.altId, 'RESUELTO');

        try {
          getIO().emit('alerta-resuelta', {
            id_alerta: alertaExistente.altId,
            referencia_id: referenciaId,
            categoria
          });
        } catch (e) {
          console.warn('[ALERTAS] Socket no disponible para emitir alerta-resuelta');
        }

        console.log(`[ALERTAS] Alerta resuelta para ${tipoOrigen} #${referenciaId}`);
      }
    }

    console.log('[ALERTAS] Verificación completada');
  } catch (error) {
    console.error('[ALERTAS] Error en verificación de pagos:', error);
  }
};

/**
 * Ejecutar verificación de pedidos activos con recordatorio pendiente
 *
 * Lee la vista vw_pedidos_activos y para cada pedido con necesitaRecordatorio = 1:
 *  - Si no existe alerta ACTIVA → la crea (tipo WARNING, categoria PEDIDO_PENDIENTE)
 *  - Si el pedido ya no está en la vista (o ya no necesita recordatorio) y tiene alerta ACTIVA → la resuelve
 */
export const ejecutarVerificacionPedidos = async () => {
  try {
    console.log('[ALERTAS] Ejecutando verificación de pedidos con recordatorio...');

    // 1. Obtener pedidos activos que necesitan recordatorio
    const [pedidosPendientes] = await db.query(
      `SELECT 
        pedId, 
        pedFecEst, 
        pedEst, 
        nombreCliente,
        diasRestantes
      FROM vw_pedidos_activos 
      WHERE necesitaRecordatorio = 1`
    );

    const pedidosConAlerta = pedidosPendientes.length;
    console.log(`[ALERTAS] ${pedidosConAlerta} pedido(s) necesitan recordatorio`);

    // ── 2. Crear alertas para pedidos que aún no tienen ──
    const idsConRecordatorio = [];

    for (const row of pedidosPendientes) {
      const referenciaId = String(row.pedId);
      idsConRecordatorio.push(referenciaId);

      // Verificar si ya existe alerta activa para este pedido
      const alertaExistente = await AlertasModel.findByReferenciaYCategoria(
        referenciaId,
        CATEGORIA_PEDIDO_PENDIENTE
      );

      if (!alertaExistente) {
        const fechaEntrega = row.pedFecEst
          ? new Date(row.pedFecEst).toLocaleDateString('es-CO', {
            timeZone: 'UTC'
          })
          : 'sin fecha';
          // console.log(fechaEntrega);
          
        const infoExtra = {
          cliente: row.nombreCliente || null,
          fecha_entrega: fechaEntrega|| null,
          dias_restantes: row.diasRestantes ?? null,
          tipo_origen: 'PEDIDO'
        };

        const titulo = `Pedido #${referenciaId} pendiente de entrega`;
        const mensaje = row.diasRestantes !== null && row.diasRestantes <= 0
          ? `El pedido #${referenciaId} de ${row.nombreCliente || 'cliente'} venció hace ${Math.abs(row.diasRestantes)} día(s) — fecha acordada: ${fechaEntrega}`
          : `El pedido #${referenciaId} de ${row.nombreCliente || 'cliente'} tiene entrega pendiente — fecha acordada: ${fechaEntrega}`;

        const insertId = await AlertasModel.create({
          altTitulo: titulo,
          altMensaje: mensaje,
          altTipo: 'WARNING',
          altModulo: 'PEDIDOS',
          altReferenciaId: referenciaId,
          altCategoria: CATEGORIA_PEDIDO_PENDIENTE,
          altInfoExtra: infoExtra
        });

        // Emitir evento socket
        try {
          getIO().emit('nueva-alerta', {
            id_alerta: insertId,
            titulo,
            tipo: 'WARNING',
            categoria: CATEGORIA_PEDIDO_PENDIENTE,
            referencia_id: referenciaId,
            info_extra: infoExtra,
            accion: {
              url: `/pedidos/${referenciaId}`,
              texto: 'Ir a pedido'
            }
          });
        } catch (e) {
          console.warn('[ALERTAS] Socket no disponible para emitir nueva-alerta');
        }

        console.log(`[ALERTAS] Alerta creada para pedido #${referenciaId}`);
      }
    }

    // ── 3. Resolver alertas de pedidos que ya no necesitan recordatorio ──
    // Buscar alertas ACTIVAS de tipo PEDIDO_PENDIENTE cuyo pedId ya no esté
    // en la lista de ids que necesitan recordatorio
    const [alertasActivas] = await db.query(
      `SELECT altId, altReferenciaId
       FROM alertas
       WHERE altCategoria = ? AND altEstado = 'ACTIVO'`,
      [CATEGORIA_PEDIDO_PENDIENTE]
    );

    for (const alerta of alertasActivas) {
      if (!idsConRecordatorio.includes(alerta.altReferenciaId)) {
        // Este pedido ya no necesita recordatorio → resolver alerta
        await AlertasModel.updateEstado(alerta.altId, 'RESUELTO');

        try {
          getIO().emit('alerta-resuelta', {
            id_alerta: alerta.altId,
            referencia_id: alerta.altReferenciaId,
            categoria: CATEGORIA_PEDIDO_PENDIENTE
          });
        } catch (e) {
          console.warn('[ALERTAS] Socket no disponible para emitir alerta-resuelta');
        }

        console.log(`[ALERTAS] Alerta resuelta para pedido #${alerta.altReferenciaId} (ya no necesita recordatorio)`);
      }
    }

    console.log('[ALERTAS] Verificación de pedidos completada');
  } catch (error) {
    console.error('[ALERTAS] Error en verificación de pedidos:', error);
  }
};
