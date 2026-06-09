import { body, param } from 'express-validator';

// Validaciones para crear un nuevo usuario
export const createUserValidator = [
  body('id')
  .optional({ values: 'falsy' })
  .isString().withMessage('El ID debe ser texto')
  .isLength({ min: 6, max: 15 }).withMessage('El ID debe tener entre 6 y 15 caracteres'),

  body('nombres')
    .notEmpty().withMessage('Los nombres son requeridos')
    .isString().withMessage('Los nombres deben ser texto')
    .isLength({ max: 255 }).withMessage('Los nombres no pueden superar 255 caracteres'),

  body('apellidos')
    .notEmpty().withMessage('Los apellidos son requeridos')
    .isString().withMessage('Los apellidos deben ser texto')
    .isLength({ max: 255 }).withMessage('Los apellidos no pueden superar 255 caracteres'),

  body('telefono')
  .notEmpty().withMessage('El teléfono es requerido')
  .isNumeric().withMessage('El teléfono debe ser numérico')
  .isLength({ max: 10 }).withMessage('El teléfono no puede superar 10 caracteres'),

  body('correo')
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('El correo no es válido')
    .isLength({ max: 254 }).withMessage('El correo no puede superar 254 caracteres'),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isString().withMessage('La contraseña debe ser texto')
    .isLength({ min: 6, max: 15 }).withMessage('La contraseña debe tener entre 6 y 15 caracteres'),

  body('rolId')
    .notEmpty().withMessage('El rol es requerido')
    .isInt({ min: 1 }).withMessage('El rol debe ser un número entero válido'),

  body('supervisorId')
    .optional({ nullable: true })
    .isString().withMessage('El ID del supervisor debe ser texto')
];

// Validaciones para actualizar un usuario
export const updateUserValidator = [
  param('id')
    .notEmpty().withMessage('El ID del usuario es requerido'),

  body('nombres')
    .notEmpty().withMessage('Los nombres son requeridos')
    .isString().withMessage('Los nombres deben ser texto')
    .isLength({ max: 255 }).withMessage('Los nombres no pueden superar 255 caracteres'),

  body('apellidos')
    .notEmpty().withMessage('Los apellidos son requeridos')
    .isString().withMessage('Los apellidos deben ser texto')
    .isLength({ max: 255 }).withMessage('Los apellidos no pueden superar 255 caracteres'),

  body('telefono')
    .notEmpty().withMessage('El teléfono es requerido')
    .isNumeric().withMessage('El teléfono debe ser numérico')
    .isLength({ max: 10 }).withMessage('El teléfono no puede superar 10 caracteres'),

  body('correo')
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('El correo no es válido'),

  body('rolId')
    .notEmpty().withMessage('El rol es requerido')
    .isInt({ min: 1 }).withMessage('El rol debe ser un número entero válido'),

  body('supervisorId')
    .optional({ nullable: true })
    .isString().withMessage('El ID del supervisor debe ser texto')
];

// Validaciones para cambiar estado del usuario
export const changeStatusValidator = [
  param('id')
    .notEmpty().withMessage('El ID del usuario es requerido'),

  body('estado')
    .notEmpty().withMessage('El estado es requerido')
    .isInt({ min: 1, max: 2 }).withMessage('El estado debe ser 1 (activo) o 2 (bloqueado)')
];

// Validaciones para actualizar contraseña
export const updatePasswordValidator = [
  param('id')
    .notEmpty().withMessage('El ID del usuario es requerido'),

  body('password')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isString().withMessage('La contraseña debe ser texto')
    .isLength({ min: 6, max: 15 }).withMessage('La contraseña debe tener entre 6 y 15 caracteres'),

  body('passwordActual')
    .optional({ nullable: true })
    .isString().withMessage('La contraseña actual debe ser texto')
];
