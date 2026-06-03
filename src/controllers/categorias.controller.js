import { AppError } from '../utils/appError.js';
import {
  getAllCategoriasService,
  getCategoriaByIdService,
  createCategoriaService,
  updateCategoriaService,
  changeCategoriaEstadoService
} from '../services/categorias.service.js';

// Obtener todas las categorías
export const ctlGetAllCategorias = async (req, res, next) => {
  try {
    const { nombre, estado } = req.query;
    const result = await getAllCategoriasService({ nombre, estado });
    if (result.err) return next(new AppError(result.err, result.errorCode));
    res.status(200).json({ status: true, data: result.data });
  } catch (error) {
    next(new AppError('Error interno del servidor', 500));
  }
};

// Obtener categoría por ID
export const ctlGetCategoriaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getCategoriaByIdService({ id });
    if (result.err) return next(new AppError(result.err, result.errorCode));
    res.status(200).json({ status: true, data: result.data });
  } catch (error) {
    next(new AppError('Error interno del servidor', 500));
  }
};

// Crear categoría
export const ctlCreateCategoria = async (req, res, next) => {
  try {
    const { catNom, catDesc, catEst } = req.body;
    const result = await createCategoriaService({ catNom, catDesc, catEst });
    if (result.err) return next(new AppError(result.err, result.errorCode));
    res.status(201).json({ status: true, msg: result.msg, id: result.id });
  } catch (error) {
    next(new AppError('Error interno del servidor', 500));
  }
};

// Actualizar categoría
export const ctlUpdateCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { catNom, catDesc, catEst } = req.body;
    const result = await updateCategoriaService({ id, catNom, catDesc, catEst });
    if (result.err) return next(new AppError(result.err, result.errorCode));
    res.status(200).json({ status: true, msg: result.msg });
  } catch (error) {
    next(new AppError('Error interno del servidor', 500));
  }
};

// Cambiar estado de categoría
export const ctlChangeCategoriaEstado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const result = await changeCategoriaEstadoService({ id, estado });
    if (result.err) return next(new AppError(result.err, result.errorCode));
    res.status(200).json({ status: true, msg: result.msg });
  } catch (error) {
    next(new AppError('Error interno del servidor', 500));
  }
};
