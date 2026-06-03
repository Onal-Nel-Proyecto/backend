import express from 'express';
import { ctlGetAllProductos, ctlGetProductoById, ctlCreateProducto, ctlUpdateProducto, ctlChangeProductoEstado } from '../controllers/productos.controller.js';
import { getAllProductosValidator, getProductoByIdValidator, createProductoValidator, updateProductoValidator, changeProductoEstadoValidator } from '../validators/productos.validator.js';
import validateFields from '../middleware/validator.middleware.js';
import { authValidator, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Listar todos los productos
router.get('/',
  authValidator,
  [...getAllProductosValidator, validateFields],
  ctlGetAllProductos
);

// Obtener un producto por ID
router.get('/:id',
  authValidator,
  [...getProductoByIdValidator, validateFields],
  ctlGetProductoById
);

// Crear producto
router.post('/',
  authValidator,
  isAdmin,
  [...createProductoValidator, validateFields],
  ctlCreateProducto
);

// Actualizar producto
router.put('/:id',
  authValidator,
  isAdmin,
  [...updateProductoValidator, validateFields],
  ctlUpdateProducto
);

// Cambiar estado
router.patch('/:id/estado',
  authValidator,
  isAdmin,
  [...changeProductoEstadoValidator, validateFields],
  ctlChangeProductoEstado
);

export { router };
