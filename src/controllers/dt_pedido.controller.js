import { AppError } from '../utils/appError.js';
import { actualizarDetalleService, crearDetalle as crear, eliminarDetalle as eliminar } from '../services/dt_pedido.service.js';

export const crearDetalle = async (req, res, next) => {
  try {
    const { id: pedidoId } = req.params;
    const body = req.body;
    body.user_id = req.user.user_id

    const resultado = await crear(pedidoId, body);

    return res.status(201).json({
      status: true,
      msg: 'Detalle de pedido registrado correctamente',
      data: { detalle_id: resultado.detalleId }
    });
  } catch (error) {
    console.error('Error en crearDetalle:', error);
    next(new AppError(error.message || 'Error interno del servidor', 500));
  }
};

export const eliminarDetalle = async (req, res, next) => {
  try {
    const { id: pedidoId, id_detalle: detalleId } = req.params;

    await eliminar(pedidoId, detalleId, req.user.user_id);

    return res.json({
      status: true,
      msg: 'Detalle de pedido eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en eliminarDetalle:', error);
    next(new AppError(error.message || 'Error interno del servidor', 500));
  }
};

export const actualizarDetalle = async (req, res, next) => {
  try {
    const { id: pedidoId, id_detalle: detalleId } = req.params;
    const body = req.body;
    body.user_id = req.user.user_id
    console.log(body.user_id);
    


    const resultado = await actualizarDetalleService(pedidoId, detalleId, body);
    if (resultado.err) {
      return next(new AppError(resultado.err, resultado.errorCode));
    }
    return res.json({
      status: true,
      msg: 'Detalle de pedido actualizado exitosamente',
      data: resultado
    });
  } catch (error) {
    console.error('Error en actualizarDetalle:', error);
    next(new AppError(error.message || 'Error interno del servidor', 500));
  }
};