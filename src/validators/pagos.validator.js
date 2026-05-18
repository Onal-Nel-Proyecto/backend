import { body, param } from 'express-validator';

const metodosPago = ['TRANSFERENCIA', 'EFECTIVO', 'TARJETA'];

export const crearPagoValidator = [
  body('pedido_id')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('El ID del pedido debe ser texto'),

  body('venta_id')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('El ID de la venta debe ser texto'),

  body()
    .custom((value) => {
      if (!value.pedido_id && !value.venta_id) {
        throw new Error('Debe proporcionar un pedido_id o una venta_id');
      }
      return true;
    }),

  body('monto')
    .notEmpty()
    .withMessage('El monto es obligatorio')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser un número positivo mayor a 0'),

  body('metodo_pago')
    .notEmpty()
    .withMessage('El método de pago es obligatorio')
    .toUpperCase()
    .isIn(metodosPago)
    .withMessage(`Método de pago inválido. Permitidos: ${metodosPago.join(', ')}`),
];

export const rechazarPagoValidator = [
  param('id')
    .notEmpty()
    .withMessage('El ID del pago es obligatorio')
    .isString()
    .withMessage('El ID del pago debe ser texto'),
];
