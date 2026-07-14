import { body } from 'express-validator';
import { ProveedorModel } from '../models/proveedor.models.js';

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
  .normalizeEmail()
  .custom(async (value, { req }) => {
    const excludeId = req.params?.id ? String(req.params.id) : null;
    const existe = await ProveedorModel.existsByEmail(value, excludeId);
    if (existe) {
      throw new Error('El correo electrónico ya está registrado por otro proveedor');
    }
    return true;
  });

const direccion = body('prov_direccion')
  .optional({ values: 'falsy' })
  .isString()
  .withMessage('La dirección debe ser texto')
  .isLength({ max: 500 })
  .withMessage('La dirección supera los 500 caracteres permitidos')
  .trim();

const tipoIdent = body('prov_tip_ident')
  .notEmpty()
  .withMessage('El tipo de identificación es requerido')
  .toUpperCase()
  .isIn(['NIT', 'DOCUMENTO'])
  .withMessage('El tipo de identificación debe ser NIT o DOCUMENTO');

const numIdent = body('prov_num_ident')
  .notEmpty()
  .withMessage('El número de identificación es requerido')
  .isString()
  .withMessage('El número de identificación debe ser texto')
  .isLength({ max: 20 })
  .withMessage('El número de identificación supera los 20 caracteres')
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
  tipoIdent,
  numIdent,
  correo,
  direccion,
  suministroArray,
  suministroItem
];

export const updateProveedorRules = [
  nombre,
  telefono,
  tipoIdent,
  numIdent,
  correo,
  direccion,
  suministroArray,
  suministroItem
];
