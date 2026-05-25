import { DetalleVentaModel } from '../models/dt_venta.models.js';
import { VentasModel } from '../models/ventas.models.js';
import { AppError } from '../utils/appError.js';
import db from '../config/db.js';

/**
 * Crear un detalle en una venta existente
 */
export const createDetalleService = async (ventaId, body) => {
  const { producto_id, cantidad, precio } = body;

  // Validar que la venta existe
  const venta = await VentasModel.getById(ventaId);
  if (!venta) {
    throw new AppError('Venta no encontrada', 404);
  }

  // Validar que el producto existe
  const [[producto]] = await db.query(
    'SELECT 1 FROM productos WHERE proId = ? LIMIT 1',
    [producto_id]
  );
  if (!producto) {
    throw new AppError(`El producto con ID "${producto_id}" no existe`, 400);
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Generar ID del detalle
    const detalleId = await DetalleVentaModel.generarId(connection);

    // Calcular subtotal
    const subtotal = cantidad * precio;

    // Insertar detalle
    await DetalleVentaModel.create({
      detalle_id: detalleId,
      venta_id: ventaId,
      producto_id,
      cantidad,
      precio,
      subtotal
    }, connection);

    await connection.commit();

    return {
      status: true,
      msg: `Se registró con éxito el detalle de la venta con el ID #${detalleId}`
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Eliminar un detalle de venta
 */
export const deleteDetalleService = async (ventaId, detalleId, usuarioId) => {
  // Validar que la venta existe
  const venta = await VentasModel.getById(ventaId);
  if (!venta) {
    throw new AppError('Venta no encontrada', 404);
  }

  // Validar que el detalle pertenece a la venta
  const pertenece = await DetalleVentaModel.perteneceAVenta(ventaId, detalleId);
  if (!pertenece) {
    throw new AppError('El detalle no pertenece a la venta especificada', 400);
  }

  const eliminado = await DetalleVentaModel.delete(ventaId, detalleId, usuarioId);

  if (!eliminado) {
    throw new AppError('No se pudo eliminar el detalle', 400);
  }

  return {
    status: true,
    msg: 'Detalle eliminado correctamente'
  };
};
