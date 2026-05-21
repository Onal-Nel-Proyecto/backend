import { body, param } from 'express-validator';

// Validaciones para crear un material
export const createMaterialValidator = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('El nombre debe ser texto')
    .isLength({ max: 50 }).withMessage('El nombre no puede superar 50 caracteres'),

  body('descripcion')
    .optional({ nullable: true })
    .isLength({ max: 120 }).withMessage('La descripción no puede superar 120 caracteres'),

  body('umbralMinimo')
    .notEmpty().withMessage('El umbral mínimo es requerido')
    .isInt({ min: 0 }).withMessage('El umbral mínimo debe ser un número entero mayor o igual a 0'),

  body('cantidadInicial')
    .notEmpty().withMessage('La cantidad inicial es requerida')
    .isInt({ min: 1 }).withMessage('La cantidad inicial debe ser un número entero mayor a 0'),

  body('unidadMedida')
    .optional({ nullable: true })
    .isLength({ max: 30 }).withMessage('La unidad de medida no puede superar 30 caracteres'),

  body('tipoMaterial')
    .notEmpty().withMessage('El tipo de material es requerido')
    .isIn(['TELA', 'HERRAMIENTAS']).withMessage('El tipo debe ser TELA o HERRAMIENTAS'),

  body('proveedorId')
    .notEmpty().withMessage('El proveedor es requerido'),

  body('costo')
    .optional({ nullable: true })
    .isDecimal().withMessage('El costo debe ser un número decimal válido')
];

// Validaciones para actualizar un material
export const updateMaterialValidator = [
  param('id').notEmpty().withMessage('El ID del material es requerido'),

  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 50 }).withMessage('El nombre no puede superar 50 caracteres'),

  body('descripcion')
    .optional({ nullable: true })
    .isLength({ max: 120 }).withMessage('La descripción no puede superar 120 caracteres'),

  body('umbralMinimo')
    .notEmpty().withMessage('El umbral mínimo es requerido')
    .isInt({ min: 0 }).withMessage('El umbral mínimo debe ser un número entero mayor o igual a 0'),

  body('unidadMedida')
    .optional({ nullable: true })
    .isLength({ max: 30 }).withMessage('La unidad de medida no puede superar 30 caracteres'),

  body('tipoMaterial')
    .notEmpty().withMessage('El tipo de material es requerido')
    .isIn(['TELA', 'HERRAMIENTAS']).withMessage('El tipo debe ser TELA o HERRAMIENTAS')
];

// Validaciones para cambiar estado de un material
export const changeMaterialEstadoValidator = [
  param('id').notEmpty().withMessage('El ID del material es requerido'),

  body('estado')
    .notEmpty().withMessage('El estado es requerido')
    .isIn(['DISPONIBLE', 'AGOTADO', 'ELIMINADO']).withMessage('El estado debe ser DISPONIBLE, AGOTADO o ELIMINADO')
];
