import { DetallePedidoModel } from '../models/dt_pedido.models.js';
import db from "../config/db.js";
import { PedidoModel } from '../models/pedido.models.js';
import { ProductoModel } from '../models/producto.models.js';

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
          categoria: e.catNom
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

    // 2. Determinar producto_id
    let productoId;
    if (data.producto_id) {
      // Producto existente: validar que exista
      const productoModel = new ProductoModel(connection);
      const productoExiste = await ProductoModel.existe(data.producto_id);
      if (!productoExiste) {
        throw new Error('El producto especificado no existe');
      }
      productoId = data.producto_id;
    } else if (data.producto) {
      // Crear nuevo producto y obtener su ID
      const productoModel = new ProductoModel(connection);
      const genIdProducto = await productoModel.generarId();
      data.producto.tipo_producto = 'PERSONALIZADO'
      data.producto.producto_id = genIdProducto
      const nuevoProductoId = await productoModel.crear(data.producto);
      productoId = nuevoProductoId;
    } else {
      // Nunca debería llegar aquí por las validaciones, pero por seguridad
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
    console.log(detalleData);
    
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

export const eliminarDetalle = async (pedidoId, detalleId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Verificar que el pedido existe
    // const pedidoModel = new PedidoModel(connection);
    const pedidoExiste = await PedidoModel.getById(pedidoId);
    if (!pedidoExiste) {
      throw new Error('El pedido no existe');
    }

    const detalleModel = new DetallePedidoModel(connection);

    // 2. Verificar que el detalle pertenezca al pedido
    const detalleData = await detalleModel.getDetalle(detalleId);
    console.log(detalleData.pedidoId !== pedidoId, detalleData)
    if (!detalleData || detalleData.pedIdFk !== pedidoId) {
      throw new Error('El detalle no pertenece al pedido especificado');
    }

    const productoId = detalleData.proIdFk;

    // 3. Validar que no existan producciones en estado "en curso" o "terminado"
    const produccionesNoPermitidas = await detalleModel.getProduccionesByEstados(
      detalleId,
      ['en_proceso', 'terminado']
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
    const productoModel = new ProductoModel(connection);
    const producto = await productoModel.getById(productoId);
    if (producto && producto.proEst === 3) {
      // Verificar que no existan otros detalles usando este producto
      const otrosDetalles = await productoModel.contarDetallesConProducto(productoId, detalleId);
      if (otrosDetalles === 0) {
        await productoModel.deleteProducto(productoId);
      }
    }
    // Si está activo, se conserva sin hacer nada más

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

    if (Object.keys(updatesDetalle).length > 0) {
      await detalleModel.updateDetalle(detalleId, updatesDetalle);
    }

    // 4. Si se envió producto, actualizar el producto asociado (nombre, precio)
    if (data.producto && Object.keys(data.producto).length > 0) {
      const productoModel = new ProductoModel(connection);
      // Verificar que el producto existe (ya está asociado)
      const prodActual = await productoModel.getById(detalleActual.proIdFk);
      if (!prodActual) throw new Error('El producto asociado al detalle no existe');

      const updatesProducto = {};
      if (data.producto.nombre !== undefined) updatesProducto.nombre = data.producto.nombre;
      if (data.producto.precio !== undefined) updatesProducto.precio = data.producto.precio;

      if (Object.keys(updatesProducto).length > 0) {
        await productoModel.update(detalleActual.proIdFk, updatesProducto);
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