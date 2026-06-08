import { body, param, query } from 'express-validator';

// ─────────────────────────────────────────────
//  Listar categorías con filtros
// ─────────────────────────────────────────────
export const getAllCategoriasValidator = [
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
//  Obtener categoría por ID
// ─────────────────────────────────────────────
export const getCategoriaByIdValidator = [
  param('id')
    .notEmpty().withMessage('El ID de la categoría es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
];

// ─────────────────────────────────────────────
//  Crear categoría
// ─────────────────────────────────────────────
export const createCategoriaValidator = [
  body('catNom')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('El nombre debe ser texto')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres'),

  body('catDesc')
    .optional({ values: 'falsy' })
    .isString().withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ max: 120 }).withMessage('La descripción no puede superar 120 caracteres'),

  body('catEst')
    .optional({ values: 'falsy' })
    .toUpperCase()
    .isIn(['ACTIVO', 'INACTIVO']).withMessage('El estado debe ser ACTIVO o INACTIVO'),
];

// ─────────────────────────────────────────────
//  Actualizar categoría
// ─────────────────────────────────────────────
export const updateCategoriaValidator = [
  param('id')
    .notEmpty().withMessage('El ID de la categoría es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),

  body('catNom')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('El nombre debe ser texto')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres'),

  body('catDesc')
    .optional({ values: 'falsy' })
    .isString().withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ max: 120 }).withMessage('La descripción no puede superar 120 caracteres'),

  body('catEst')
    .optional({ values: 'falsy' })
    .toUpperCase()
    .isIn(['ACTIVO', 'INACTIVO']).withMessage('El estado debe ser ACTIVO o INACTIVO'),
];

// ─────────────────────────────────────────────
//  Cambiar estado de categoría
// ─────────────────────────────────────────────
export const changeCategoriaEstadoValidator = [
  param('id')
    .notEmpty().withMessage('El ID de la categoría es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),

  body('estado')
    .notEmpty().withMessage('El estado es requerido')
    .toUpperCase()
    .isIn(['ACTIVO', 'INACTIVO']).withMessage('El estado debe ser ACTIVO o INACTIVO'),
];
