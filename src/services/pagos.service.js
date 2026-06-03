import { PagosModel } from '../models/pagos.models.js';
import { AppError } from '../utils/appError.js';

/** Obtener pagos con meta y resumen */
export const getPagosService = async ({ pedido_id, venta_id, pagina = 1, limite = 5 }) => {
  console.log(pedido_id);
  
  const data = await PagosModel.getPagos({ pedido_id, venta_id, pagina, limite });
  const total = await PagosModel.countPagos({ pedido_id, venta_id });

  let resumen = null;
  if (pedido_id) {
    resumen = await PagosModel.getResumenPedido(pedido_id);
  } else if (venta_id) {
    resumen = await PagosModel.getResumenVenta(venta_id);
  }
  // console.log(data);
  
  return {
    meta: {
      paginas_totales: Math.ceil(total / limite) || 1,
      pagina_actual: Number(pagina),
      total,
      limite: Number(limite),
    },
    resumen: resumen
      ? {
          total: resumen.total,
          total_pagado: resumen.total_pagado,
          faltante: resumen.faltante,
        }
      : { total: 0, total_pagado: 0, faltante: 0 },
    data,
  };
};

/** Crear un nuevo pago */
export const createPagoService = async ({ pedido_id, venta_id, monto, metodo_pago }) => {
  // Validar que al menos uno exista
  if (!pedido_id && !venta_id) {
    throw new AppError('Debe proporcionar un pedido o una venta para registrar el pago', 400);
  }

  // Validar pedido si se envía
  if (pedido_id) {
    const pedido = await PagosModel.validarPedido(pedido_id);
    if (!pedido) {
      throw new AppError('El pedido no existe', 404);
    }
    if (pedido.pedEst?.toUpperCase() === 'CANCELADO') {
      throw new AppError('No se pueden registrar pagos en un pedido cancelado', 400);
    }
  }

  // Validar venta si se envía
  if (venta_id) {
    const venta = await PagosModel.validarVenta(venta_id);
    if (!venta) {
      throw new AppError('La venta no existe', 404);
    }
  }

  // Validar monto contra totales
  if (pedido_id) {
    const resumen = await PagosModel.getResumenPedido(pedido_id);
    if (resumen && monto > resumen.faltante) {
      throw new AppError('El monto supera el saldo pendiente del pedido', 400);
    }
  }
  if (venta_id) {
    const resumen = await PagosModel.getResumenVenta(venta_id);
    if (resumen && monto > resumen.faltante) {
      throw new AppError('El monto supera el saldo pendiente de la venta', 400);
    }
  }

  const result = await PagosModel.create({ pedido_id, venta_id, monto, metodo_pago });

  const entidad = pedido_id ? 'pedido' : 'venta';
  const entidadId = pedido_id || venta_id;

  return {
    status: true,
    msg: `Se registró un nuevo pago a ${entidad} con el ID #${entidadId}`,
    data: { pago_id: result.insertId },
  };
};

/** Rechazar un pago */
export const rechazarPagoService = async (pago_id) => {
  const result = await PagosModel.rechazar(pago_id);
  if (!result) {
    throw new AppError('Pago no encontrado o ya fue rechazado', 404);
  }
  return {
    status: true,
    msg: `Pago #${pago_id} rechazado correctamente`,
  };
};
