import { AlertasModel } from '../models/alertas.models.js';
import { calculateTotalPages } from '../utils/paginacion.js';
import db from '../config/db.js';
import { getIO } from '../config/socket.js';

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
      const referenciaId = String(row.id_venta || row.id_pedido || row.pedIdFk || '');
      console.log(referenciaId)
      const tipoOrigen = row.tipo_origen || (row.pedIdFk ? 'PEDIDO' : 'VENTA');
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

      if (montoPendiente >= 0 && fechaVencida) {
        // — Deuda vencida: crear alerta si no existe —
        if (!alertaExistente) {
          const esPedido = tipoOrigen === 'PEDIDO';
          const titulo = `Pago pendiente - ${esPedido ? 'Pedido' : 'Venta'} #${referenciaId}`;
          const mensaje = `El ${esPedido ? 'pedido' : 'venta'} #${referenciaId} tiene un monto pendiente de S/${montoPendiente.toFixed(2)} con fecha límite ${fechaLimite}`;

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
