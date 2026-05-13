import { cancelPedidoService, createNewPedido, getAllPedidosService, getPedidoByIdService, updatePedidoService } from "../services/pedidos.service.js";
import { normalizeEmptyStrings } from "../utils/normalizacion_datos.js";


export const getAllPedidosController = async (req, res) => {
  try {
    const {
      pag = 1,
      estado,
      fecha_desde,
      fecha_hasta,
      cliente,
      tipo_pedido
    } = req.query;

    const filtros = { estado, fecha_desde, fecha_hasta, cliente, tipo_pedido };

    const result = await getAllPedidosService(pag, filtros);

    res.status(200).json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createNewPedidoController = async (req, res) => {
  try {
    req.body.usuarioId = req.user.user_id // asignar el id del usuario al pedido para relacionarlo con el cliente

    req.body = normalizeEmptyStrings(req.body) // normalizar los campos vacios a null para evitar errores de validacion

    const result = await createNewPedido(req.body);

    if (result.err) {
      return res.status(result.errorCode).json({ message: result.err });
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export const getPedidoByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getPedidoByIdService(id);
    if (result.err) {
      return res.status(result.errorCode).json({ message: result.err });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error interno' });
  }
}

export const updatePedidoController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await updatePedidoService(id, req.body);

    if (result.err) {
      return res.status(result.errorCode).json({
        status: false,
        msg: result.err
      });
    }

    return res.status(200).json({
      status: true,
      msg: "Se actualizó con éxito el pedido"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: false,
      msg: "Error interno del servidor"
    });
  }
}


export const cancelPedidoController = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const usuarioId = req.user.user_id; // 👈 viene del auth middleware

    const result = await cancelPedidoService(id, motivo, usuarioId);

    if (result.err) {
      return res.status(result.errorCode).json({
        status: false,
        msg: result.err
      });
    }

    return res.status(200).json({
      status: true,
      msg: `Se ha cancelado el pedido con el código #${id}`
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: false,
      msg: 'Error interno del servidor'
    });
  }
};