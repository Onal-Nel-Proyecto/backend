import { AppError } from '../utils/appError.js';
import { getResumenService, getPedidosDashboardService } from '../services/dashboard.service.js';

export const getResumenController = async (_req, res, next) => {
  try {
    const result = await getResumenService();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error en getResumenController:', error);
    next(new AppError('Error interno del servidor', 500));
  }
};

// ─────────────────────────────────────────────
//  Dashboard de Pedidos
// ─────────────────────────────────────────────
export const getPedidosDashboardController = async (_req, res, next) => {
  try {
    const result = await getPedidosDashboardService();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error en getPedidosDashboardController:', error);
    next(new AppError('Error interno del servidor', 500));
  }
};
