import { body } from 'express-validator';

export const loginValidator = [
  // validaciones del correo
  body('email')
    .notEmpty()
    .withMessage('Correo requerido')
    .isString()
    .withMessage("El correo no es de tipo string")
    .isEmail()
    .withMessage("Correo invalido"),
  // validaciones de la contraseña
  body('pass')
    .notEmpty()
    .withMessage('Contraseña requerida')
    .isString()
    .withMessage("La contraseña no es de tipo string")
    .isLength({ min: 6, max: 15 })
    .withMessage('La contraseña debe tener al menos 6 caracteres y maximo 15 caracteres')
] 