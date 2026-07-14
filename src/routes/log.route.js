import express from "express";
import { ctlLog, profile, refreshTokenController } from '../controllers/auth.controller.js'
import { loginValidator } from "../validators/auth.validator.js";
import { authValidator } from "../middleware/auth.middleware.js";
import validateFields from "../middleware/validator.middleware.js";
import { authLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

// ruta para login
router.post("/login",
  authLimiter,
  // middlewares para validar los campos de login
  [
    ...loginValidator,
    validateFields
  ],
  ctlLog)

// ruta para salir de la sesión
const isProduction = process.env.NODE_ENV === "production";

router.post("/logout", (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };
  
  // eliminar el token del cliente de la cookie
  res
    .clearCookie("token", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .status(200)
    .json({ msg: "Sesión cerrada" });
});

// ruta para refrescar el token de acceso
router.post('/refresh', refreshTokenController);
router.get('/perfil', authValidator, profile);
export { router };