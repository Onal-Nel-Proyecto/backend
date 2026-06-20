// validators/clienteValidator.js
import { body } from 'express-validator';

// ----------------------
// Campos reutilizables
// ----------------------

// ID del cliente (usado en POST, opcional en PUT porque viene en URL)
const clienteId = body('cliente_id')
  .optional({ values: 'falsy' }) // opcional, pero si se envía debe ser válido
  .isInt({ min: 1 })
  .withMessage('El ID de cliente debe ser un número entero positivo');

// Nombre
const nombre = body('cliente_nombre')
  .notEmpty()
  .withMessage('El nombre es requerido')
  .isString()
  .withMessage('El nombre debe ser texto')
  .isLength({ max: 255 })
  .withMessage('El nombre supera los 255 caracteres permitidos')
  .trim();

// Apellido
const apellido = body('cliente_apellido')
  .optional({ values: 'falsy' })
  // .withMessage('El apellido es requerido')
  .isString()
  .withMessage('El apellido debe ser texto')
  .isLength({ max: 255 })
  .withMessage('El apellido supera los 255 caracteres permitidos')
  .trim();

// Email
const email = body('cliente_email')
  .optional({ values: 'falsy' })
  // .withMessage('El correo electrónico es requerido')
  .isEmail()
  .withMessage('El correo electrónico no es válido')
  .isLength({ max: 254 })
  .withMessage('El correo supera los 254 caracteres permitidos')
  .normalizeEmail();

// Dirección
const direccion = body('cliente_direccion')
  .optional({ values: 'falsy' })
  .isString()
  .withMessage('La dirección debe ser texto')
  .isLength({ max: 500 })
  .withMessage('La dirección supera los 500 caracteres permitidos')
  .trim();

// Teléfonos (array)
const telefonoArray = body('telefono')
  .optional()
  .isArray()
  .withMessage('El campo teléfono debe ser un arreglo');

// Cada elemento del arreglo teléfono
const telefonoItem = body('telefono.*.numero_telefono')
  .if(body('telefono').exists()) // solo valida si se envió el array
  .notEmpty()
  .withMessage('El número de teléfono es requerido')
  .isString()
  .withMessage('El número de teléfono debe ser texto')
  .isLength({ max: 20 })
  .withMessage('El número de teléfono supera los 20 caracteres')
  .trim();

// ----------------------
// Conjuntos de reglas
// ----------------------

// Validación para POST /clientes
export const createClienteRules = [
  clienteId,
  nombre,
  apellido,
  email,
  direccion,
  telefonoArray,
  telefonoItem
];

// Validación para PUT /clientes/:id
export const updateClienteRules = [
  // cliente_id no se incluye porque va en la URL
  nombre,
  apellido,
  email,
  direccion,
  telefonoArray,
  telefonoItem
  // user_id no se actualiza en esta ruta; si lo necesitaras, añade userId aquí
];

export const estadoValidator = [
  body('estado')
  .notEmpty()
  .isIn([1, 2])
  .withMessage('El estado seleccionado no es permitido, (1 = activo, 2 = inactivo/bloqueado)')
]