import { AppError } from '../utils/appError.js';
import { actualizarCliente, changeStatusServices, crearCliente, obtenerClientePorId, obtenerClientes } from "../services/clientes.service.js";

export const getClientes = async (req, res, next) => {
  try {
    const { pagina, limite } = req.query;
    const resultado = await obtenerClientes(pagina, limite);
    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    next(new AppError('Error interno del servidor', 500));
  }
};

export const getClienteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cliente = await obtenerClientePorId(id);
    if (!cliente) {
      return next(new AppError('Cliente no encontrado', 404));
    }
    res.json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    next(new AppError('Error interno del servidor', 500));
  }
};

export const createCliente = async (req, res, next) => {
  try {
    req.body.user_id = req.user.user_id;
    const clienteCreado = await crearCliente(req.body);
    res.status(201).json(clienteCreado);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    if (error.message.includes('no existe')) {
      return next(new AppError(error.message, 400));
    }
    next(new AppError('Error interno del servidor', 500));
  }
};

export const changeStatus = async (req, res, next) => {
  try {
    req.body.id = req.params.id;
    await changeStatusServices(req.body);
    res.status(200).json({
      status: true,
      msg: "El cliente fue eliminado"
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    if (error.message.includes('no existe')) {
      return next(new AppError(error.message, 400));
    }
    next(new AppError('Error interno del servidor', 500));
  }
};

export const updateCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await actualizarCliente(id, req.body);
    res.json(resultado);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    if (error.message === 'Cliente no encontrado') {
      return next(new AppError(error.message, 404));
    }
    next(new AppError('Error interno del servidor', 500));
  }
};