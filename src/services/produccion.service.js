import { AppError } from '../utils/appError.js';
import { DetallePedidoModel } from "../models/dt_pedido.models.js";
import { PedidoModel } from "../models/pedido.models.js";
import db from "../config/db.js";
import { ProduccionModel } from "../models/produccion.models.js";
import { ProductoModel } from "../models/producto.models.js";
import { createMovimientoService } from './movimientos.service.js';

export const createNewProduction = async (
  pedidoId,
  detalleId,
  data
) => {
  const connection = await db.getConnection();

  // 1. Validar pedido
  const pedidoExiste =
    await PedidoModel.getById(pedidoId);

  if (!pedidoExiste) {
    throw new AppError('El pedido no existe', 400);
  }

  // 2. Obtener detalle
  const detalleModel =
    new DetallePedidoModel(connection);

  const detalleActual =
    await detalleModel.getDetalle(detalleId);

  // 3. Validar pertenencia
  if (
    !detalleActual ||
    detalleActual.pedIdFk !== pedidoId
  ) {
    throw new AppError(
      'El detalle no pertenece al pedido especificado', 400
    );
  }

  // 4. Validar producto asociado
  const prodActual =
    await ProductoModel.getProductoById({
      id: detalleActual.proIdFk
    });

  if (!prodActual) {
    throw new AppError(
      'El producto asociado al detalle no existe', 400
    );
  }

  // 5. Validar cantidad ya producida
  const cantidadEnProduccion =
    await ProduccionModel.produccionFaltante(
      detalleId
    );


  // Total ya producido
  const totalProduccion =
    Number(cantidadEnProduccion?.cantidad_total) || 0;

  // 6. Validar límite total
  // console.log(totalProduccion)
  if (
    totalProduccion >= detalleActual.detPedCant
  ) {
    throw new AppError(
      'No se puede registrar más producción para este detalle', 400
    );
  }

  // 7. Validar cantidad disponible
  const cantidadDisponible =
    detalleActual.detPedCant -
    totalProduccion;

  if (data.cantidad > cantidadDisponible) {

    throw new AppError(
      'La cantidad suministrada supera la producción disponible para este detalle', 400
    );

  }

  // 8. Crear producción usando SP
  const prodId =
    await ProduccionModel.create({
      id_detalle: detalleId,
      id_producto: detalleActual.proIdFk,
      cantidad: data.cantidad
    });

  return prodId;

};

// actualizar produccion
export const updateProduction = async (
  produccionId,
  detalleId,
  pedidoId,
  user,
  data
) => {

  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();

    const pedidoExiste = await PedidoModel.getById(pedidoId);

    if (!pedidoExiste) {
      throw new AppError('El pedido no existe', 400);
    }

    const detalleModel = new DetallePedidoModel(connection);

    const detalleActual = await detalleModel.getDetalle(detalleId);

    if (!detalleActual || detalleActual.pedIdFk !== pedidoId) {
      throw new AppError('El detalle no pertenece al pedido especificado', 400);
    }

    // const produccionModel = new ProduccionModel(connection);

    const produccionActual = await ProduccionModel.getById(produccionId);

    if (!produccionActual[0]) {
      throw new AppError('La producción no existe', 400);
    }

    //  5. Validar pertenencia al detalle
    if (produccionActual[0].detPedIdFk !== detalleId) {
      throw new AppError('La producción no pertenece al detalle especificado', 400);
    }

    if (
      produccionActual[0].estado === 'TERMINADO'
    ) {
      throw new AppError(
        'La producción ya está terminada', 400
      );
    }

    const stockProducto = await ProductoModel.getProductoById({ id: produccionActual[0].proIdFk })


    // 2. Actualizar producción
    await ProduccionModel.update(
      produccionId,
      data
    );

    // ===================================
    // CAMBIO DE ESTADO PEDIDO
    // ===================================

    if (data.estado !== undefined) {
      data.estado = data.estado.toUpperCase()
      // Obtener pedido relacionado

      // ===============================
      // PRODUCCIÓN EN PROCESO
      // ===============================
      // console.log(pedidoExiste[0].estado)

      if (
        data.estado === 'EN PROCESO' &&
        pedidoExiste[0].estado === 'PENDIENTE'
      ) {

        // const base =
        //   console.log(base)
        await PedidoModel.updateStatus(
          {
            pedidoId: pedidoExiste[0].id,
            usu_id: user,
            estado: data.estado
          }, connection
        );

      }
      
      const produccionesPendientes =
        await ProduccionModel.countAllByPedido(
          pedidoExiste[0].id
        );
      // ===============================
      // PRODUCCIÓN TERMINADA
      // ===============================

      if (data.estado === 'TERMINADO') {
        // console.log(stockProducto.proStock)
        // 1. Aumentar stock producto (consulta directa porque updateProducto no maneja stock)
        await db.query(
          'UPDATE productos SET proStock = ? WHERE proId = ?',
          [stockProducto.stock + produccionActual[0].cantidad, produccionActual[0].proIdFk]
        );

        await createMovimientoService({
          tipoMov: 'PRODUCCION',
          tipoSuministro: 'PRODUCTO',
          referenciaID: produccionActual[0].proIdFk,
          cantidad: produccionActual[0].cantidad,
          usuIdFk: user,
          stockAnterior: stockProducto.stock,
          stockActual: stockProducto.stock + produccionActual[0].cantidad,
          motivo: `Producción #${produccionActual[0].prodId} completada`
        })


        // 2. Verificar si TODAS las producciones
        // del pedido están terminadas

        // console.log(produccionesPendientes)
        // console.log(produccionesPendientes)
        // Si no quedan pendientes
        if (
          produccionesPendientes.activas === 0 &&
          produccionesPendientes.cantidad_terminada >= produccionesPendientes.cantidad_solicitada
        ) {
          console.log('ENTRO EN TERMINADO');
          
          await PedidoModel.updateStatus(
            {
              pedidoId: pedidoExiste[0].id,
              usu_id: user,
              estado: data.estado,
              motivo: 'Toda la producción del pedido ha sido completada'
            },
            connection
          );

        }

      }

      // ===============================
      // PRODUCCIÓN CANCELADA
      // ===============================

      if (data.estado === 'CANCELADO' &&
        pedidoExiste[0].estado === 'EN PROCESO') {

        if (
          produccionesPendientes.activas === 0 &&
          produccionesPendientes.terminadas === 0 &&
          produccionesPendientes.canceladas > 0
        ) {
          console.log('ENTRO A CONDICCION DE CANCELAR PRODUCCION')
          await PedidoModel.updateStatus({
            pedidoId: pedidoExiste[0].id,
            usu_id: user,
            estado: 'PENDIENTE',
            motivo: "Toda la produccion fue cancelada, se regresa a pendiente"
          }, connection);

        }

      }

    }

    await connection.commit();

  } catch (error) {

    await connection.rollback();
    throw error;

  } finally {

    connection.release();

  }

};

// eliminar produccion
export const deleteProduction = async (pedidoId, detalleId, produccionId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    const detalleModel = new DetallePedidoModel(connection);
    // const produccionModel = new ProduccionModel(connection);

    // 1. Validar pedido
    const pedidoExiste = await PedidoModel.getById(pedidoId);

    if (!pedidoExiste) {
      throw new AppError('El pedido no existe', 400);
    }

    // 2. Validar detalle
    const detalleActual = await detalleModel.getDetalle(detalleId);

    if (!detalleActual) {
      throw new AppError('El detalle del pedido no existe', 400);
    }

    // 3. Validar pertenencia al pedido
    if (detalleActual.pedIdFk !== pedidoId) {
      throw new AppError('El detalle no pertenece al pedido especificado', 400);
    }

    // 4. Validar producción
    const produccionActual = await ProduccionModel.getById(produccionId);

    if (!produccionActual[0]) {
      throw new AppError('La producción no existe', 400);
    }

    // 5. Validar pertenencia al detalle
    if (produccionActual[0].detPedIdFk !== detalleId) {
      throw new AppError('La producción no pertenece al detalle especificado', 400);
    }

    // 6. Evitar eliminar producción terminada
    if (produccionActual[0].estado === 'TERMINADO') {
      throw new AppError('No se puede eliminar una producción terminada', 400);
    }

    // 7. Eliminar producción
    const result = await ProduccionModel.delete(produccionId);

    // 8. Validar eliminación
    if (!result || result.affectedRows === 0) {
      throw new Error('No se pudo eliminar la producción');
    }

    await connection.commit();

    return result;

  } catch (error) {

    await connection.rollback();
    throw error;

  } finally {

    connection.release();

  }
};