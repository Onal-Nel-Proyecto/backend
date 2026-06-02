import { body, param } from 'express-validator';

// Validaciones para crear un producto
export const createProductoValidator = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('El nombre debe ser texto')
    .isLength({ max: 70 }).withMessage('El nombre no puede superar 70 caracteres'),

  body('precioUnitario')
    .notEmpty().withMessage('El precio unitario es requerido')
    .isDecimal().withMessage('El precio debe ser un número decimal válido'),

  body('descripcion')
    .optional({ nullable: true })
    .isLength({ max: 255 }).withMessage('La descripción no puede superar 255 caracteres'),

  body('genero')
    .optional({ nullable: true })
    .isIn(['M', 'F', 'U']).withMessage('El género debe ser M, F o U'),

  body('categoriaId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('La categoría debe ser un número entero válido'),

  body('tipoPrenda')
    .optional({ nullable: true })
    .isIn(['CAMISA', 'PANTALON', 'FALDA', 'ZAPATO', 'MEDIA', 'UNIFORME', 'MEDIAS'])
    .withMessage('Tipo de prenda no válido'),

  body('tipoProducto')
    .notEmpty().withMessage('El tipo de producto es requerido')
    .isIn(['PERSONALIZADO', 'INVENTARIO']).withMessage('El tipo debe ser PERSONALIZADO o INVENTARIO'),

  body('umbralMinimo')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('El umbral mínimo debe ser un número entero mayor o igual a 0'),

  body('talla')
    .optional({ nullable: true })
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL']).withMessage('Talla no válida')
];

// Validaciones para actualizar un producto
export const updateProductoValidator = [
  param('id').notEmpty().withMessage('El ID del producto es requerido'),

  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 70 }).withMessage('El nombre no puede superar 70 caracteres'),

  body('precioUnitario')
    .notEmpty().withMessage('El precio unitario es requerido')
    .isDecimal().withMessage('El precio debe ser un número decimal válido'),

  body('descripcion')
    .optional({ nullable: true })
    .isLength({ max: 255 }).withMessage('La descripción no puede superar 255 caracteres'),

  body('genero')
    .optional({ nullable: true })
    .isIn(['M', 'F', 'U']).withMessage('El género debe ser M, F o U'),

  body('categoriaId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('La categoría debe ser un número entero válido'),

  body('tipoPrenda')
    .optional({ nullable: true })
    .isIn(['CAMISA', 'PANTALON', 'FALDA', 'ZAPATO', 'MEDIA', 'UNIFORME', 'MEDIAS'])
    .withMessage('Tipo de prenda no válido'),

  body('umbralMinimo')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('El umbral mínimo debe ser un número entero mayor o igual a 0'),

  body('talla')
    .optional({ nullable: true })
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL']).withMessage('Talla no válida')
];

// Validaciones para cambiar estado de un producto
export const changeProductoEstadoValidator = [
  param('id').notEmpty().withMessage('El ID del producto es requerido'),

  body('estado')
    .notEmpty().withMessage('El estado es requerido')
    .isInt({ min: 1, max: 3 }).withMessage('El estado debe ser 1 (activo), 2 (agotado) o 3 (inactivo)')
];
