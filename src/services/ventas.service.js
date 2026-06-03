import { VentasModel } from '../models/ventas.models.js';
import { ClienteModel } from '../models/cliente.models.js';
import { AppError } from '../utils/appError.js';
import { calculateTotalPages } from '../utils/paginacion.js';
import db from '../config/db.js';

/**
 * Obtener ventas paginadas con filtros
 */
export const getVentasService = async (pagina = 1, limite = 15, filtros = {}) => {
  const paginaActual = parseInt(pagina, 10) || 1;
  const limitePagina = parseInt(limite, 10) || 15;
  const offset = (paginaActual - 1) * limitePagina;

  const [total, rows] = await Promise.all([
    VentasModel.countAll(filtros),
    VentasModel.getAll(filtros, limitePagina, offset)
  ]);

  const data = rows.map(row => ({
    venta_id: String(row.venta_id),
    fecha_registro: row.fecha_registro instanceof Date
      ? row.fecha_registro.toISOString().split('T')[0]
      : row.fecha_registro,
    estado: row.estado,
    total: row.total,
    descuento: row.descuento != null ? Number(row.descuento) : null,
    cliente: {
      cliente_id: String(row.cliente_id),
      cliente_nombres: row.cliente_nombres,
      cliente_apellidos: row.cliente_apellidos
    },
    fecha_limite_pago: row.fecha_limite_pago instanceof Date
      ? row.fecha_limite_pago.toISOString().split('T')[0]
      : (row.fecha_limite_pago || null),
    pagos: {
      total_pagado: Number(row.total_pagado),
      total_pendiente: Number(row.saldo_pendiente)
    },
    pedido_id: row.pedido_id || null
  }));

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
 * Obtener una venta por ID con sus detalles paginados
 */
export const getVentaByIdService = async (id) => {
  const venta = await VentasModel.getById(id);

  if (!venta) {
    throw new AppError('Venta no encontrada', 404);
  }

  // Obtener detalles con paginación (default: página 1, 15 items)
  const detallesLimite = 15;
  const detallesOffset = 0;
  const [totalDetalles, detallesRows] = await Promise.all([
    VentasModel.countDetallesByVentaId(id),
    VentasModel.getDetallesByVentaId(id, detallesLimite, detallesOffset)
  ]);

  const detalles = detallesRows.map(d => ({
    detalle_id: String(d.detalle_id),
    producto: {
      producto_id: String(d.producto_id),
      producto_nombre: d.producto_nombre
    },
    cantidad: d.cantidad,
    precio: Number(d.precio),
    subtotal: Number(d.subtotal)
  }));

  return {
    venta_id: String(venta.venta_id),
    fecha_registro: venta.fecha_registro instanceof Date
      ? venta.fecha_registro.toISOString().split('T')[0]
      : venta.fecha_registro,
    estado: venta.estado,
    total: venta.total,
    descuento: venta.descuento != null ? Number(venta.descuento) : null,
    cliente: {
      cliente_id: String(venta.cliente_id),
      cliente_nombres: venta.cliente_nombres,
      cliente_apellidos: venta.cliente_apellidos
    },
    usuario: {
      user_id: String(venta.user_id),
      user_nombres: venta.user_nombres,
      user_apellidos: venta.user_apellidos
    },
    fecha_limite_pago: venta.fecha_limite_pago instanceof Date
      ? venta.fecha_limite_pago.toISOString().split('T')[0]
      : (venta.fecha_limite_pago || null),
    pedido_id: venta.pedido_id || null,
    detalles: {
      meta: {
        paginas_totales: calculateTotalPages(totalDetalles, detallesLimite),
        pagina_actual: 1,
        total: totalDetalles,
        limite: detallesLimite
      },
      data: detalles
    }
  };
};

/**
 * Crear una nueva venta usando el SP
 */
export const createVentaService = async (body, userId) => {
  const {
    cliente_id,
    pedido_id,
    fecha_limite_pago,
    descuento,
    detalles = [],
    pagos = []
  } = body;

  // Los detalles deben tener al menos un item
  if (!detalles || detalles.length === 0) {
    throw new AppError('Debe proporcionar al menos un detalle de venta', 400);
  }

  // Validar que el cliente existe
  const cliente = await ClienteModel.getById(cliente_id);
  if (!cliente || !cliente.status) {
    throw new AppError('El cliente especificado no existe', 400);
  }

  // Validar que cada producto en los detalles existe
  for (const detalle of detalles) {
    if (!detalle.producto_id) {
      throw new AppError('Cada detalle debe tener un producto_id', 400);
    }
    const [[producto]] = await db.query(
      'SELECT 1 FROM productos WHERE proId = ? LIMIT 1',
      [detalle.producto_id]
    );
    if (!producto) {
      throw new AppError(`El producto con ID "${detalle.producto_id}" no existe`, 400);
    }
  }

  // Determinar pago inicial y método de pago
  let pagoInicial = 0;
  let metodoPago = null;

  if (pagos && pagos.length > 0) {
    const primerPago = pagos[0];
    if (!primerPago.monto || !primerPago.metodo_pago) {
      throw new AppError('Si envía pagos, el monto y método de pago son requeridos', 400);
    }
    pagoInicial = primerPago.monto;
    metodoPago = primerPago.metodo_pago;
  }

  // Mapear detalles al formato del SP: [{ "proId":1, "cantidad":2, "precio":1000 }]
  const detallesSP = detalles.map(d => ({
    proId: d.producto_id,
    cantidad: d.cantidad,
    precio: d.precio
  }));

  // Ejecutar SP
  const result = await VentasModel.create({
    cliente_id,
    usuario_id: userId,
    descuento: descuento ?? 0,
    pedido_id: pedido_id || null,
    fecha_limite_pago: fecha_limite_pago || null,
    pago_inicial: pagoInicial || 0,
    metodo_pago: metodoPago,
    detalles: detallesSP
  });

  return {
    status: true,
    msg: `Se registró con éxito la venta con el ID #${result.venId}`
  };
};

/**
 * Actualizar datos de una venta (descuento, fecha_limite_pago)
 */
export const updateVentaService = async (id, body) => {
  const { descuento, fecha_limite_pago } = body;

  // Verificar que la venta existe
  const venta = await VentasModel.getById(id);
  if (!venta) {
    throw new AppError('Venta no encontrada', 404);
  }

  const data = {};
  if (descuento !== undefined) data.descuento = descuento;
  if (fecha_limite_pago !== undefined) data.fecha_limite_pago = fecha_limite_pago;

  if (Object.keys(data).length === 0) {
    throw new AppError('No hay campos para actualizar', 400);
  }

  const actualizado = await VentasModel.update(id, data);

  if (!actualizado) {
    throw new AppError('No se pudo actualizar la venta', 400);
  }

  return {
    status: true,
    msg: 'Se ha actualizado la venta'
  };
};

/**
 * Anular una venta (cambiar estado a ANULADO)
 */
export const anularVentaService = async (id) => {
  const venta = await VentasModel.getById(id);
  if (!venta) {
    throw new AppError('Venta no encontrada', 404);
  }

  const anulado = await VentasModel.anular(id);

  if (!anulado) {
    throw new AppError('No se pudo anular la venta', 400);
  }

  return {
    status: true,
    msg: 'Se ha anulado la venta correctamente'
  };
};

// ─────────────────────────────────────────────
//  Reportes de ventas
// ─────────────────────────────────────────────

/**
 * Obtener reporte mensual de ventas
 */
export const getReporteVentasMensualService = async (mes, anio) => {
  const mesNum = Number(mes);
  const anioNum = Number(anio);

  if (!mes || !anio) {
    throw new AppError('Los parámetros mes y anio son obligatorios', 400);
  }

  if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
    throw new AppError('El mes debe ser un número entre 1 y 12', 400);
  }

  if (isNaN(anioNum)) {
    throw new AppError('El año debe ser un valor numérico', 400);
  }

  const results = await VentasModel.getReporteVentasMensual(mesNum, anioNum);

  return {
    resumen: results[0]?.[0] ?? {},
    topProductos: results[1] ?? [],
    ventasPorDia: results[2] ?? []
  };
};

/**
 * Obtener reporte de ventas por periodo
 */
export const getReporteVentasPeriodoService = async (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) {
    throw new AppError('Los parámetros fechaInicio y fechaFin son obligatorios', 400);
  }

  const inicio = new Date(fechaInicio + 'T00:00:00');
  const fin = new Date(fechaFin + 'T00:00:00');

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    throw new AppError('Las fechas deben tener formato YYYY-MM-DD', 400);
  }

  if (inicio > fin) {
    throw new AppError('La fecha de inicio no puede ser mayor que la fecha fin', 400);
  }

  const diffDays = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
  const maxDays = 366;

  if (diffDays > maxDays) {
    throw new AppError(
      `El periodo del reporte no puede superar un año (máximo ${maxDays} días). El rango enviado es de ${diffDays} días.`,
      400
    );
  }

  const results = await VentasModel.getReporteVentasPeriodo(fechaInicio, fechaFin);

  return {
    resumen: results[0]?.[0] ?? {},
    topProductos: results[1] ?? [],
    ventasPorDia: results[2] ?? []
  };
};


