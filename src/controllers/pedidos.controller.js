import { AppError } from '../utils/appError.js';
import { cancelPedidoService, createNewPedido, getAllEntregasService, getAllPedidosService, getPedidoByIdService, entregarPedidoService, updatePedidoService } from "../services/pedidos.service.js";
import { normalizeEmptyStrings } from "../utils/normalizacion_datos.js";

export const getAllPedidosController = async (req, res, next) => {
  try {
    const {
      pag = 1,
      estado,
      fecha_desde,
      fecha_hasta,
      cliente,
      tipo_pedido,
      estado_pago,
      fecha_entrega_desde,
      fecha_entrega_hasta,
      descripcion
    } = req.query;

    const filtros = { estado, fecha_desde, fecha_hasta, cliente, tipo_pedido, estado_pago, fecha_entrega_desde, fecha_entrega_hasta, descripcion };    

    const result = await getAllPedidosService(pag, filtros);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    next(new AppError('Error interno del servidor', 500));
  }
};

export const createNewPedidoController = async (req, res, next) => {
  try {
    req.body.usuarioId = req.user.user_id;
    req.body = normalizeEmptyStrings(req.body);
    console.log(req.body)
    const result = await createNewPedido(req.body);

    if (result.err) {
      return next(new AppError(result.err, result.errorCode));
    }

    res.status(201).json({
      status: true,
      msg: `Se registro un nuevo pedido con el ID #${result.data.pedido_id}`,
      data: result.data.pedido_id
    });
  } catch (error) {
    console.error(error);
    next(new AppError('Error interno del servidor', 500));
  }
};

export const getPedidoByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getPedidoByIdService(id);
    if (result.err) {
      return next(new AppError(result.err, result.errorCode));
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    next(new AppError('Error interno del servidor', 500));
  }
};

export const updatePedidoController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await updatePedidoService(id, req.body);
    console.log(req.body)

    if (result.err) {
      return next(new AppError(result.err, result.errorCode));
    }

    res.status(200).json({
      status: true,
      msg: "Se actualizó con éxito el pedido"
    });
  } catch (error) {
    console.error(error);
    next(new AppError('Error interno del servidor', 500));
  }
};

export const getAllEntregasController = async (req, res, next) => {
  try {
    const {
      pag = 1,
      cliente,
      fecha_desde,
      fecha_hasta,
      estado,
      mes
    } = req.query;

    const filtros = { cliente, fecha_desde, fecha_hasta, estado, mes };

    const result = await getAllEntregasService(pag, filtros);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    next(new AppError('Error interno del servidor', 500));
  }
};

export const entregarPedidoController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.user_id;
    console.log(usuarioId);
    

    const result = await entregarPedidoService(id, usuarioId);

    if (result.err) {
      return next(new AppError(result.err, result.errorCode));
    }

    res.status(200).json({
      status: true,
      msg: `Pedido #${id} marcado como ENTREGADO`
    });
  } catch (error) {
    console.error(error);
    next(new AppError('Error interno del servidor', 500));
  }
};

export const cancelPedidoController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const usuarioId = req.user.user_id;

    const result = await cancelPedidoService(id, motivo, usuarioId);
    console.log(result)
    if (result.err) {
      return next(new AppError(result.err, result.errorCode));
    }

    res.status(200).json({
      status: true,
      msg: `Se ha cancelado el pedido con el código #${id}`
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_SIGNAL_EXCEPTION') {

      return next(
        new AppError(error.sqlMessage, 400)
      );

    }
    next(new AppError('Error interno del servidor', 500));
  }
};