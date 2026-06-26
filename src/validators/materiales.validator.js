import { body, param, query } from 'express-validator';

// ─────────────────────────────────────────────
//  Listar materiales con filtros
// ─────────────────────────────────────────────
export const getAllMaterialesValidator = [
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
    .toUpperCase()
    .isIn(['DISPONIBLE', 'AGOTADO', 'ELIMINADO'])
    .withMessage('El estado debe ser DISPONIBLE, AGOTADO o ELIMINADO'),

  query('tipoMaterial')
    .optional()
    .toUpperCase()
    .isIn(['TELA', 'HERRAMIENTA', 'HILO', 'BOTON', 'CREMALLERA', 'ELASTICO', 'ENTRETELA', 'CORDON', 'ENCAJE', 'APLIQUE', 'ETIQUETA', 'EMPAQUE', 'ACCESORIO'])
    .withMessage('Tipo de material no válido'),
];

// ─────────────────────────────────────────────
//  Obtener material por ID
// ─────────────────────────────────────────────
export const getMaterialByIdValidator = [
  param('id')
    .notEmpty().withMessage('El ID del material es requerido')
    .isString().withMessage('El ID del material debe ser texto'),
];

// ─────────────────────────────────────────────
//  Crear material
// ─────────────────────────────────────────────
export const createMaterialValidator = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('El nombre debe ser texto')
    .trim()
    .isLength({ max: 50 }).withMessage('El nombre no puede superar 50 caracteres'),

  body('descripcion')
    .optional({ nullable: true })
    .isString().withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ max: 120 }).withMessage('La descripción no puede superar 120 caracteres'),

  body('umbralMinimo')
    .notEmpty().withMessage('El umbral mínimo es requerido')
    .isInt({ min: 0 }).withMessage('El umbral mínimo debe ser un número entero mayor o igual a 0'),

  body('unidadMedida')
    .optional({ nullable: true })
    .isString().withMessage('La unidad de medida debe ser texto')
    .trim()
    .isLength({ max: 30 }).withMessage('La unidad de medida no puede superar 30 caracteres'),

  body('tipoMaterial')
    .notEmpty().withMessage('El tipo de material es requerido')
    .toUpperCase()
    .isIn(['TELA', 'HERRAMIENTA', 'HILO', 'BOTON', 'CREMALLERA', 'ELASTICO', 'ENTRETELA', 'CORDON', 'ENCAJE', 'APLIQUE', 'ETIQUETA', 'EMPAQUE', 'ACCESORIO']).withMessage('Tipo de material no válido'),

  body('cantidadDisponible')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 1000 }).withMessage('La cantidad disponible debe ser un número entero entre 0 y 1000'),
];

// ─────────────────────────────────────────────
//  Actualizar material
// ─────────────────────────────────────────────
export const updateMaterialValidator = [
  param('id')
    .notEmpty().withMessage('El ID del material es requerido')
    .isString().withMessage('El ID del material debe ser texto'),

  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('El nombre debe ser texto')
    .trim()
    .isLength({ max: 50 }).withMessage('El nombre no puede superar 50 caracteres'),

  body('descripcion')
    .optional({ nullable: true })
    .isString().withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ max: 120 }).withMessage('La descripción no puede superar 120 caracteres'),

  body('umbralMinimo')
    .notEmpty().withMessage('El umbral mínimo es requerido')
    .isInt({ min: 0 }).withMessage('El umbral mínimo debe ser un número entero mayor o igual a 0'),

  body('unidadMedida')
    .optional({ nullable: true })
    .isString().withMessage('La unidad de medida debe ser texto')
    .trim()
    .isLength({ max: 30 }).withMessage('La unidad de medida no puede superar 30 caracteres'),

  body('tipoMaterial')
    .notEmpty().withMessage('El tipo de material es requerido')
    .toUpperCase()
    .isIn(['TELA', 'HERRAMIENTA', 'HILO', 'BOTON', 'CREMALLERA', 'ELASTICO', 'ENTRETELA', 'CORDON', 'ENCAJE', 'APLIQUE', 'ETIQUETA', 'EMPAQUE', 'ACCESORIO']).withMessage('Tipo de material no válido'),

  body('stock')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0'),
];

// ─────────────────────────────────────────────
//  Cambiar estado de material
// ─────────────────────────────────────────────
export const changeMaterialEstadoValidator = [
  param('id')
    .notEmpty().withMessage('El ID del material es requerido')
    .isString().withMessage('El ID del material debe ser texto'),

  body('estado')
    .notEmpty().withMessage('El estado es requerido')
    .toUpperCase()
    .isIn(['DISPONIBLE', 'AGOTADO', 'ELIMINADO'])
    .withMessage('El estado debe ser DISPONIBLE, AGOTADO o ELIMINADO'),
];
