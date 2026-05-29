import { body, param, validationResult } from 'express-validator';

export const crearDetalleValidator = [
  // Validación personalizada: solo uno de producto_id o producto puede estar presente
  body().custom((value, { req }) => {
    const { producto_id, producto } = req.body;
    if (producto_id && producto) {
      throw new Error('Solo se permite producto_id o producto, no ambos');
    }
    if (!producto_id && !producto) {
      throw new Error('Debe enviar producto_id (existente) o producto (nuevo)');
    }
    return true;
  }),

  // cantidad: entero mayor a 0
  body('cantidad')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un entero mayor a 0'),

  // observacion: opcional, no requiere validación adicional

  // medidas: array
  body('medidas')
    .optional()
    .custom((value) => {

      // permitir array vacío
      if (Array.isArray(value) && value.length === 0) {
        return true;
      }

      // validar que sea arreglo
      if (!Array.isArray(value)) {
        throw new Error('medidas debe ser un arreglo');
      }

      return true;
    }),

  // Cada medida debe tener medida_id y medida_valor
  body('medidas.*.medida_id')
    .notEmpty()
    .withMessage('Cada medida debe contener medida_id'),
  body('medidas.*.medida_valor')
    .isNumeric()
    .withMessage('medida_valor debe ser numérico'),

  // Validaciones condicionales cuando se crea producto nuevo
  body('producto.nombre')
    .if(body('producto').exists())
    .notEmpty()
    .withMessage('El nombre del producto es requerido'),
  body('producto.precio')
    .if(body('producto').exists())
    .isFloat({ min: 0.01 })
    .withMessage('El precio debe ser un número positivo'),
  body('producto.categoria_id')
    .optional({ nullable: true })
    .if(body('producto').exists())
    .isInt({ min: 1 })
    .withMessage('La categoría es requerida y debe ser un entero'),

  // Validación de producto_id existente (se hará en BD, pero al menos es string)
  body('producto_id')
    .if(body('producto_id').exists())
    .notEmpty()
    .withMessage('producto_id no puede estar vacío')
];

export const actualizarDetalleValidator = [
  param('id').notEmpty().withMessage('El ID del pedido es requerido'),
  param('id_detalle').notEmpty().withMessage('El ID del detalle es requerido'),

  // cantidad: opcional pero si se envía debe ser entero > 0
  body('cantidad')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un entero mayor a 0'),

  // observacion: opcional, sin validación estricta (puede ser null o string)
  body('observacion').optional(),

  // producto: opcional, pero si se envía debe tener al menos nombre o precio válidos
  body('producto')
    .optional()
    .isObject()
    .withMessage('producto debe ser un objeto con nombre y/o precio'),
  body('producto.nombre')
    .if(body('producto').exists())
    .optional()
    .isString()
    .notEmpty()
    .withMessage('El nombre del producto no puede estar vacío'),
  body('producto.precio')
    .if(body('producto').exists())
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('El precio debe ser un número positivo'),

  // medidas: opcional, si se envía debe ser array con estructura válida
  body('medidas')
    .optional()
    .custom((value) => {

      // permitir array vacío
      if (Array.isArray(value) && value.length === 0) {
        return true;
      }

      // validar que sea arreglo
      if (!Array.isArray(value)) {
        throw new Error('medidas debe ser un arreglo');
      }

      return true;
    }),
  body('medidas.*.medida_id')
    .if(body('medidas').exists())
    .notEmpty()
    .withMessage('Cada medida requiere medida_id'),
  body('medidas.*.medida_valor')
    .if(body('medidas').exists())
    .isNumeric()
    .withMessage('medida_valor debe ser numérico'),
];
