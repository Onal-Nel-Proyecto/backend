import { body, param, query } from 'express-validator';

const metodosPago = ['TRANSFERENCIA', 'EFECTIVO', 'TARJETA'];

/**
 * Validaciones para GET /ventas (parámetros query)
 */
export const getVentasValidator = [
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),

  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),

  query('fecha_registro')
    .optional()
    .isISO8601()
    .withMessage('La fecha de registro debe tener formato YYYY-MM-DD'),

  query('fecha_limite_pago')
    .optional()
    .isISO8601()
    .withMessage('La fecha límite de pago debe tener formato YYYY-MM-DD'),

  query('cliente')
    .optional()
    .isString()
    .withMessage('El filtro de cliente debe ser texto')
];

/**
 * Validaciones para POST /ventas
 */
export const createVentaValidator = [
  body('cliente_id')
    .notEmpty()
    .withMessage('El ID del cliente es requerido')
    .isString()
    .withMessage('El ID del cliente debe ser texto'),

  body('pedido_id')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('El ID del pedido debe ser texto'),

  body('fecha_limite_pago')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('La fecha límite de pago debe tener formato YYYY-MM-DD'),

  body('descuento')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('El descuento debe ser un número positivo'),

  body('detalles')
    .isArray({ min: 1 })
    .withMessage('Debe proporcionar al menos un detalle de venta'),

  body('detalles.*.producto_id')
    .notEmpty()
    .withMessage('El ID del producto es requerido en cada detalle')
    .isString()
    .withMessage('El ID del producto debe ser texto'),

  body('detalles.*.cantidad')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un entero mayor a 0'),

  body('detalles.*.precio')
    .isFloat({ min: 0.01 })
    .withMessage('El precio debe ser un número positivo'),

  // Validación condicional de pagos
  body('pagos')
    .optional({ nullable: true })
    .isArray()
    .withMessage('Los pagos deben ser un arreglo'),

  body('pagos.*.monto')
    .if(body('pagos').isArray({ min: 1 }))
    .notEmpty()
    .withMessage('El monto del pago es requerido')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser un número positivo'),

  body('pagos.*.metodo_pago')
    .if(body('pagos').isArray({ min: 1 }))
    .notEmpty()
    .withMessage('El método de pago es requerido')
    .toUpperCase()
    .isIn(metodosPago)
    .withMessage(`Método de pago inválido. Permitidos: ${metodosPago.join(', ')}`)
];

/**
 * Validaciones para GET /ventas/:id
 */
export const getVentaByIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('El ID de la venta es obligatorio')
    .isString()
    .withMessage('El ID de la venta debe ser texto')
];

/**
 * Validaciones para PATCH /ventas/:id
 */
export const updateVentaValidator = [
  param('id')
    .notEmpty()
    .withMessage('El ID de la venta es obligatorio')
    .isString()
    .withMessage('El ID de la venta debe ser texto'),

  body('descuento')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('El descuento debe ser un número positivo'),

  body('fecha_limite_pago')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('La fecha límite de pago debe tener formato YYYY-MM-DD')
];

/**
 * Validaciones para DELETE /ventas/:id
 */
export const anularVentaValidator = [
  param('id')
    .notEmpty()
    .withMessage('El ID de la venta es obligatorio')
    .isString()
    .withMessage('El ID de la venta debe ser texto')
];

/**
 * Validaciones para POST /ventas/:id/detalles
 */
export const createDetalleValidator = [
  param('id')
    .notEmpty()
    .withMessage('El ID de la venta es obligatorio')
    .isString()
    .withMessage('El ID de la venta debe ser texto'),

  body('producto_id')
    .notEmpty()
    .withMessage('El ID del producto es requerido')
    .isString()
    .withMessage('El ID del producto debe ser texto'),

  body('cantidad')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un entero mayor a 0'),

  body('precio')
    .isFloat({ min: 0.01 })
    .withMessage('El precio debe ser un número positivo')
];

/**
 * Validaciones para DELETE /ventas/:id/detalles/:id_detalle
 */
export const deleteDetalleValidator = [
  param('id')
    .notEmpty()
    .withMessage('El ID de la venta es obligatorio')
    .isString()
    .withMessage('El ID de la venta debe ser texto'),

  param('id_detalle')
    .notEmpty()
    .withMessage('El ID del detalle es obligatorio')
    .isString()
    .withMessage('El ID del detalle debe ser texto')
];
