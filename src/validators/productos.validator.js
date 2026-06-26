import { body, param, query } from 'express-validator';

// ─────────────────────────────────────────────
//  Listar productos con filtros
// ─────────────────────────────────────────────
export const getAllProductosValidator = [
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),

  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),

  query('nombre')
    .optional()
    .isString().withMessage('El nombre debe ser texto')
    .trim(),

  query('estado')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('El estado debe ser 1 (activo), 2 (agotado) o 3 (inactivo)'),

  query('categoria')
    .optional()
    .isString().withMessage('La categoría debe ser texto')
    .trim(),

  query('tipoProducto')
    .optional()
    .toUpperCase()
    .isIn(['PERSONALIZADO', 'INVENTARIO'])
    .withMessage('El tipo de producto debe ser PERSONALIZADO o INVENTARIO'),

  query('tipo_origen')
    .optional()
    .toUpperCase()
    .isIn(['PRODUCCION'])
    .withMessage('tipo_origen debe ser PRODUCCION'),
];

// ─────────────────────────────────────────────
//  Obtener producto por ID
// ─────────────────────────────────────────────
export const getProductoByIdValidator = [
  param('id')
    .notEmpty().withMessage('El ID del producto es requerido')
    .isString().withMessage('El ID del producto debe ser texto'),
];

// ─────────────────────────────────────────────
//  Crear producto
// ─────────────────────────────────────────────
export const createProductoValidator = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('El nombre debe ser texto')
    .trim()
    .isLength({ max: 70 }).withMessage('El nombre no puede superar 70 caracteres'),

  body('precioUnitario')
    .notEmpty().withMessage('El precio unitario es requerido')
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser un número decimal mayor a 0'),

  body('descripcion')
    .optional({ nullable: true })
    .isString().withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ max: 255 }).withMessage('La descripción no puede superar 255 caracteres'),

  body('genero')
    .optional({ nullable: true })
    .toUpperCase()
    .isIn(['M', 'F', 'U']).withMessage('El género debe ser M, F o U'),

  body('categoriaId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('La categoría debe ser un número entero válido'),

  body('tipoPrenda')
    .optional({ nullable: true })
    .toUpperCase()
    .isIn(['CAMISA', 'CAMISETA', 'POLO', 'PANTALON', 'JEAN', 'BERMUDA', 'SHORT', 'FALDA', 'VESTIDO', 'CHAQUETA', 'BUSO', 'SUDADERA', 'HOODIE', 'OVEROL', 'DELANTAL', 'UNIFORME', 'DOTACION', 'GORRA', 'OTRO'])
    .withMessage('Tipo de prenda no válido'),

  body('tipoProducto')
    .notEmpty().withMessage('El tipo de producto es requerido')
    .toUpperCase()
    .isIn(['PERSONALIZADO', 'INVENTARIO']).withMessage('El tipo debe ser PERSONALIZADO o INVENTARIO'),

  body('umbralMinimo')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('El umbral mínimo debe ser un número entero mayor o igual a 0'),

  body('talla')
    .optional({ nullable: true })
    .customSanitizer(value => {
      if (!value) return value;
      if (!isNaN(value)) return String(value);
      if (typeof value === 'string') return value.toUpperCase();
      return value;
    })
    .custom(value => {
      if (!value) return true;
      const tallasTexto = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      if (tallasTexto.includes(value)) return true;
      if (!isNaN(value) && Number(value) > 0) return true;
      throw new Error('Talla no válida — debe ser número (ej: 38) o talla de texto (XS, S, M, L, XL, XXL)');
    }),
];

// ─────────────────────────────────────────────
//  Actualizar producto
// ─────────────────────────────────────────────
export const updateProductoValidator = [
  param('id')
    .notEmpty().withMessage('El ID del producto es requerido')
    .isString().withMessage('El ID del producto debe ser texto'),

  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('El nombre debe ser texto')
    .trim()
    .isLength({ max: 70 }).withMessage('El nombre no puede superar 70 caracteres'),

  body('precioUnitario')
    .notEmpty().withMessage('El precio unitario es requerido')
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser un número decimal mayor a 0'),

  body('descripcion')
    .optional({ nullable: true })
    .isString().withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ max: 255 }).withMessage('La descripción no puede superar 255 caracteres'),

  body('genero')
    .optional({ nullable: true })
    .toUpperCase()
    .isIn(['M', 'F', 'U']).withMessage('El género debe ser M, F o U'),

  body('categoriaId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('La categoría debe ser un número entero válido'),

  body('tipoPrenda')
    .optional({ nullable: true })
    .toUpperCase()
    .isIn(['CAMISA', 'CAMISETA', 'POLO', 'PANTALON', 'JEAN', 'BERMUDA', 'SHORT', 'FALDA', 'VESTIDO', 'CHAQUETA', 'BUSO', 'SUDADERA', 'HOODIE', 'OVEROL', 'DELANTAL', 'UNIFORME', 'DOTACION', 'GORRA', 'OTRO'])
    .withMessage('Tipo de prenda no válido'),

  body('umbralMinimo')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('El umbral mínimo debe ser un número entero mayor o igual a 0'),

  body('talla')
    .optional({ nullable: true })
    .customSanitizer(value => {
      if (!value) return value;
      if (!isNaN(value)) return String(value);
      if (typeof value === 'string') return value.toUpperCase();
      return value;
    })
    .custom(value => {
      if (!value) return true;
      const tallasTexto = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      if (tallasTexto.includes(value)) return true;
      if (!isNaN(value) && Number(value) > 0) return true;
      throw new Error('Talla no válida — debe ser número (ej: 38) o talla de texto (XS, S, M, L, XL, XXL)');
    }),
];

// ─────────────────────────────────────────────
//  Cambiar estado de producto
// ─────────────────────────────────────────────
export const changeProductoEstadoValidator = [
  param('id')
    .notEmpty().withMessage('El ID del producto es requerido')
    .isString().withMessage('El ID del producto debe ser texto'),

  body('estado')
    .notEmpty().withMessage('El estado es requerido')
    .isInt({ min: 1, max: 3 }).withMessage('El estado debe ser 1 (activo), 2 (agotado) o 3 (inactivo)'),
];
