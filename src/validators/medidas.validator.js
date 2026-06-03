import { body, param, query } from 'express-validator';

// ─────────────────────────────────────────────
//  Listar medidas con filtros
// ─────────────────────────────────────────────
export const getAllMedidasValidator = [
  query('nombre')
    .optional()
    .isString().withMessage('El nombre debe ser texto')
    .trim(),

  query('estado')
    .optional()
    .toUpperCase()
    .isIn(['ACTIVO', 'INACTIVO'])
    .withMessage('El estado debe ser ACTIVO o INACTIVO'),
];

// ─────────────────────────────────────────────
//  Obtener medida por ID
// ─────────────────────────────────────────────
export const getMedidaByIdValidator = [
  param('id')
    .notEmpty().withMessage('El ID de la medida es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
];

// ─────────────────────────────────────────────
//  Crear medida
// ─────────────────────────────────────────────
export const createMedidaValidator = [
  body('medNom')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('El nombre debe ser texto')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres'),

  body('medDesc')
    .optional({ values: 'falsy' })
    .isString().withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ max: 120 }).withMessage('La descripción no puede superar 120 caracteres'),

  body('medEst')
    .optional({ values: 'falsy' })
    .toUpperCase()
    .isIn(['ACTIVO', 'INACTIVO']).withMessage('El estado debe ser ACTIVO o INACTIVO'),
];

// ─────────────────────────────────────────────
//  Actualizar medida
// ─────────────────────────────────────────────
export const updateMedidaValidator = [
  param('id')
    .notEmpty().withMessage('El ID de la medida es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),

  body('medNom')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('El nombre debe ser texto')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres'),

  body('medDesc')
    .optional({ values: 'falsy' })
    .isString().withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ max: 120 }).withMessage('La descripción no puede superar 120 caracteres'),

  body('medEst')
    .optional({ values: 'falsy' })
    .toUpperCase()
    .isIn(['ACTIVO', 'INACTIVO']).withMessage('El estado debe ser ACTIVO o INACTIVO'),
];

// ─────────────────────────────────────────────
//  Cambiar estado de medida
// ─────────────────────────────────────────────
export const changeMedidaEstadoValidator = [
  param('id')
    .notEmpty().withMessage('El ID de la medida es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),

  body('estado')
    .notEmpty().withMessage('El estado es requerido')
    .toUpperCase()
    .isIn(['ACTIVO', 'INACTIVO']).withMessage('El estado debe ser ACTIVO o INACTIVO'),
];
