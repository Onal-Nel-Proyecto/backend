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
      r.rolNom AS rol
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
      s.usuId AS sup_id,
      s.usuNom AS sup_nombre,
      s.usuApe AS sup_apellido,
      s.usuCor AS sup_correo,
      s.usuTel AS sup_telefono
    FROM usuario u
    JOIN rol r ON r.rolId = u.usuRol
    LEFT JOIN usuario s ON s.usuId = u.usuSupFk
    WHERE u.usuId = ?`,
    [id]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    nombres: row.nombres,
    apellidos: row.apellidos,
    telefono: row.telefono,
    correo: row.correo,
    estado: row.estado,
    fechaRegistro: row.fechaRegistro,
    rol: row.rol,
    supervisor: row.sup_id ? {
      sup_id: row.sup_id,
      sup_nombre: row.sup_nombre,
      sup_apellido: row.sup_apellido,
      sup_correo: row.sup_correo,
      sup_telefono: row.sup_telefono
    } : null
  };
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

  // Verificar si un rol existe en la base de datos
static async rolExists({ rolId }) {
  const [rows] = await db.query(
    'SELECT rolId FROM rol WHERE rolId = ?',
    [rolId]
  );
  return rows.length > 0;
}

// Verificar si un supervisor existe en la base de datos
static async supervisorExists({ supervisorId }) {
  const [rows] = await db.query(
    'SELECT usuId FROM usuario WHERE usuId = ?',
    [supervisorId]
  );
  return rows.length > 0;
}
  
  static async getById(id) {
    const [rows] = await db.query(
      'SELECT * FROM usuario WHERE usuId = ?',
      [id]
    )
    return rows
  }

  // Obtener el hash de la contraseña de un usuario por su ID (para verificar contraseña actual)
  static async getPasswordHash({ id }) {
    const [rows] = await db.query(
      'SELECT usuPassHash FROM usuario WHERE usuId = ?',
      [id]
    );
    return rows.length > 0 ? rows[0].usuPassHash : null;
  }

  // Actualizar la contraseña de un usuario (la encripta antes de guardar)
  static async updatePassword({ id, password }) {
    const passwordHash = hashSync(password, 10);
    const [result] = await db.query(
      'UPDATE usuario SET usuPassHash = ? WHERE usuId = ?',
      [passwordHash, id]
    );
    return result;
  }
}