import { ProductosModel } from '../models/productos.models.js';
import { calculateTotalPages } from '../utils/paginacion.js';

// Servicio para listar todos los productos con paginación y filtros
export const getAllProductosService = async ({ pagina, limite, nombre, estado, categoria, tipoProducto }) => {
  try {
    const { rows, total } = await ProductosModel.getAllProductos({ pagina, limite, nombre, estado, categoria, tipoProducto });

    return {
      data: rows,
      meta: {
        pagina_actual: pagina,
        paginas_totales: calculateTotalPages(total, limite),
        total,
        limite
      }
    };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};

// Servicio para obtener un producto por ID
export const getProductoByIdService = async ({ id }) => {
  try {
    const producto = await ProductosModel.getProductoById({ id });
    if (!producto) return { err: 'Producto no encontrado', errorCode: 404 };
    return { data: producto };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};

// Servicio para crear un producto
export const createProductoService = async ({ nombre, precioUnitario, descripcion, genero, categoriaId, tipoPrenda, tipoProducto, umbralMinimo, talla }) => {
  try {
    // Verificar que la categoría exista si se proporcionó
    if (categoriaId) {
      const catValida = await ProductosModel.categoriaExists({ categoriaId });
      if (!catValida) return { err: 'La categoría especificada no existe', errorCode: 400 };
    }

    const id = await ProductosModel.createProducto({ nombre, precioUnitario, descripcion, genero, categoriaId, tipoPrenda, tipoProducto, umbralMinimo, talla });

    return { msg: 'Producto creado correctamente', id };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};

// Servicio para actualizar un producto
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

// Servicio para cambiar estado de un producto
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
