import dotenv from 'dotenv';
dotenv.config();

// desectructurando las variables de entorno
const {
  PORT = 3000, // si no existe la variable de entorno PORT, se asigna el valor 3000 por defecto
  
  // variables de entorno para la conexión a la base de datos MySQL
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,

  ACCESS_TOKEN_KEY, // clave secreta para generar tokens de autenticación
  ACCESS_TOKEN_EXPIRES_IN, // tiempo de expiración del token de acceso
  REFRESH_TOKEN_KEY, // clave secreta para generar tokens de actualización
  REFRESH_TOKEN_EXPIRES_IN // tiempo de expiración del token de actualización
} = process.env

export {
  PORT,
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  ACCESS_TOKEN_KEY,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_KEY,
  REFRESH_TOKEN_EXPIRES_IN
}