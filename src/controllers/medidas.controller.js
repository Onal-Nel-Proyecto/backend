import { AppError } from '../utils/appError.js';
import {
  getAllMedidasService,
  getMedidaByIdService,
  createMedidaService,
  updateMedidaService,
  changeMedidaEstadoService
} from '../services/medidas.service.js';

// Obtener todas las medidas
export const ctlGetAllMedidas = async (req, res, next) => {
  try {
    const { nombre, estado } = req.query;
    const result = await getAllMedidasService({ nombre, estado });
    if (result.err) return next(new AppError(result.err, result.errorCode));
    res.status(200).json({ status: true, data: result.data });
  } catch (error) {
    next(new AppError('Error interno del servidor', 500));
  }
};

// Obtener medida por ID
export const ctlGetMedidaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getMedidaByIdService({ id });
    if (result.err) return next(new AppError(result.err, result.errorCode));
    res.status(200).json({ status: true, data: result.data });
  } catch (error) {
    next(new AppError('Error interno del servidor', 500));
  }
};

// Crear medida
export const ctlCreateMedida = async (req, res, next) => {
  try {
    const { medNom, medDesc, medEst } = req.body;
    const result = await createMedidaService({ medNom, medDesc, medEst });
    if (result.err) return next(new AppError(result.err, result.errorCode));
    res.status(201).json({ status: true, msg: result.msg, id: result.id });
  } catch (error) {
    next(new AppError('Error interno del servidor', 500));
  }
};

// Actualizar medida
export const ctlUpdateMedida = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { medNom, medDesc, medEst } = req.body;
    const result = await updateMedidaService({ id, medNom, medDesc, medEst });
    if (result.err) return next(new AppError(result.err, result.errorCode));
    res.status(200).json({ status: true, msg: result.msg });
  } catch (error) {
    next(new AppError('Error interno del servidor', 500));
  }
};

// Cambiar estado de medida
export const ctlChangeMedidaEstado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const result = await changeMedidaEstadoService({ id, estado });
    if (result.err) return next(new AppError(result.err, result.errorCode));
    res.status(200).json({ status: true, msg: result.msg });
  } catch (error) {
    next(new AppError('Error interno del servidor', 500));
  }
};
