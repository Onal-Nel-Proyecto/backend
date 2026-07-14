import { DetallePedidoModel } from '../models/dt_pedido.models.js';
import db from "../config/db.js";
import { PedidoModel } from '../models/pedido.models.js';
import { ProductoModel } from '../models/producto.models.js';
import { ProduccionModel } from '../models/produccion.models.js';

export const getDetallePedidoByIdPedido = async (id_pedido) => {
  const rows = await DetallePedidoModel.getDetallesByPedidoId(id_pedido);

  if (!rows || rows.length === 0) {
    return { err: 'No se encontraron detalles para este pedido', errorCode: 404 };
  }

  const detallesMap = {};

  for (const e of rows) {

    // 🔹 si no existe el detalle lo creamos
    if (!detallesMap[e.detPedId]) {
      detallesMap[e.detPedId] = {
        detalle_id: e.detPedId,
        producto: {
          producto_id: e.proId,
          nombre: e.proNom,
          precio: e.proPreUni,
          categoria: e.proCatFk,
          genero: e.proGen,
          tipoPrenda: e.proTipPre,
          talla: e.proTall
        },
        observacion: e.pedObs,
        cantidad: e.detPedCant,
        medidas: [],
        in_produccion: []
      };
    }

    // 🔹 agregar medida (evitar duplicados)
    if (e.medId) {
      const existeMedida = detallesMap[e.detPedId].medidas.some(
        m => m.medida_id === e.medId
      );

      if (!existeMedida) {
        detallesMap[e.detPedId].medidas.push({
          medida_id: e.medId,
          medida_nombre: e.medNom,
          medida_valor: e.detPedMedVal
        });
      }
    }

    // 🔹 agregar producción (evitar duplicados)
    if (e.prodId) {
      const existeProd = detallesMap[e.detPedId].in_produccion.some(
        p => p.produccion_id === e.prodId
      );

      if (!existeProd) {
        detallesMap[e.detPedId].in_produccion.push({
          produccion_id: e.prodId,
          cantidad: e.cantidad,
          estado: e.estado,
          fecha_inicio: e.fecha_inicio != null ? e.fecha_inicio.toISOString().split('T')[0] : e.fecha_inicio,
          fecha_fin: e.fecha_fin != null ? e.fecha_fin.toISOString().split('T')[0] : e.fecha_fin
        });
      }
    }
  }

  Object.values(detallesMap).forEach(detalle => {
  detalle.in_produccion.sort((a, b) => {
    const orden = {
      'PENDIENTE': 1,
      'EN PROCESO': 2,
      'TERMINADO': 3,
      'CANCELADO': 4
    };

    return orden[a.estado] - orden[b.estado];
  });
});

  return {
    data: Object.values(detallesMap)
  };
};

/**
 * Crea un detalle de pedido asociado a un pedido existente.
 *
 * @param {string} pedidoId - ID del pedido (params)
 * @param {object} data - Cuerpo de la petición
 * @returns {Promise<{detalleId: string}>} ID del detalle generado
 */
export const crearDetalle = async (pedidoId, data) => {
  const connection = await db.getConnection();
  // console.log('Connection obtained:', typeof connection); 
  try {
    await connection.beginTransaction();

    // 1. Verificar que el pedido existe
    const pedidoExiste = await PedidoModel.getById(pedidoId);
    if (!pedidoExiste) {
      throw new Error('El pedido no existe');
    }
    if (pedidoExiste[0].estado === "ENTREGADO") return { err: 'No se pueden agregar detalles a un pedido entregado', errorCode: 400 };
    // 2. Determinar producto_id
    let productoId;
    if (data.producto_id) {
      // Producto existente: validar que exista
      const productoExiste = await ProductoModel.getProductoById({ id: data.producto_id });
      if (!productoExiste) {
        throw new Error('El producto especificado no existe');
      }
      productoId = data.producto_id;
    } else if (data.producto) {
      // Crear nuevo producto (createProducto genera ID internamente vía SP)
      const nuevoProductoId = await ProductoModel.createProducto({
        nombre: data.producto.nombre,
        precioUnitario: data.producto.precio || data.producto.precioUnitario || 0,
        descripcion: data.producto.descripcion,
        genero: data.producto.genero,
        categoriaId: data.producto.categoriaId,
        tipoPrenda: data.producto.tipoPrenda,
        tipoProducto: 'PERSONALIZADO',
        umbralMinimo: data.producto.umbralMinimo,
        talla: data.producto.talla,
        estado: 3
      });
      productoId = nuevoProductoId;
    } else {
      throw new Error('Se requiere producto_id o producto para crear el detalle');
    }



    // 3. Generar ID del detalle usando procedimiento almacenado
    const detallePedidoModel = new DetallePedidoModel(connection);
    const detalleId = await detallePedidoModel.generarId();
    if (!detalleId) {
      throw new Error('No se pudo generar el ID del detalle');
    }

    // 4. Insertar detalle_pedido
    const detalleData = {
      detalleId,
      pedidoId,
      productoId,
      observacion: data.observacion || null,
      cantidad: data.cantidad
    };
    // console.log(detalleData);

    await detallePedidoModel.insertarDetalle(detalleData);

    // 5. Insertar medidas relacionadas (tabla intermedia)
    if (data.medidas && data.medidas.length > 0) {
      for (const medida of data.medidas) {
        await detallePedidoModel.insertarMedidaDetalle({
          detalleId,
          medidaId: medida.medida_id,
          medidaValor: medida.medida_valor
        });
      }
    }

    if (pedidoExiste[0].estado === "TERMINADO") {
      // console.log(pedidoId, data.user_id, 'EN PROCESO', "Se registro un nuevo detalle al pedido")
      await PedidoModel.updateStatus(
        {
          pedidoId: pedidoId,
          usu_id: data.user_id,
          estado: 'EN PROCESO',
          motivo: "Se registro un nuevo detalle al pedido"
        },
        connection
      )
    }

    // 6. Confirmar transacción
    await connection.commit();

    return { detalleId };
  } catch (error) {
    await connection.rollback();
    throw error; // Será capturado por el controlador
  } finally {
    connection.release(); // Siempre liberar la conexión
  }
};

export const eliminarDetalle = async (pedidoId, detalleId, user_id) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Verificar que el pedido existe
    // const pedidoModel = new PedidoModel(connection);
    const pedidoExiste = await PedidoModel.getById(pedidoId);
    if (!pedidoExiste) {
      throw new Error('El pedido no existe');
    }

    if (pedidoExiste[0].estado === "ENTREGADO") return { err: 'No se pueden eleminar un detalle a un pedido entregado', errorCode: 400 };

    const detalleModel = new DetallePedidoModel(connection);

    // 2. Verificar que el detalle pertenezca al pedido
    const detalleData = await detalleModel.getDetalle(detalleId);
    // console.log(detalleData.pedidoId !== pedidoId, detalleData)
    if (!detalleData || detalleData.pedIdFk !== pedidoId) {
      throw new Error('El detalle no pertenece al pedido especificado');
    }

    const productoId = detalleData.proIdFk;

    // 3. Validar que no existan producciones en estado "en curso" o "terminado"
    const produccionesNoPermitidas = await detalleModel.getProduccionesByEstados(
      detalleId,
      ['en proceso', 'terminado']
    );
    if (produccionesNoPermitidas.length > 0) {
      throw new Error('No se puede eliminar el detalle porque tiene producción en proceso o terminada');
    }

    // 4. Eliminar todas las medidas asociadas al detalle
    await detalleModel.deleteMedidas(detalleId);

    // 5. Eliminar las producciones en estado "pendiente" (solo esas)
    await detalleModel.deleteProduccionesPendientes(detalleId);

    // 6. Eliminar el detalle de pedido
    await detalleModel.deleteDetalle(detalleId);

    // 7. Manejar producto asociado
    const producto = await ProductoModel.getProductoById({ id: productoId });
    if (producto && producto.estado === 3) {
      // Cambiar estado a inactivo (3) si es un producto personalizado sin otros detalles
      await ProductoModel.changeEstado({ id: productoId, estado: 3 });
    }
    const produccionesPendientes =
      await ProduccionModel.countAllByPedido(
        pedidoExiste[0].id
      );
    // Si está activo, se conserva sin hacer nada más
    // si el pedido esta en proceso pero se elimina un detalle sin produccion
    if (pedidoExiste[0].estado === "EN PROCESO" && 
      produccionesPendientes.cantidad_terminada >= (produccionesPendientes.cantidad_solicitada - detalleData.detPedCant)) {
      await PedidoModel.updateStatus(
        {
          pedidoId: pedidoId,
          usu_id: user_id,
          estado: 'TERMINADO',
          motivo: "Se elimino el detalle y la produccion del pedido ya estaba finalizada"
        },
        connection
      )
    }
    await connection.commit();
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const actualizarDetalleService = async (pedidoId, detalleId, data) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Verificar pedido existente
    // const pedidoModel = new PedidoModel(connection);
    const pedidoExiste = await PedidoModel.getById(pedidoId);
    if (!pedidoExiste) throw new Error('El pedido no existe');

    if (pedidoExiste[0].estado === "ENTREGADO") return { err: 'No se pueden actualizar el detalle con el pedido en estado entregado', errorCode: 400 };

    const detalleModel = new DetallePedidoModel(connection);

    // 2. Obtener detalle y validar pertenencia al pedido
    const detalleActual = await detalleModel.getDetalle(detalleId);
    if (!detalleActual || detalleActual.pedIdFk !== pedidoId) {
      throw new Error('El detalle no pertenece al pedido especificado');
    }
    
    // 3. Actualizar campos del detalle si se enviaron
    const updatesDetalle = {};
    if (data.cantidad !== undefined) updatesDetalle.cantidad = data.cantidad;
    if (data.observacion !== undefined) updatesDetalle.observacion = data.observacion;
    
    // valida si se actualice la cantidad de detalle no sea menor a la que se encuentra en produccion 
    const total_produccion_det_id = await ProduccionModel.getTotalByDetId(detalleId);
    
    if (data.cantidad !== undefined && data.cantidad < total_produccion_det_id) return {
      err: `La cantidad no puede ser menor a ${total_produccion_det_id}, ya que existen unidades registradas en producción.`,
      errorCode: 404
    };

    if (Object.keys(updatesDetalle).length > 0) {
      await detalleModel.updateDetalle(detalleId, updatesDetalle);
    }

    // 4. Si se envió producto, actualizar el producto asociado (nombre, precio)
    if (data.producto && Object.keys(data.producto).length > 0) {
      // Verificar que el producto existe (ya está asociado)
      const prodActual = await ProductoModel.getProductoById({ id: detalleActual.proIdFk });
      if (!prodActual) throw new Error('El producto asociado al detalle no existe');
      
      if (data.producto.nombre !== undefined || data.producto.precio !== undefined) {
        await ProductoModel.updateProducto({
          id: detalleActual.proIdFk,
          nombre: data.producto.nombre !== undefined ? data.producto.nombre : prodActual.nombre,
          precioUnitario: data.producto.precio !== undefined ? data.producto.precio : prodActual.precioUnitario,
          descripcion: prodActual.descripcion,
          genero: data.producto.genero !== undefined ? data.producto.genero : prodActual.genero,
          categoriaId: data.producto.categoriaId !== undefined ? data.producto.categoriaId : prodActual.categoriaId,
          tipoPrenda: data.producto.tipoPrenda !== undefined ? data.producto.tipoPrenda : prodActual.tipoPrenda,
          umbralMinimo: prodActual.umbralMinimo,
          talla: data.producto.talla !== undefined ? data.producto.talla : prodActual.talla
        }, connection);

        // Recalcular total del pedido si cambió el precio
        if (data.producto.precio !== undefined) {
          await connection.query('CALL sp_recalcular_total_pedido(?)', [pedidoId]);
        }
      }
    }

    // 5. Actualizar medidas si se enviaron
    if (data.medidas && Array.isArray(data.medidas)) {
      // Estrategia: eliminar todas las medidas existentes e insertar las nuevas
      await detalleModel.deleteMedidas(detalleId);
      for (const medida of data.medidas) {
        await detalleModel.insertarMedidaDetalle({
          detalleId,
          medidaId: medida.medida_id,
          medidaValor: medida.medida_valor
        });
      }
    }
    
    console.log(data.user_id)
    const cantidadAnterior = detalleActual.detPedCant;
    const cantidadNueva = data.cantidad;
    if (
      pedidoExiste[0].estado === 'TERMINADO' &&
      cantidadNueva > cantidadAnterior
    ) {
      await PedidoModel.updateStatus(
        {
          pedidoId,
          usu_id: data.user_id,
          estado: 'EN PROCESO',
          motivo: 'Se aumentó la cantidad de un detalle del pedido'
        },
        connection
      );
    }

    const produccionesPendientes =
      await ProduccionModel.countAllByPedido(
        pedidoExiste[0].id, connection
      );
      
    // actualizar el estadoo del pedido si se modifica la cantidad
    if (
      pedidoExiste[0].estado === "EN PROCESO" &&
      produccionesPendientes.activas === 0 &&
      produccionesPendientes.cantidad_terminada >= produccionesPendientes.cantidad_solicitada
    ) {
      console.log("entro a detalle")
      await PedidoModel.updateStatus(
        {
          pedidoId: pedidoId,
          usu_id: data.user_id,
          estado: 'TERMINADO',
          motivo: "Toda la producción del pedido ha sido completada"
        },
        connection
      )
    }

    await connection.commit();

    // Retornar algunos datos relevantes (opcional)
    return {
      detalle_id: detalleId,
      pedido_id: pedidoId,
      ...updatesDetalle
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};