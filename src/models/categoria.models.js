import db from "../config/db.js";

export class CategoriaModel {
  // Obtener todas las categorías con filtros opcionales
  static async getAll({ nombre, estado }) {
    const filtros = [];
    const valores = [];

    if (nombre) {
      filtros.push('catNom LIKE ?');
      valores.push(`%${nombre}%`);
    }
    if (estado) {
      filtros.push('catEst = ?');
      valores.push(estado.toUpperCase());
    }

    const where = filtros.length > 0 ? `WHERE ${filtros.join(' AND ')}` : '';

    const [rows] = await db.query(
      `SELECT
        catId AS id,
        catNom AS nombre,
        catDesc AS descripcion,
        catEst AS estado
      FROM categoria
      ${where}
      ORDER BY catNom ASC`,
      valores
    );

    return rows;
  }

  // Obtener categoría por ID
  static async getById(id) {
    const [rows] = await db.query(
      `SELECT
        catId AS id,
        catNom AS nombre,
        catDesc AS descripcion,
        catEst AS estado
      FROM categoria
      WHERE catId = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0];
  }

  // Crear una nueva categoría
  static async create({ catNom, catDesc, catEst }) {
    const [result] = await db.query(
      `INSERT INTO categoria (catNom, catDesc, catEst)
       VALUES (?, ?, ?)`,
      [catNom, catDesc || null, catEst || 'ACTIVO']
    );
    return result.insertId;
  }

  // Actualizar categoría
  static async update(id, { catNom, catDesc, catEst }) {
    const [result] = await db.query(
      `UPDATE categoria SET
        catNom = ?,
        catDesc = ?,
        catEst = ?
      WHERE catId = ?`,
      [catNom, catDesc || null, catEst || 'ACTIVO', id]
    );
    return result.affectedRows > 0;
  }

  // Cambiar estado
  static async changeStatus(id, estado) {
    const [result] = await db.query(
      'UPDATE categoria SET catEst = ? WHERE catId = ?',
      [estado, id]
    );
    return result.affectedRows > 0;
  }

  // Verificar si existe una categoría con el mismo nombre
  static async existsByName(nombre, excludeId = null) {
    let sql = 'SELECT catId FROM categoria WHERE catNom = ?';
    const values = [nombre];

    if (excludeId) {
      sql += ' AND catId != ?';
      values.push(excludeId);
    }

    const [rows] = await db.query(sql, values);
    return rows.length > 0;
  }
}
