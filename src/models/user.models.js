import { hashSync } from "bcryptjs";
import db from "../config/db.js";
// modelo de usuario
export class UserModel {
  // metodo para obtener un usuario por su correo electrónico
  static async getUserByEmail({ email }) {
    
    const [rows] = await db.query(
      'SELECT usuario.*, rolNom AS rolName FROM usuario JOIN rol ON rolid = usuRol WHERE usuCor = ?',
      [email.toLowerCase()]
    )

    if (rows.length === 0) return false // si no se encuentra el usuario, retornar false
    
    // retornar datos del usuario formateado encontrado
    return {
      status: true,
      data: {
        user_id: rows[0].usuId,
        nombres: rows[0].usuNom,
        apellidos: rows[0].usuApe,
        correo: rows[0].usuCor,
        rol: rows[0].rolName,
        contraseña: rows[0].usuPassHash,
        estado: rows[0].usuEst
      }
    };
  }
}