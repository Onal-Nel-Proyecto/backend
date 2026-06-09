import { ClienteModel } from '../models/cliente.models.js';
import { DetallePedidoModel } from '../models/dt_pedido.models.js';
import { PedidoModel } from '../models/pedido.models.js';
import { PedidoFotoModel } from '../models/pedido_foto.models.js';
import { toTitleCase } from '../utils/normalizacion_datos.js';
import { calculateTotalPages } from '../utils/paginacion.js';
import { getDetallePedidoByIdPedido } from './dt_pedido.service.js';
import db from "../config/db.js";

// servicio para obtener todos los pedidos con paginacion
export const getAllPedidosService = async (pag = 1, filtros = {}) => {

  const limite = 15;

  const rows = await PedidoModel.getAllPedidos(pag, limite, filtros);
  const total = await PedidoModel.countPedidos(filtros);

  const data = rows.map(e => ({
    id: e.id,
    descripcion: e.descripcion,
    cliente_nombres: e.cliente_nombres,
    fecha_entrega_estimada: e.fecha_estimada ? new Date(e.fecha_estimada).toLocaleDateString() : null,
    estado: e.estado,
    estado_pago: e.estado_pago,
    dias_faltantes: e.dias_faltantes,
    precio_total: e.total_pedido
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
  tipo_pedido
}) => {
  
  // // 🔹 1. Validaciones básicas
  // if (!cliente_id || !fecha_estimada || !descripcion || !usuarioId) {
  //   return { err: 'Campos obligatorios faltantes', errorCode: 400 };
  // }

  // // 🔹 2. Verificar cliente
  const cliente = await ClienteModel.getById(cliente_id);
  if (!cliente || !cliente.status) {
    return { err: 'Cliente no encontrado', errorCode: 404 };
  }

  // // 🔹 3. Validar si está bloqueado
  if (cliente.data.estado === 2) {
    return { err: 'El cliente está bloqueado', errorCode: 403 };
  }

  // si la descripcion es null asignar un valor por defecto para evitar errores de validacion
  if (!descripcion) {
    // estructura nombre del cliente - fecha de registro del pedido
    
    descripcion = `Pedido de ${toTitleCase(cliente.data.cliNom)} ${cliente.data?.cliApe !== null ? toTitleCase(cliente.data.cliApe) : ''} - ${new Date().toLocaleDateString('es-CO')}`;
  }
  // 🔹 4. Crear pedido
  const result = await PedidoModel.create({
    cliente_id,
    fecha_estimada,
    observaciones,
    recordatorio,
    descripcion,
    usuarioId,
    tipo_pedido
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
  // console.log(pedido[0])
  return {
    pedido_id: pedido[0].id,
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
    fecha_estimada_entrega: pedido[0].f_estimada != null ? pedido[0].f_estimada.toISOString().split('T')[0] : pedido[0].f_estimada,
    fecha_entrega: pedido[0].f_entrega != null ? pedido[0].f_entrega.toISOString().split('T')[0] : pedido[0].f_entrega,
    fecha_ingreso: pedido[0].f_ingreso != null ? pedido[0].f_ingreso.toISOString().split('T')[0] : pedido[0].f_ingreso,
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
    recordatorio
  } = data;

  // 🔹 validar que exista el pedido
  const pedido = await PedidoModel.getById(id);

  if (!pedido) {
    return { err: "Pedido no encontrado", errorCode: 404 };
  }

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
    values.push(!descripcion ? `Pedido de ${toTitleCase(pedido[0].cliente_name)} - ${new Date(pedido[0].f_ingreso).toLocaleDateString('es-CO')}` : descripcion);
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
      `SELECT pedId, pedEst FROM pedidos WHERE pedId = ? FOR UPDATE`,
      [pedidoId]
    );

    if (!pedido) {
      await connection.rollback();
      return { err: 'Pedido no encontrado', errorCode: 404 };
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
    if (error.code === 'ER_SIGNAL_EXCEPTION' || error.sqlMessage) {
      return { err: error.sqlMessage || error.message, errorCode: 400 };
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
    fecha_entrega_estimada: e.fecha_estimada ? new Date(e.fecha_estimada).toLocaleDateString() : null,
    fecha_entrega_real: e.fecha_entrega ? new Date(e.fecha_entrega).toLocaleDateString() : null,
    estado: e.estado,
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