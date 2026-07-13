import { AppError } from '../utils/appError.js';
import { normalizeEmptyStrings } from '../utils/normalizacion_datos.js';
import { actualizarCliente, changeStatusServices, crearCliente, obtenerClientePorId, obtenerClientes } from "../services/clientes.service.js";

export const getClientes = async (req, res, next) => {
  try {
    const { pagina, limite, search, estado } = req.query;
    const filtros = { search, estado };
    const resultado = await obtenerClientes(pagina, limite, filtros);
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
    // console.log(id, cliente);
    
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
    req.body = normalizeEmptyStrings(req.body);
    req.body.user_id = req.user.user_id;
    const resultado = await crearCliente(req.body);
    const { data, tipoOperacion } = resultado;

    const mensaje = tipoOperacion === 'REACTIVADO'
      ? 'Cliente reactivado exitosamente'
      : 'Cliente registrado exitosamente';
      
    res.status(201).json({status: true, msg: mensaje, data: data });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    if (error.message.includes('Ya existe un cliente registrado con ese tipo y número de documento')) {
      return next(new AppError(error.message, 400));
    }
    if (error.message.includes('no existe')) {
      return next(new AppError(error.message, 400));
    }
    // Capturar errores SIGNAL SQLSTATE '45000' del SP sp_registrar_cliente
    if (error.code === 'ER_SIGNAL_EXCEPTION') {
      return next(new AppError(error.sqlMessage, 400));
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
      msg: `El cliente fue ${req.body.estado == 2 ? 'inhabilitado': 'reactivado'}`
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
    req.body = normalizeEmptyStrings(req.body);
    const { id } = req.params;
    const resultado = await actualizarCliente(id, req.body);
    res.json(resultado);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    if (error.message === 'Cliente no encontrado') {
      return next(new AppError(error.message, 404));
    }
    if (error.message.includes('Ya existe un cliente registrado con ese tipo y número de documento')) {
      return next(new AppError(error.message, 400));
    }
    next(new AppError('Error interno del servidor', 500));
  }
};