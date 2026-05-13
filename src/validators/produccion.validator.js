import { body } from "express-validator";


const estados = [
  'PENDIENTE',
  'EN_PROCESO',
  'TERMINADO',
  'CANCELADO'
];


// ===============================
// VALIDATORS REUTILIZABLES
// ===============================

const productoIdValidator = body('producto_id')
  .notEmpty()
  .withMessage('Es necesario un producto para iniciar producción')
  .isString()
  .withMessage('Solo se permiten cadenas de texto');


const detalleIdValidator = body('detalle_id')
  .notEmpty()
  .withMessage('Es necesario el detalle padre para iniciar producción')
  .isString()
  .withMessage('Solo se permiten cadenas de texto');


// 🔥 cantidad requerida (POST)
const cantidadRequiredValidator = body('cantidad')
  .notEmpty()
  .withMessage('La cantidad es obligatoria')
  .isInt()
  .withMessage('La cantidad debe ser un número')
  .custom(e => {

    if (e <= 0) {
      throw new Error(
        'La cantidad no puede ser menor o igual a 0'
      );
    }

    return true;

  });


// 🔥 cantidad opcional (PATCH)
const cantidadOptionalValidator = body('cantidad')
  .optional()
  .isInt()
  .withMessage('La cantidad debe ser un número')
  .custom(e => {

    if (e <= 0) {
      throw new Error(
        'La cantidad no puede ser menor o igual a 0'
      );
    }

    return true;

  });


const estadoValidator = body('estado')
  .optional()
  .toUpperCase()
  .isIn(estados)
  .withMessage(
    'El estado no coincide con los estados permitidos'
  );


// ===============================
// POST
// ===============================

export const produccionPOSTValidator = [

  productoIdValidator,
  detalleIdValidator,
  cantidadRequiredValidator,
  // estadoValidator

];


// ===============================
// PATCH
// ===============================

export const produccionPATCHValidator = [

  cantidadOptionalValidator,
  estadoValidator

];