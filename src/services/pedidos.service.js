import { ClienteModel } from '../models/cliente.models.js';
import { DetallePedidoModel } from '../models/dt_pedido.models.js';
import { PedidoModel } from '../models/pedido.models.js';
import { PedidoFotoModel } from '../models/pedido_foto.models.js';
import { VentasModel } from '../models/ventas.models.js';
import { toTitleCase, formatDateColombia } from '../utils/normalizacion_datos.js';
import { calculateTotalPages } from '../utils/paginacion.js';
import { getDetallePedidoByIdPedido } from './dt_pedido.service.js';
import db from "../config/db.js";

// servicio para obtener todos los pedidos con paginacion
export const getAllPedidosService = async (pag = 1, filtros = {}) => {

  const limite = 15;

  const rows = await PedidoModel.getAllPedidos(pag, limite, filtros);
  const total = await PedidoModel.countPedidos(filtros);

  // Obtener tipos de prenda para todos los pedidos devueltos
  const pedidoIds = rows.map(e => e.id);
  const tiposRows = await PedidoModel.getTiposPrendaByPedidoIds(pedidoIds);
  const tiposMap = {};
  for (const row of tiposRows) {
    tiposMap[row.pedido_id] = row.tipos_prenda ? row.tipos_prenda.split(',') : [];
  }

  const data = rows.map(e => ({
    id: e.id,
    descripcion: e.descripcion,
    cliente_nombres: e.cliente_nombres,
    fecha_entrega_estimada: e.fecha_estimada ? formatDateColombia(new Date(e.fecha_estimada)) : null,
    fecha_ingreso: e.fecha_ingreso ? formatDateColombia(new Date(e.fecha_ingreso)) : null,
    estado: e.estado,
    estado_pago: e.estado_pago,
    dias_faltantes: e.dias_faltantes,
    precio_total: e.total_pedido,
    tipo_pedido: e.tipo_pedido,
    tipo_origen: e.tipo_origen,
    tipos_prenda: tiposMap[e.id] || [],
  }));

  return {
    maxPag: calculateTotalPages(total, limite),
    pagAct: Number(pag),
    data
  };
};

// servicio para crear un nuevo pedido
export const createNewPedido = async ({
  cliente_id,
  fecha_estimada,
  observaciones,
  recordatorio,
  descripcion,
  usuarioId,
  tipo_pedido,
  tipo_de_origen
}) => {
  const esProduccion = tipo_de_origen === 'PRODUCCION';

  if (!esProduccion) {
    // // 🔹 1. Validar cliente (solo para origen CLIENTE)
    const cliente = await ClienteModel.getById(cliente_id);
    if (!cliente || !cliente.status) {
      return { err: 'Cliente no encontrado', errorCode: 404 };
    }

    // // 🔹 2. Validar si está bloqueado
    if (cliente.data.estado === 2) {
      return { err: 'El cliente está bloqueado', errorCode: 403 };
    }
  }

  // si la descripcion es null asignar un valor por defecto para evitar errores de validacion
  if (!descripcion) {
    if (esProduccion) {
      descripcion = `Producción interna - ${formatDateColombia(new Date())}`;
    } else {
      // estructura nombre del cliente - fecha de registro del pedido
      const cliente = await ClienteModel.getById(cliente_id);
      descripcion = `Pedido de ${toTitleCase(cliente.data.cliNom)} ${cliente.data?.cliApe !== null ? toTitleCase(cliente.data.cliApe) : ''} - ${formatDateColombia(new Date())}`;
    }
  }
  // 🔹 3. Crear pedido
  const result = await PedidoModel.create({
    cliente_id,
    fecha_estimada,
    observaciones,
    recordatorio,
    descripcion,
    usuarioId,
    tipo_pedido,
    tipo_de_origen: tipo_de_origen || 'CLIENTE'
  });
  // console.log(result)
  if (!result || !result.status) {
    return { err: 'Error al crear el pedido', errorCode: 500 };
  }
  // 🔹 5. Respuesta exitosa
  return {
    data: {
      pedido_id: result.insertId
    }
  };
};

// servicio para obtener un pedido por su id
export const getPedidoByIdService = async (id_pedido) => {
  const pedido = await PedidoModel.getById(id_pedido);
  if (!pedido) return { err: "Pedido no encontrado", errorCode: 404 }
  const detalles = await getDetallePedidoByIdPedido(id_pedido);

  // Extraer tipos de prenda únicos desde los detalles
  const tiposSet = new Set();
  if (detalles.data) {
    for (const det of detalles.data) {
      if (det.producto?.tipoPrenda) {
        tiposSet.add(det.producto.tipoPrenda);
      }
    }
  }

  return {
    pedido_id: pedido[0].id,
    tipos_prenda: [...tiposSet],
    cliente: {
      cliente_id: pedido[0].cliente_id,
      cliente_nombres: pedido[0].cliente_name
    },
    usuario_creador: {
      user_id: pedido[0].user_id,
      user_nombres: pedido[0].user_name,
    },
    descripcion: pedido[0].descripcion,
    estado: pedido[0].estado,
    estado_pago: pedido[0].estado_pago,
    observacion: pedido[0].obs,
    recordatorio: pedido[0].recordatorio,
    precio_total: pedido[0].total_pedido,
    tipo_pedido: pedido[0].tipo_pedido != null ? toTitleCase(pedido[0].tipo_pedido) : null,
    tipo_origen: pedido[0].tipo_origen,
    fecha_estimada_entrega: pedido[0].f_estimada != null ? formatDateColombia(pedido[0].f_estimada) : null,
    fecha_entrega: pedido[0].f_entrega != null ? formatDateColombia(pedido[0].f_entrega) : null,
    fecha_ingreso: pedido[0].f_ingreso != null ? formatDateColombia(pedido[0].f_ingreso) : null,
    fotos_pedido: (await PedidoFotoModel.getFotosByPedidoId(id_pedido)).map(f => ({
      foto_id: f.fotId,
      foto_url: f.fotUrl,
      foto_fecha_registro: f.fotFec
    })),
    detalles_pedido: detalles.data ?? [],
    venta_id: pedido[0].venta_id
  }
};

// servicio para actualizar los datos iniciales de un pedido
export const updatePedidoService = async (id, data) => {

  const {
    cliente_id,
    descripcion,
    observacion,
    fecha_estimada_entrega,
    recordatorio,
    tipo_pedido
  } = data;

  // 🔹 validar que exista el pedido
  const pedido = await PedidoModel.getById(id);

  if (!pedido) {
    return { err: "Pedido no encontrado", errorCode: 404 };
  }
  const esProduccion = pedido[0].tipo_origen === 'PRODUCCION';
  // 🔹 construir update dinámico
  const fields = {};
  const values = [];

  if (cliente_id !== undefined) {
    const cliente = await ClienteModel.getById(cliente_id);
  if (!cliente || !cliente.status) {
    return { err: 'Cliente no encontrado', errorCode: 404 };
  }
    fields.pedCliIdFk = '?';
    values.push(cliente_id);
  }

  if (descripcion !== undefined) {
    fields.pedDesc = '?';
    if (esProduccion) {
      values.push(!descripcion ? `Producción interna - ${formatDateColombia(new Date())}`: descripcion);
    }else {
      values.push(!descripcion ? `Pedido de ${toTitleCase(pedido[0].cliente_name)} - ${formatDateColombia(new Date(pedido[0].f_ingreso))}` : descripcion);
    }
  }

  if (observacion !== undefined) {
    fields.pedObs = '?';
    values.push(observacion);
  }

  if (fecha_estimada_entrega !== undefined) {
    fields.pedFecEst = '?';
    values.push(fecha_estimada_entrega);
  }

  if (recordatorio !== undefined) {
    fields.pedRecor = '?';
    values.push(recordatorio);
  }

  if (tipo_pedido !== undefined) {
    fields.pedTipPed = '?';
    values.push(tipo_pedido);
  }

  // 🔴 si no viene nada para actualizar
  if (values.length === 0) {
    return { err: "No hay campos para actualizar", errorCode: 400 };
  }

  // 🔹 armar query dinámico
  const setClause = Object.keys(fields)
    .map(key => `${key} = ${fields[key]}`)
    .join(', ');
  // console.log(setClause)

  await PedidoModel.update(id, setClause, values);

  return { status: true };
};

// ─────────────────────────────────────────────
//  Servicio: entregar un pedido (TERMINADO → ENTREGADO)
// ─────────────────────────────────────────────
export const entregarPedidoService = async (pedidoId, usuarioId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Validar que el pedido existe
    const [[pedido]] = await connection.query(
      `SELECT pedId, pedEst, pedTipOri FROM pedidos WHERE pedId = ? FOR UPDATE`,
      [pedidoId]
    );

    if (!pedido) {
      await connection.rollback();
      return { err: 'Pedido no encontrado', errorCode: 404 };
    }

    // 1b. Validar que no sea un pedido de PRODUCCION
    if (pedido.pedTipOri === 'PRODUCCION') {
      await connection.rollback();
      return { err: 'Los pedidos con origen PRODUCCION no pueden ser entregados', errorCode: 400 };
    }

    // 2. Validar que el estado sea TERMINADO
    if (pedido.pedEst !== 'TERMINADO') {
      await connection.rollback();
      return { err: `El pedido debe estar en estado TERMINADO para entregarlo. Estado actual: ${pedido.pedEst}`, errorCode: 400 };
    }

    // 3. Ejecutar el cambio vía modelo (usa la misma conexión)
    await PedidoModel.entregar(pedidoId, usuarioId, connection);

    await connection.commit();

    return { status: true };
  } catch (error) {
    await connection.rollback();
    console.error('[entregarPedidoService] Error:', error.message);
    // Si el SP lanzó SIGNAL SQLSTATE, propagamos el mensaje real
    if (error.code === 'ER_SIGNAL_EXCEPTION') {
      return { err: error.sqlMessage, errorCode: 400 };
    }
    return { err: 'Error interno al entregar el pedido', errorCode: 500 };
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────
//  Servicio: listar pedidos completados (TERMINADO + ENTREGADO)
// ─────────────────────────────────────────────
export const getAllEntregasService = async (pag = 1, filtros = {}) => {
  const limite = 15;

  const [rows, total, resumen] = await Promise.all([
    PedidoModel.getAllEntregas(pag, limite, filtros),
    PedidoModel.countEntregas(filtros),
    PedidoModel.getResumenEntregas(filtros)
  ]);

  const data = rows.map(e => ({
    id: e.id,
    descripcion: e.descripcion,
    cliente_nombres: e.cliente_nombres,
    fecha_entrega_estimada: e.fecha_estimada ? formatDateColombia(new Date(e.fecha_estimada)) : null,
    fecha_entrega_real: e.fecha_entrega ? formatDateColombia(new Date(e.fecha_entrega)) : null,
    estado: e.estado,
    tipo_origen: e.tipo_origen || 'CLIENTE',
    precio_total: Number(e.precio_total ?? 0),
    estado_pago: e.estado_pago,
    saldo: Number(e.saldo ?? 0),
    venta_id: e.venta_id
  }));

  return {
    maxPag: calculateTotalPages(total, limite),
    pagAct: Number(pag),
    data,
    resumen
  };
};

// ─────────────────────────────────────────────
//  Servicio: devolución de pedido
// ─────────────────────────────────────────────
export const devolverPedidoService = async (pedidoId, tipoDevolucion, motivo, usuarioId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Obtener pedido con bloqueo (método del modelo)
    const pedido = await PedidoModel.getByIdForUpdate(pedidoId, connection);

    if (!pedido) {
      await connection.rollback();
      return { err: 'Pedido no encontrado', errorCode: 404 };
    }

    const descripcionAnterior = pedido.pedDesc || '';
    const tipoTexto = tipoDevolucion === 'ANULACION' ? 'Devolución' : 'Correcciones';
    const nuevaDesc = `${tipoTexto}:${descripcionAnterior}`;

    // ─── FLUJO A: Pedido entregado (vuelve a TERMINADO + posible anulación de venta) ───
    if (pedido.pedEst === 'ENTREGADO') {
      // 2. Cambiar estado a TERMINADO usando el SP
      const resultadoSp = await PedidoModel.updateStatus({
        pedidoId,
        usu_id: usuarioId,
        estado: 'TERMINADO',
        motivo: `Devolución por ${tipoDevolucion === 'ANULACION' ? 'anulación' : 'corrección'}: ${motivo}`
      }, connection);

      if (resultadoSp !== 'OK') {
        await connection.rollback();
        return { err: resultadoSp || 'Error al cambiar el estado del pedido', errorCode: 400 };
      }

      // 3. Actualizar campos no-estado (pedObs, pedDesc, pedTipOri/pedTipPed)
      await PedidoModel.devolver({
        pedidoId,
        tipoDevolucion,
        motivo,
        nuevaDesc
      }, connection);

      // 4. Para anulación: anular venta
      if (tipoDevolucion === 'ANULACION') {
        if (pedido.pedTipOri !== 'CLIENTE') {
          await connection.rollback();
          return { err: 'Solo pedidos con origen CLIENTE pueden ser anulados', errorCode: 400 };
        }

        const venta = await VentasModel.getVentaIdByPedidoId(pedidoId, connection);
        if (venta) {
          const resultado = await VentasModel.anular(venta.venId, usuarioId);
          if (resultado !== 'OK') {
            await connection.rollback();
            return { err: resultado || 'Error al anular la venta', errorCode: 400 };
          }
        }
      }
    }

    // ─── FLUJO B: Pedido en TERMINADO (cambia origen a PRODUCCION directamente) ───
    else if (pedido.pedEst === 'TERMINADO') {
      // Actualizar campos (origen a PRODUCCION o tipo a modificaciones)
      await PedidoModel.devolver({
        pedidoId,
        tipoDevolucion,
        motivo,
        nuevaDesc
      }, connection);

      // Anular venta si corresponde (aunque el pedido no esté ENTREGADO)
      if (tipoDevolucion === 'ANULACION') {
        if (pedido.pedTipOri !== 'CLIENTE') {
          await connection.rollback();
          return { err: 'Solo pedidos con origen CLIENTE pueden ser anulados', errorCode: 400 };
        }

        const venta = await VentasModel.getVentaIdByPedidoId(pedidoId, connection);
        if (venta) {
          const resultado = await VentasModel.anular(venta.venId, usuarioId);
          if (resultado !== 'OK') {
            await connection.rollback();
            return { err: resultado || 'Error al anular la venta', errorCode: 400 };
          }
        }
      }
    }

    // ─── Otros estados: rechazar ───
    else {
      await connection.rollback();
      return {
        err: `El pedido debe estar en estado ENTREGADO o TERMINADO. Estado actual: ${pedido.pedEst}`,
        errorCode: 400
      };
    }

    await connection.commit();
    return { status: true };

  } catch (error) {
    await connection.rollback();
    console.error('[devolverPedidoService] Error:', error.message);
    if (error.code === 'ER_SIGNAL_EXCEPTION') {
      return { err: error.sqlMessage, errorCode: 400 };
    }
    return { err: 'Error interno al procesar la devolución', errorCode: 500 };
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────
//  Servicio: obtener historial de cambios de estado de un pedido
// ─────────────────────────────────────────────
export const getHistorialPedidoService = async (pedidoId, pag = 1) => {
  const limite = 15;

  const [rows, total] = await Promise.all([
    PedidoModel.getHistorialByPedidoId(pedidoId, pag, limite),
    PedidoModel.countHistorialByPedidoId(pedidoId)
  ]);

  const data = rows.map(e => ({
    hist_id: e.histId,
    estado_anterior: e.estadoAnterior,
    estado_actual: e.estadoNuevo,
    usuario: {
      user_id: e.usuIdFk,
      user_nombres: e.usuNom,
      user_apellidos: e.usuApe,
    },
    fecha_registro: e.hisFec ? formatDateColombia(new Date(e.hisFec), true) : null,
    observacion: e.hisObs || null,
  }));

  return {
    maxPag: calculateTotalPages(total, limite),
    pagAct: Number(pag),
    data
  };
};

// cancelar un pedido

export const cancelPedidoService = async (id, motivo, usuarioId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // El SP sp_cancelar_pedido ya tiene control de errores implementado
    const resultado = await PedidoModel.cancelar(connection, id, usuarioId, motivo);

    if (resultado && resultado !== 'OK') {
      await connection.rollback();
      return { err: resultado, errorCode: 400 };
    }

    await connection.commit();

    return { status: true };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};