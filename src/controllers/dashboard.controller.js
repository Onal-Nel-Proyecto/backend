import { AppError } from '../utils/appError.js';
import { getResumenService } from '../services/dashboard.service.js';

export const getResumenController = async (_req, res, next) => {
  try {
    const result = await getResumenService();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error en getResumenController:', error);
    next(new AppError('Error interno del servidor', 500));
  }
};
