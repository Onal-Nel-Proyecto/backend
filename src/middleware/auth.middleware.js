import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_KEY } from '../config/config.js'

export const authValidator = (req, res, next) => {
  try {
    // console.log(req.cookies.token)
    // validar que el token exista
    if (!req.cookies.token) return res.status(401).json({ message: "No autorizado, se requiere autenticación" })

    const decodeToken = jwt.verify(req.cookies.token, ACCESS_TOKEN_KEY) // verificar que el token sea valido
    // console.log( `Token decodificado: ${JSON.stringify(decodeToken)}`) // imprimir el token decodificado para verificar su contenido;
    
    req.user = decodeToken // guarda los datos del usuario para rutas protegidas
    // console.log(req.user)
    next()
  } catch (error) {
    if (error.name == "TokenExpiredError") return res.status(401).json({"message": "Sesión expirada"})
    return res.status(401).json(error)
  }
}
// middleware para validar que el usuario tenga rol de administrador
export const isAdmin = (req, res, next) => {
  try {
    console.log(req.user)
    if(req.user.rol != "ADMINISTRADOR") return res.status(403).json({"message": "Acceso denegado"})
    next()
  } catch (error) {
    
  }
}