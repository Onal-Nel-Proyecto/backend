import { AppError } from '../utils/appError.js';
import {
  obtenerProveedores,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  deshabilitarProveedor
} from "../services/proveedores.service.js";

export const getProveedores = async (req, res, next) => {
  try {
    const { pagina, limite, prov_nombre, prov_tipo_suministro } = req.query;
    const resultado = await obtenerProveedores(pagina, limite, prov_nombre || null, prov_tipo_suministro || null);
    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    next(new AppError('Error interno del servidor', 500));
  }
};

export const getProveedorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pagina, limite } = req.query;
    const proveedor = await obtenerProveedorPorId(id, pagina, limite);
    if (!proveedor) {
      return next(new AppError('Proveedor no encontrado', 404));
    }
    res.json(proveedor);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    next(new AppError('Error interno del servidor', 500));
  }
};

export const createProveedor = async (req, res, next) => {
  try {
    const proveedorCreado = await crearProveedor(req.body);
    res.status(201).json(proveedorCreado);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    if (error.message.includes('Duplicate')) {
      return next(new AppError('El ID del proveedor ya existe', 400));
    }
    next(new AppError('Error interno del servidor', 500));
  }
};

export const updateProveedor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await actualizarProveedor(id, req.body);
    res.json(resultado);
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    if (error.message === 'Proveedor no encontrado') {
      return next(new AppError(error.message, 404));
    }
    if (error.message === 'No se pudo actualizar el proveedor') {
      return next(new AppError(error.message, 400));
    }
    next(new AppError('Error interno del servidor', 500));
  }
};

export const deleteProveedor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await deshabilitarProveedor(id);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al deshabilitar proveedor:', error);
    if (error.message === 'Proveedor no encontrado') {
      return next(new AppError(error.message, 404));
    }
    if (error.message === 'El proveedor ya se encuentra deshabilitado') {
      return next(new AppError(error.message, 400));
    }
    next(new AppError('Error interno del servidor', 500));
  }
};
