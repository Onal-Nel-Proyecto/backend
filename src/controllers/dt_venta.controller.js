import { AppError } from '../utils/appError.js';
import {
  createDetalleService,
  deleteDetalleService
} from '../services/dt_venta.service.js';

export const createDetalleController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await createDetalleService(id, req.body);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error en createDetalleController:', error);
    next(error instanceof AppError ? error : new AppError('Error interno del servidor', 500));
  }
};

export const deleteDetalleController = async (req, res, next) => {
  try {
    const { id, id_detalle } = req.params;
    const usuarioId = req.user.user_id;

    const result = await deleteDetalleService(id, id_detalle, usuarioId);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en deleteDetalleController:', error);
    next(error instanceof AppError ? error : new AppError('Error interno del servidor', 500));
  }
};
