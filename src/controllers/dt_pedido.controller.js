import { actualizarDetalleService, crearDetalle as crear, eliminarDetalle as eliminar } from '../services/dt_pedido.service.js';
// import {  ProductoModel  } from '../models/producto.models.js'; 
// import db from '../config/db.js'
export const crearDetalle = async (req, res) => {
  try {
    const { id: pedidoId } = req.params;
    const body = req.body;

    const resultado = await crear(pedidoId, body);

    return res.status(201).json({
      status: true,
      msg: 'Detalle de pedido registrado correctamente',
      data: { detalle_id: resultado.detalleId }
    });
  } catch (error) {
    console.error('Error en crearDetalle:', error);
    // console.log(await new ProductoModel(await db.getConnection()).existe("PR001"))
    // El servicio ya envuelve errores de negocio con mensaje descriptivo
    const mensaje = error.message || 'Error interno del servidor';
    return res.status(500).json({
      status: false,
      msg: mensaje
    });
  }
};

export const eliminarDetalle = async (req, res) => {
  try {
    const { id: pedidoId, id_detalle: detalleId } = req.params;

    await eliminar(pedidoId, detalleId);

    return res.json({
      status: true,
      msg: 'Detalle de pedido eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en eliminarDetalle:', error);
    const mensaje = error.message || 'Error interno del servidor';
    return res.status(500).json({
      status: false,
      msg: mensaje
    });
  }
};

export const actualizarDetalle = async (req, res) => {
  try {
    const { id: pedidoId, id_detalle: detalleId } = req.params;
    const body = req.body;

    const resultado = await actualizarDetalleService(pedidoId, detalleId, body);

    return res.json({
      status: true,
      msg: 'Detalle de pedido actualizado exitosamente',
      data: resultado
    });
  } catch (error) {
    console.error('Error en actualizarDetalle:', error);
    const mensaje = error.message || 'Error interno del servidor';
    return res.status(500).json({
      status: false,
      msg: mensaje
    });
  }
};