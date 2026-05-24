import { AppError } from '../utils/appError.js';
import { loginUser, refreshTokenService } from '../services/auth.service.js';

const ctlLog = async (req, res, next) => {
  try {
    const { email, pass } = req.body;
    console.log("BODY:", req.body);

    const result = await loginUser({ email, pass });

    if (result.err) {
      return next(new AppError(result.err, result.errorCode));
    }
    res.status(200)
      .cookie('token', result.token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        credentials: true
      })
      .cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        credentials: true
      })
      .json({
        user_id: result.user_id,
        nombres: result.nombres,
        apellidos: result.apellidos,
        rol: result.rol
      });
    console.log("LOGIN OK");

  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

const refreshTokenController = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return next(new AppError("No autorizado, se requiere autenticación", 401));
    }

    const newAccessToken = await refreshTokenService(refreshToken);

    res.status(200)
      .cookie('token', newAccessToken, {
        httpOnly: true,
        sameSite: 'strict',
        // secure: process.env.NODE_ENV === 'production',
      })
      .json({ message: "Token de acceso actualizado" });

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Sesión expirada", 401));
    }
    next(new AppError(error.message || "Token inválido", 401));
  }
};

const profile = async (req, res, next) => {
  try {
    const user = req.user;

    return res.status(200).json({
      authenticated: true,
      user: {
        user_id: user.user_id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol: user.rol,
      },
    });

  } catch (error) {
    next(new AppError("Error obteniendo perfil", 500));
  }
};

export { ctlLog, refreshTokenController, profile }