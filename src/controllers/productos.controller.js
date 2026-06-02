import {
  getAllProductosService,
  getProductoByIdService,
  createProductoService,
  updateProductoService,
  changeProductoEstadoService
} from '../services/productos.service.js';

// Obtener todos los productos con paginación y filtros opcionales por query params
const ctlGetAllProductos = async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 15;
    const { nombre, estado, categoria, tipoProducto } = req.query;

    const result = await getAllProductosService({ pagina, limite, nombre, estado, categoria, tipoProducto });
    if (result.err) return res.status(result.errorCode).json({ err: result.err });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Obtener un producto por ID
const ctlGetProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getProductoByIdService({ id });
    if (result.err) return res.status(result.errorCode).json({ err: result.err });
    res.status(200).json(result.data);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Crear producto 
const ctlCreateProducto = async (req, res) => {
  try {
    const { nombre, precioUnitario, descripcion, genero, categoriaId, tipoPrenda, tipoProducto, umbralMinimo, talla } = req.body;

    const result = await createProductoService({ nombre, precioUnitario, descripcion, genero, categoriaId, tipoPrenda, tipoProducto, umbralMinimo, talla });
    if (result.err) return res.status(result.errorCode).json({ err: result.err });
    res.status(201).json({ msg: result.msg, id: result.id });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Actualizar producto 
const ctlUpdateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precioUnitario, descripcion, genero, categoriaId, tipoPrenda, umbralMinimo, talla } = req.body;

    const result = await updateProductoService({ id, nombre, precioUnitario, descripcion, genero, categoriaId, tipoPrenda, umbralMinimo, talla });
    if (result.err) return res.status(result.errorCode).json({ err: result.err });
    res.status(200).json({ msg: result.msg });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Cambiar estado del producto
const ctlChangeProductoEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const result = await changeProductoEstadoService({ id, estado });
    if (result.err) return res.status(result.errorCode).json({ err: result.err });
    res.status(200).json({ msg: result.msg });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

export { ctlGetAllProductos, ctlGetProductoById, ctlCreateProducto, ctlUpdateProducto, ctlChangeProductoEstado };
