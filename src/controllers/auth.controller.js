import {loginUser, refreshTokenService} from '../services/auth.service.js';

const ctlLog = async (req, res) => {
  try{

    const {email, pass} = req.body;
    // llamar al servicio de login
    const result = await loginUser(
      {
        email: email,
        pass: pass
      }
    );

    if (result.err) return res.status(result.erroCode).json({err: result.err}) // control de errores en el servicio

    res.status(201)
    .cookie('token', result.token, {
      httpOnly: true,
      sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production', // solo enviar cookie en conexiones seguras en producción
    })
    .cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production', // solo enviar cookie en conexiones seguras en producción
    })
    .json({
      user_id: result.user_id,
      nombres: result.nombres,
      apellidos: result.apellidos,
      rol: result.rol
    }) // enviar token en una cookie httpOnly

  }catch(error){
    res.status(404).json({msg: error.message})
  }
}

const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken; // obtener el token de actualización de la cookie
    if (!refreshToken) return res.status(401).json({ message: "No autorizado, se requiere autenticación" })
  
    const newAccessToken = await refreshTokenService(refreshToken) // llamar al servicio para refrescar el token de acceso
    res.status(200)
    .cookie('token', newAccessToken, {
      httpOnly: true,
      sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production', // solo enviar cookie en conexiones seguras en producción
    })
    .json({ message: "Token de acceso actualizado" })
  }
  catch (error) {
    if (error.name == "TokenExpiredError") return res.status(401).json({"message": "Sesión expirada"})
    return res.status(401).json(error)
  }
}

export {ctlLog, refreshTokenController}