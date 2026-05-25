import { AppError } from '../utils/appError.js';
import { normalizeEmptyStrings } from '../utils/normalizacion_datos.js';
import {
  getVentasService,
  getVentaByIdService,
  createVentaService,
  updateVentaService,
  anularVentaService
} from '../services/ventas.service.js';

export const getVentasController = async (req, res, next) => {
  try {
    const {
      pagina = 1,
      limite = 15,
      fecha_registro,
      fecha_limite_pago,
      cliente
    } = req.query;

    const filtros = {
      fecha_registro,
      fecha_limite_pago,
      cliente
    };

    const result = await getVentasService(pagina, limite, filtros);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en getVentasController:', error);
    next(error instanceof AppError ? error : new AppError('Error interno del servidor', 500));
  }
};

export const getVentaByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await getVentaByIdService(id);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en getVentaByIdController:', error);
    next(error instanceof AppError ? error : new AppError('Error interno del servidor', 500));
  }
};

export const createVentaController = async (req, res, next) => {
  try {
    req.body = normalizeEmptyStrings(req.body);

    const userId = req.user.user_id;

    const result = await createVentaService(req.body, userId);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error en createVentaController:', error);
    if (error.code === 'ER_SIGNAL_EXCEPTION' || error.code === 'ER_BAD_NULL_ERROR') {
      return next(new AppError(error.sqlMessage || error.message, 400));
    }
    next(error instanceof AppError ? error : new AppError('Error interno del servidor', 500));
  }
};

export const updateVentaController = async (req, res, next) => {
  try {
    req.body = normalizeEmptyStrings(req.body);

    const { id } = req.params;

    const result = await updateVentaService(id, req.body);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en updateVentaController:', error);
    next(error instanceof AppError ? error : new AppError('Error interno del servidor', 500));
  }
};

export const anularVentaController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await anularVentaService(id);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en anularVentaController:', error);
    next(error instanceof AppError ? error : new AppError('Error interno del servidor', 500));
  }
};


