import { query } from "express-validator";

export const getAllMovimientosValidator = [
  query('pag')
    .optional()
    .isInt({ min: 1 })
    .withMessage("El parámetro pag debe ser un número entero positivo"),

  query('usuario')
    .optional()
    .isString()
    .trim()
    .withMessage("El parámetro usuario debe ser un texto"),

  query('fecha_desde')
    .optional()
    .isISO8601()
    .withMessage("El parámetro fecha_desde debe ser una fecha válida (YYYY-MM-DD)"),

  query('fecha_hasta')
    .optional()
    .isISO8601()
    .withMessage("El parámetro fecha_hasta debe ser una fecha válida (YYYY-MM-DD)"),

  query('tipo_suministro')
    .optional()
    .isIn(['PRODUCTO', 'MATERIAL'])
    .withMessage("El tipo de suministro debe ser PRODUCTO o MATERIAL"),

  query('tipo_mov')
    .optional()
    .isIn(['COMPRA', 'VENTA', 'PRODUCCION', 'AJUSTE'])
    .withMessage("El tipo de movimiento debe ser COMPRA, VENTA, PRODUCCION o AJUSTE"),
];
