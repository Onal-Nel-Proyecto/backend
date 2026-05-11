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

    if (rows.length === 0) return { status: false }; // si no se encuentra el usuario, retornar false
    
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
  
  // Obtener todos los usuarios con su rol
  static async getAllUsers() {
    const [rows] = await db.query(
      `SELECT 
        u.usuId AS id,
        u.usuNom AS nombres,
        u.usuApe AS apellidos,
        u.usuTel AS telefono,
        u.usuCor AS correo,
        u.usuEst AS estado,
        u.usuFecReg AS fechaRegistro,
        r.rolNom AS rol,
        u.usuSupFk AS supervisor
      FROM usuario u
      JOIN rol r ON r.rolId = u.usuRol`
    );
    return rows;
  }

  // Obtener un usuario por su ID (cédula)
  static async getUserById({ id }) {
    const [rows] = await db.query(
      `SELECT 
        u.usuId AS id,
        u.usuNom AS nombres,
        u.usuApe AS apellidos,
        u.usuTel AS telefono,
        u.usuCor AS correo,
        u.usuEst AS estado,
        u.usuFecReg AS fechaRegistro,
        r.rolNom AS rol,
        u.usuSupFk AS supervisor
      FROM usuario u
      JOIN rol r ON r.rolId = u.usuRol
      WHERE u.usuId = ?`,
      [id]
    );

    if (rows.length === 0) return null;
    return rows[0];
  }

  // Crear un nuevo usuario
  static async createUser({ id, nombres, apellidos, telefono, correo, password, rolId, supervisorId }) {
    // Encriptar la contraseña antes de guardarla
    const passwordHash = hashSync(password, 10);

    const [result] = await db.query(
      `INSERT INTO usuario (usuId, usuNom, usuApe, usuTel, usuCor, usuPassHash, usuRol, usuSupFk, usuEst)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [id, nombres, apellidos, telefono, correo.toLowerCase(), passwordHash, rolId, supervisorId || null]
    );

    return result;
  }

  // Actualizar datos de un usuario
  static async updateUser({ id, nombres, apellidos, telefono, correo, rolId, supervisorId }) {
    const [result] = await db.query(
      `UPDATE usuario SET
        usuNom = ?,
        usuApe = ?,
        usuTel = ?,
        usuCor = ?,
        usuRol = ?,
        usuSupFk = ?
      WHERE usuId = ?`,
      [nombres, apellidos, telefono, correo.toLowerCase(), rolId, supervisorId || null, id]
    );

    return result;
  }

  // Cambiar estado del usuario: 1 = activo, 2 = bloqueado
  static async changeUserStatus({ id, estado }) {
    const [result] = await db.query(
      'UPDATE usuario SET usuEst = ? WHERE usuId = ?',
      [estado, id]
    );
    return result;
  }

  // Verificar si ya existe un usuario con ese correo (para evitar duplicados)
  static async emailExists({ correo, excludeId }) {
    const [rows] = await db.query(
      'SELECT usuId FROM usuario WHERE usuCor = ? AND usuId != ?',
      [correo.toLowerCase(), excludeId || '']
    );
    return rows.length > 0;
  }
}