import { getPagosService, createPagoService, rechazarPagoService } from '../services/pagos.service.js';
import { AppError } from '../utils/appError.js';

export const getPagosController = async (req, res, next) => {
  try {
    const { pedido_id, venta_id, pagina = 1, limite = 5 } = req.query;

    const result = await getPagosService({
      pedido_id,
      venta_id,
      pagina: Number(pagina),
      limite: Number(limite),
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en getPagosController:', error);
    next(error instanceof AppError ? error : new AppError('Error interno del servidor', 500));
  }
};

export const createPagoController = async (req, res, next) => {
  try {
    const { pedido_id, venta_id, monto, metodo_pago } = req.body;

    const result = await createPagoService({ pedido_id, venta_id, monto, metodo_pago });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error en createPagoController:', error);
    next(error instanceof AppError ? error : new AppError('Error interno del servidor', 500));
  }
};

export const rechazarPagoController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await rechazarPagoService(id);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en rechazarPagoController:', error);
    next(error instanceof AppError ? error : new AppError('Error interno del servidor', 500));
  }
};
