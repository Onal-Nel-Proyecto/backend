import { ProductoModel } from '../models/producto.models.js';
import { connection } from '../config/db.js';

const productoModel = new ProductoModel(connection);

// Listar todos los productos
export const getAllProductosService = async () => {
  try {
    const productos = await productoModel.getAllProductos();
    return { data: productos };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};

// Obtener un producto por ID
export const getProductoByIdService = async ({ id }) => {
  try {
    const producto = await productoModel.getById(id);
    if (!producto) return { err: 'Producto no encontrado', errorCode: 404 };
    return { data: producto };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};

// Crear un producto
export const createProductoService = async ({ id, nombre, stock, precioUnitario, descripcion, genero, categoriaId, tipoPrenda, tipoProducto, umbralMinimo, talla, proveedorId, costo, usuarioId }) => {
  try {
    // Verificar que no exista un producto con ese ID
    const idGenerado = await productoModel.generarId();
    if (idExiste) return { err: 'Ya existe un producto con ese ID', errorCode: 409 };

    // Verificar que la categoría exista si se proporcionó
    if (categoriaId) {
      const catValida = await productoModel.categoriaExists({ categoriaId });
      if (!catValida) return { err: 'La categoría especificada no existe', errorCode: 400 };
    }

    // Crear el producto
    await productoModel.crear({ id, nombre, stock, precioUnitario, descripcion, genero, categoriaId, tipoPrenda, tipoProducto, umbralMinimo, talla });

    // Si es de tipo INVENTARIO registrar el abastecimiento inicial
    if (tipoProducto === 'INVENTARIO') {
      const provValido = await productoModel.proveedorExists({ proveedorId });
      if (!provValido) return { err: 'El proveedor especificado no existe', errorCode: 400 };

      await ProductosModel.registrarAbastecimiento({ proveedorId, usuarioId, productoId: id, cantidad: stock, costo });
    }

    return { msg: 'Producto creado correctamente' };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};

// Actualizar un producto
export const updateProductoService = async ({ id, nombre, precioUnitario, descripcion, genero, categoriaId, tipoPrenda, umbralMinimo, talla }) => {
  try {
    const producto = await ProductosModel.getProductoById({ id });
    if (!producto) return { err: 'Producto no encontrado', errorCode: 404 };

    if (categoriaId) {
      const catValida = await productoModel.categoriaExists({ categoriaId });
      if (!catValida) return { err: 'La categoría especificada no existe', errorCode: 400 };
    }

    await productoModel.updateProducto({ id, nombre, precioUnitario, descripcion, genero, categoriaId, tipoPrenda, umbralMinimo, talla });
    return { msg: 'Producto actualizado correctamente' };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};

// Cambiar estado de un producto
export const changeProductoEstadoService = async ({ id, estado }) => {
  try {
    const producto = await productoModel.getProductoById({ id });
    if (!producto) return { err: 'Producto no encontrado', errorCode: 404 };

    await productoModel.changeEstado({ id, estado });

    const mensajes = { 1: 'Producto activado', 2: 'Producto marcado como agotado', 3: 'Producto desactivado' };
    return { msg: mensajes[estado] };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};
