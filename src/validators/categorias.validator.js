import { body, param, query } from 'express-validator';
import { CategoriaModel } from '../models/categoria.models.js';

// Helper para normalizar texto (minúsculas, sin tildes)
const normalizar = (text) =>
  String(text).toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Helper para verificar duplicados por nombre normalizado
const validarNombreUnico = async (value, { req }) => {
  const excludeId = req.params?.id ? Number(req.params.id) : null;
  const todas = await CategoriaModel.getAll({});
  const inputNormalizado = normalizar(value);
  const duplicado = todas.find(c =>
    Number(c.id) !== excludeId && normalizar(c.nombre) === inputNormalizado
  );
  if (duplicado) {
    throw new Error(`Ya existe una categoría con el nombre "${duplicado.nombre}"`);
  }
  return true;
};

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

// Helper para detectar duplicados en arrays (normalizando sin tildes)
const sinDuplicados = (campo) => (value) => {
  if (!value || value.length === 0) return true;
  const normalizadas = value.map(m =>
    String(m).trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  );
  const duplicados = normalizadas.filter((m, i) => normalizadas.indexOf(m) !== i);
  if (duplicados.length > 0) {
    throw new Error(`${campo} duplicados: ${[...new Set(duplicados)].join(', ')}`);
  }
  return true;
};

// ─────────────────────────────────────────────
//  Crear categoría
// ─────────────────────────────────────────────
export const createCategoriaValidator = [
  body('catNom')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('El nombre debe ser texto')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres')
    .custom(validarNombreUnico),

  body('catDesc')
    .optional({ values: 'falsy' })
    .isString().withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ max: 120 }).withMessage('La descripción no puede superar 120 caracteres'),

  body('catEst')
    .optional({ values: 'falsy' })
    .toUpperCase()
    .isIn(['ACTIVO', 'INACTIVO']).withMessage('El estado debe ser ACTIVO o INACTIVO'),

  body('catTipsPrendas')
    .optional({ values: 'falsy' })
    .isArray().withMessage('Los tipos de prenda deben ser un arreglo')
    .custom(sinDuplicados('Tipos de prenda')),

  body('catTipsPrendas.*')
    .optional()
    .isString().withMessage('Cada tipo de prenda debe ser texto')
    .trim(),

  body('catTallaRef')
    .optional({ values: 'falsy' })
    .isArray().withMessage('Las tallas de referencia deben ser un arreglo')
    .custom(sinDuplicados('Tallas de referencia')),

  body('catTallaRef.*')
    .optional()
    .isString().withMessage('Cada talla de referencia debe ser texto')
    .trim(),

  body('catRestMed')
    .optional({ values: 'falsy' })
    .isArray().withMessage('Las restricciones de medidas deben ser un arreglo')
    .custom(sinDuplicados('Medidas')),

  body('catRestMed.*')
    .optional()
    .isString().withMessage('Cada restricción de medida debe ser texto')
    .trim(),
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
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres')
    .custom(validarNombreUnico),

  body('catDesc')
    .optional({ values: 'falsy' })
    .isString().withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ max: 120 }).withMessage('La descripción no puede superar 120 caracteres'),

  body('catEst')
    .optional({ values: 'falsy' })
    .toUpperCase()
    .isIn(['ACTIVO', 'INACTIVO']).withMessage('El estado debe ser ACTIVO o INACTIVO'),

  body('catTipsPrendas')
    .optional({ values: 'falsy' })
    .isArray().withMessage('Los tipos de prenda deben ser un arreglo')
    .custom(sinDuplicados('Tipos de prenda')),

  body('catTipsPrendas.*')
    .optional()
    .isString().withMessage('Cada tipo de prenda debe ser texto')
    .trim(),

  body('catTallaRef')
    .optional({ values: 'falsy' })
    .isArray().withMessage('Las tallas de referencia deben ser un arreglo')
    .custom(sinDuplicados('Tallas de referencia')),

  body('catTallaRef.*')
    .optional()
    .isString().withMessage('Cada talla de referencia debe ser texto')
    .trim(),

  body('catRestMed')
    .optional({ values: 'falsy' })
    .isArray().withMessage('Las restricciones de medidas deben ser un arreglo')
    .custom(sinDuplicados('Medidas')),

  body('catRestMed.*')
    .optional()
    .isString().withMessage('Cada restricción de medida debe ser texto')
    .trim(),
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
