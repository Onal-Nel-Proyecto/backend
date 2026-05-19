import { FacturaModel } from '../models/factura.models.js';
import { PagosModel } from '../models/pagos.models.js';
import { AppError } from '../utils/appError.js';
import { generarPDF, generarHTMLFactura } from '../utils/pdfGenerator.js';

/** Datos fijos de la empresa (provisional) */
const EMPRESA = {
  nombre: 'Confecciones Onal & Nel',
  eslogan: 'Calidad y confianza en cada prenda',
  NIT: '123456789-0',
  direccion: 'Av. Principal #123, Santa Lucia',
  telefono: '+51 987 654 321',
};

/** Obtener datos completos de la factura */
export const getFacturaService = async (venta_id) => {
  const factura = await FacturaModel.getFacturaByVenta(venta_id);

  if (!factura) {
    throw new AppError('No se encontró una factura para esta venta', 404);
  }

  const detalles = await FacturaModel.getDetalles(venta_id);
  const metodosPago = await FacturaModel.getMetodosPago(venta_id);
  const resumen = await PagosModel.getResumenVenta(venta_id);

  return {
    // datos de la empresa
    ...EMPRESA,

    // datos de la factura
    factura_id: factura.factura_id,
    fecha_emision: factura.fecha_emision,
    estado: factura.estado,

    // datos del cliente
    nombres: factura.nombres,
    apellidos: factura.apellidos,
    documento: factura.cliente_id,
    direccion: factura.direccion || null,
    telefono: factura.telefono || null,
    correo: factura.correo || null,

    // datos de la venta
    pedido_id: factura.pedido_id || null,
    venta_id: factura.venta_id,
    venta_estado: factura.venta_estado,
    pedido_estado: factura.pedido_estado || null,

    // detalle de productos
    detalles: detalles.map(d => ({
      id_detalle: d.detalle_id,
      nombre_producto: d.producto_nombre,
      precio_unitario: d.precio_unitario,
      cantidad: d.cantidad,
      subtotal: d.subtotal,
    })),

    // totales y pagos
    descuento: factura.descuento || null,
    subtotal: factura.subtotal,
    abono_realizado: resumen ? resumen.total_pagado : 0,
    total_pendiente: resumen ? resumen.faltante : factura.subtotal,
    metodo_pago: metodosPago,
  };
};

/** Crear una nueva factura */
export const createFacturaService = async (venta_id) => {
  // Validar que la venta exista
  const venta = await FacturaModel.validarVenta(venta_id);
  if (!venta) {
    throw new AppError('La venta especificada no existe', 404);
  }

  // Validar que la venta no tenga ya una factura
  const existente = await FacturaModel.validarFacturaExistente(venta_id);
  if (existente) {
    throw new AppError('Esta venta ya tiene una factura registrada', 400);
  }

  const result = await FacturaModel.create(venta_id);

  return {
    status: true,
    msg: `Factura registrada correctamente para la venta #${venta_id} con ID #${result.factura_id}`,
    data: {
      factura_id: result.factura_id,
      venta_id,
    },
  };
};

/** Anular una factura */
export const anularFacturaService = async (factura_id) => {
  const factura = await FacturaModel.getFacturaById(factura_id);
  if (!factura) {
    throw new AppError('Factura no encontrada', 404);
  }

  if (factura.estado === 'ANULADO') {
    throw new AppError('La factura ya se encuentra anulada', 400);
  }

  const result = await FacturaModel.anular(factura_id);

  if (!result) {
    throw new AppError('No se pudo anular la factura', 500);
  }

  return {
    status: true,
    msg: `Factura #${factura_id} anulada correctamente`,
  };
};

/** Generar PDF de factura */
export const generarPdfFacturaService = async (venta_id) => {
  let data;

  // Intentar obtener la factura existente
  try {
    data = await getFacturaService(venta_id);

    // Si está anulada, intentar crear una nueva
    if (data.estado === 'ANULADO') {
      await createFacturaService(venta_id);
      data = await getFacturaService(venta_id);
    }
  } catch (error) {
    // Si no existe (404), crearla automáticamente
    if (error instanceof AppError && error.statusCode === 404) {
      await createFacturaService(venta_id);
      data = await getFacturaService(venta_id);
    } else {
      throw error;
    }
  }

  const html = generarHTMLFactura(data);
  const pdfBuffer = await generarPDF(html);

  const filename = `FACTURA-${data.factura_id}.pdf`;

  return {
    pdfBuffer,
    filename,
    factura_id: data.factura_id,
  };
};
