import { ProductosModel } from '../models/productos.models.js';

// Listar todos los productos
export const getAllProductosService = async () => {
  try {
    const productos = await ProductosModel.getAllProductos();
    return { data: productos };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};

// Obtener un producto por ID
export const getProductoByIdService = async ({ id }) => {
  try {
    const producto = await ProductosModel.getProductoById({ id });
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
    const idExiste = await ProductosModel.idExists({ id });
    if (idExiste) return { err: 'Ya existe un producto con ese ID', errorCode: 409 };

    // Verificar que la categoría exista si se proporcionó
    if (categoriaId) {
      const catValida = await ProductosModel.categoriaExists({ categoriaId });
      if (!catValida) return { err: 'La categoría especificada no existe', errorCode: 400 };
    }

    // Crear el producto
    await ProductosModel.createProducto({ id, nombre, stock, precioUnitario, descripcion, genero, categoriaId, tipoPrenda, tipoProducto, umbralMinimo, talla });

    // Si es de tipo INVENTARIO registrar el abastecimiento inicial
    if (tipoProducto === 'INVENTARIO') {
      const provValido = await ProductosModel.proveedorExists({ proveedorId });
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
      const catValida = await ProductosModel.categoriaExists({ categoriaId });
      if (!catValida) return { err: 'La categoría especificada no existe', errorCode: 400 };
    }

    await ProductosModel.updateProducto({ id, nombre, precioUnitario, descripcion, genero, categoriaId, tipoPrenda, umbralMinimo, talla });
    return { msg: 'Producto actualizado correctamente' };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};

// Cambiar estado de un producto
export const changeProductoEstadoService = async ({ id, estado }) => {
  try {
    const producto = await ProductosModel.getProductoById({ id });
    if (!producto) return { err: 'Producto no encontrado', errorCode: 404 };

    await ProductosModel.changeEstado({ id, estado });

    const mensajes = { 1: 'Producto activado', 2: 'Producto marcado como agotado', 3: 'Producto desactivado' };
    return { msg: mensajes[estado] };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};
