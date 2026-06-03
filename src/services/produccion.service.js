import { DetallePedidoModel } from "../models/dt_pedido.models.js";
import { PedidoModel } from "../models/pedido.models.js";
import db from "../config/db.js";
import { ProduccionModel } from "../models/produccion.models.js";
import { ProductoModel } from "../models/producto.models.js";

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
    throw new Error('El pedido no existe');
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
    throw new Error(
      'El detalle no pertenece al pedido especificado'
    );
  }

  // 4. Validar producto asociado
  const prodActual =
    await ProductoModel.getProductoById({
      id: detalleActual.proIdFk
    });

  if (!prodActual) {
    throw new Error(
      'El producto asociado al detalle no existe'
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
    throw new Error(
      'No se puede registrar más producción para este detalle'
    );
  }

  // 7. Validar cantidad disponible
  const cantidadDisponible =
    detalleActual.detPedCant -
    totalProduccion;

  if (data.cantidad > cantidadDisponible) {

    throw new Error(
      'La cantidad suministrada supera la producción disponible para este detalle'
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
      throw new Error('El pedido no existe');
    }

    const detalleModel = new DetallePedidoModel(connection);

    const detalleActual = await detalleModel.getDetalle(detalleId);

    if (!detalleActual || detalleActual.pedIdFk !== pedidoId) {
      throw new Error('El detalle no pertenece al pedido especificado');
    }

    // const produccionModel = new ProduccionModel(connection);

    const produccionActual = await ProduccionModel.getById(produccionId);

    if (!produccionActual[0]) {
      throw new Error('La producción no existe');
    }

    //  5. Validar pertenencia al detalle
    if (produccionActual[0].detPedIdFk !== detalleId) {
      throw new Error('La producción no pertenece al detalle especificado');
    }

    if (
      produccionActual[0].estado === 'TERMINADO'
    ) {
      throw new Error(
        'La producción ya está terminada'
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
          }
        );

      }

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

        // 2. Verificar si TODAS las producciones
        // del pedido están terminadas

        const produccionesPendientes =
          await ProduccionModel.countPendingByPedido(
            pedidoExiste[0].id
          );
        console.log(produccionesPendientes)
          // console.log(produccionesPendientes)
        // Si no quedan pendientes
        if (produccionesPendientes === 0) {

          await PedidoModel.updateStatus(
            {
              pedidoId: pedidoExiste[0].id,
              usu_id: user,
              estado: data.estado
            }
          );

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
      throw new Error('El pedido no existe');
    }

    // 2. Validar detalle
    const detalleActual = await detalleModel.getDetalle(detalleId);

    if (!detalleActual) {
      throw new Error('El detalle del pedido no existe');
    }

    // 3. Validar pertenencia al pedido
    if (detalleActual.pedIdFk !== pedidoId) {
      throw new Error('El detalle no pertenece al pedido especificado');
    }

    // 4. Validar producción
    const produccionActual = await ProduccionModel.getById(produccionId);

    if (!produccionActual[0]) {
      throw new Error('La producción no existe');
    }

    // 5. Validar pertenencia al detalle
    if (produccionActual[0].detPedIdFk !== detalleId) {
      throw new Error('La producción no pertenece al detalle especificado');
    }

    // 6. Evitar eliminar producción terminada
    if (produccionActual[0].estado === 'TERMINADO') {
      throw new Error('No se puede eliminar una producción terminada');
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