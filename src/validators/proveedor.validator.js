import { body } from 'express-validator';

// ============================================================
// Campos reutilizables
// ============================================================

const nombre = body('prov_nombre')
  .notEmpty()
  .withMessage('El nombre del proveedor es requerido')
  .isString()
  .withMessage('El nombre debe ser texto')
  .isLength({ max: 255 })
  .withMessage('El nombre supera los 255 caracteres permitidos')
  .trim();

const telefono = body('prov_telefono')
  .optional({ values: 'falsy' })
  .isString()
  .withMessage('El teléfono debe ser texto')
  .isLength({ max: 20 })
  .withMessage('El teléfono supera los 20 caracteres permitidos')
  .trim();

const correo = body('prov_correo')
  .optional({ values: 'falsy' })
  .isEmail()
  .withMessage('El correo electrónico no es válido')
  .isLength({ max: 254 })
  .withMessage('El correo supera los 254 caracteres permitidos')
  .normalizeEmail();

const direccion = body('prov_direccion')
  .optional({ values: 'falsy' })
  .isString()
  .withMessage('La dirección debe ser texto')
  .isLength({ max: 500 })
  .withMessage('La dirección supera los 500 caracteres permitidos')
  .trim();

const suministroArray = body('prov_suministro')
  .optional()
  .isArray()
  .withMessage('Los suministros deben ser un arreglo');

const suministroItem = body('prov_suministro.*')
  .if(body('prov_suministro').exists())
  .isString()
  .withMessage('Cada suministro debe ser texto')
  .trim()
  .notEmpty()
  .withMessage('Cada suministro no puede estar vacío');

// ============================================================
// Conjuntos de reglas
// ============================================================

export const createProveedorRules = [
  nombre,
  telefono,
  correo,
  direccion,
  suministroArray,
  suministroItem
];

export const updateProveedorRules = [
  nombre,
  telefono,
  correo,
  direccion,
  suministroArray,
  suministroItem
];
