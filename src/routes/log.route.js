import express from "express";
import { ctlLog, refreshTokenController } from '../controllers/auth.controller.js'
import { loginValidator } from "../validators/auth.validator.js";
import validateFields from "../middleware/validator.middleware.js";
const router = express.Router();

// ruta para login
router.post("/login",
  // middlewares para validar los campos de login
  [
    ...loginValidator,
    validateFields
  ],
  ctlLog)

// ruta para salir de la sesión
router.post("/logout", (req, res) => {
   // eliminar el token del cliente de la cookie
  res
    .clearCookie('token')
    .clearCookie('refreshToken')
    .status(200)
    .json({ msg: 'Sesión cerrada' })
})

// ruta para refrescar el token de acceso
router.post('/refresh', refreshTokenController);
export { router };