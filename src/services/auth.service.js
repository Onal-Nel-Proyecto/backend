import { UserModel } from '../models/user.models.js';
import { ACCESS_TOKEN_KEY, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_KEY, REFRESH_TOKEN_EXPIRES_IN } from '../config/config.js';
import jwt from 'jsonwebtoken';
import { compareSync } from 'bcryptjs';

export const loginUser = async (e) => {

  const data = await UserModel.getUserByEmail(e)
  // validar usuario y contraseña
  if (data === false || !compareSync(e.pass, data.data.contraseña)) return { err: "Usuario invalido", erroCode: 401 }

  if (data.data.estado === 2) return { err: "Usuario bloqueado", erroCode: 403 }
  
  // crear token de acceso
  const payload = {
    // datos del usuario que se incluirán en el token
    user_id: data.data.user_id,
    nombres: data.data.nombres,
    apellidos: data.data.apellidos,
    rol: data.data.rol
  }
  const newAccessToken = jwt.sign(
    payload,
    ACCESS_TOKEN_KEY, // clave secreta para firmar el token
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN // tiempo de expiración del token
    }
  )

  const newRefreshToken = jwt.sign(
    payload,
    REFRESH_TOKEN_KEY, // clave secreta para firmar el token
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN // tiempo de expiración del token
    }
  )

  return {
    user_id: data.data.user_id,
    nombres: data.data.nombres,
    apellidos: data.data.apellidos,
    rol: data.data.rol,
    token: newAccessToken,
    refreshToken: newRefreshToken
  }
}

export const refreshTokenService = async (token) => {
  try {
    const decodeToken = jwt.verify(token, REFRESH_TOKEN_KEY)

    const payload = {
      user_id: decodeToken.user_id,
      nombres: decodeToken.nombres,
      apellidos: decodeToken.apellidos,
      rol: decodeToken.rol
    }

    const newAccessToken = jwt.sign(
      payload,
      ACCESS_TOKEN_KEY,
      {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN
      }
    )

    return newAccessToken 

  } catch (error) {

    if (error.name === "TokenExpiredError") {
      return { err: "Sesión expirada", errorCode: 401 }
    }

    return { err: "Token inválido", errorCode: 401 }
  }
}