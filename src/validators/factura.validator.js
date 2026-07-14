import { body, param } from 'express-validator';

export const getFacturaValidator = [
  param('id')
    .notEmpty()
    .withMessage('El ID de la venta es obligatorio')
    .isString()
    .withMessage('El ID de la venta debe ser texto'),
];

export const createFacturaValidator = [
  param('id')
    .notEmpty()
    .withMessage('El ID de la venta es obligatorio')
    .isString()
    .withMessage('El ID de la venta debe ser texto'),

  body('venta_id')
    .notEmpty()
    .withMessage('El ID de la venta es obligatorio')
    .isString()
    .withMessage('El ID de la venta debe ser texto'),
];

export const anularFacturaValidator = [
  param('id')
    .notEmpty()
    .withMessage('El ID de la venta es obligatorio')
    .isString()
    .withMessage('El ID de la venta debe ser texto'),

  param('id_factura')
    .notEmpty()
    .withMessage('El ID de la factura es obligatorio')
    .isString()
    .withMessage('El ID de la factura debe ser texto'),
];

export const pdfFacturaValidator = [
  param('id')
    .notEmpty()
    .withMessage('El ID de la venta es obligatorio')
    .isString()
    .withMessage('El ID de la venta debe ser texto'),
];
