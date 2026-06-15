import { param } from 'express-validator';

// Validaciones para subir una foto a un pedido
export const subirFotoValidator = [
  param('id')
    .notEmpty().withMessage('El ID del pedido es requerido')
];

// Validaciones para eliminar una foto de un pedido
export const eliminarFotoValidator = [
  param('id')
    .notEmpty().withMessage('El ID del pedido es requerido'),

  param('fotoId')
    .notEmpty().withMessage('El ID de la foto es requerido')
    .isInt({ min: 1 }).withMessage('El ID de la foto debe ser un número entero válido')
];
