import db from "../config/db.js";

// buscar usuario por el correo electronico
const getUserByEmail = async (email) => {
  const [rows] = await db.query(
    'SELECT * FROM usuario WHERE usuCor = ?',
    [email]
  )
  return rows[0];
}

export {
  getUserByEmail
}