import db from "../config/db.js";

export class MedidaModel {
  // Obtener todas las medidas con filtros opcionales
  static async getAll({ nombre, estado }) {
    const filtros = [];
    const valores = [];

    if (nombre) {
      filtros.push('medNom LIKE ?');
      valores.push(`%${nombre}%`);
    }
    if (estado) {
      filtros.push('medEst = ?');
      valores.push(estado.toUpperCase());
    }

    const where = filtros.length > 0 ? `WHERE ${filtros.join(' AND ')}` : '';

    const [rows] = await db.query(
      `SELECT
        medId AS id,
        medNom AS nombre,
        medDesc AS descripcion,
        medEst AS estado
      FROM medidas
      ${where}
      ORDER BY medNom ASC`,
      valores
    );

    return rows;
  }

  // Obtener medida por ID
  static async getById(id) {
    const [rows] = await db.query(
      `SELECT
        medId AS id,
        medNom AS nombre,
        medDesc AS descripcion,
        medEst AS estado
      FROM medidas
      WHERE medId = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0];
  }

  // Crear una nueva medida
  static async create({ medNom, medDesc, medEst }) {
    const [result] = await db.query(
      `INSERT INTO medidas (medNom, medDesc, medEst)
       VALUES (?, ?, ?)`,
      [medNom, medDesc || null, medEst || 'ACTIVO']
    );
    return result.insertId;
  }

  // Actualizar medida
  static async update(id, { medNom, medDesc, medEst }) {
    const [result] = await db.query(
      `UPDATE medidas SET
        medNom = ?,
        medDesc = ?,
        medEst = ?
      WHERE medId = ?`,
      [medNom, medDesc || null, medEst || 'ACTIVO', id]
    );
    return result.affectedRows > 0;
  }

  // Cambiar estado
  static async changeStatus(id, estado) {
    const [result] = await db.query(
      'UPDATE medidas SET medEst = ? WHERE medId = ?',
      [estado, id]
    );
    return result.affectedRows > 0;
  }

  // Verificar si existe una medida con el mismo nombre
  static async existsByName(nombre, excludeId = null) {
    let sql = 'SELECT medId FROM medidas WHERE medNom = ?';
    const values = [nombre];

    if (excludeId) {
      sql += ' AND medId != ?';
      values.push(excludeId);
    }

    const [rows] = await db.query(sql, values);
    return rows.length > 0;
  }
}
