import db from "../config/db.js";

export class ProveedorModel {
  static async getAll(limit = 15, offset = 0) {
    const sql = `
      SELECT 
        provId,
        provNom,
        provTel,
        provCorr,
        provDir,
        proTipMatSum,
        provEst
      FROM proveedor
      ORDER BY provNom ASC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [limit, offset]);
    return rows;
  }

  static async getTotal() {
    const sql = 'SELECT COUNT(*) AS total FROM proveedor';
    const [rows] = await db.query(sql);
    return rows[0].total;
  }

  static async search(filtro, limit = 15, offset = 0) {
    const sql = `
      SELECT 
        provId,
        provNom,
        provTel,
        provCorr,
        provDir,
        proTipMatSum,
        provEst
      FROM proveedor
      WHERE provNom LIKE ?
      ORDER BY provNom ASC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [`%${filtro}%`, limit, offset]);
    return rows;
  }

  static async getTotalSearch(filtro) {
    const sql = "SELECT COUNT(*) AS total FROM proveedor WHERE provNom LIKE ?";
    const [rows] = await db.query(sql, [`%${filtro}%`]);
    return rows[0].total;
  }

  static async searchBySuministro(suministro, limit = 15, offset = 0) {
    const sql = `
      SELECT 
        provId,
        provNom,
        provTel,
        provCorr,
        provDir,
        proTipMatSum,
        provEst
      FROM proveedor
      WHERE proTipMatSum LIKE ?
      ORDER BY provNom ASC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [`%${suministro}%`, limit, offset]);
    return rows;
  }

  static async getTotalSearchBySuministro(suministro) {
    const sql = "SELECT COUNT(*) AS total FROM proveedor WHERE proTipMatSum LIKE ?";
    const [rows] = await db.query(sql, [`%${suministro}%`]);
    return rows[0].total;
  }

  static async searchByEstado(estado, limit = 15, offset = 0) {
    const sql = `
      SELECT 
        provId,
        provNom,
        provTel,
        provCorr,
        provDir,
        proTipMatSum,
        provEst
      FROM proveedor
      WHERE provEst = ?
      ORDER BY provNom ASC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [estado, limit, offset]);
    return rows;
  }

  static async getTotalSearchByEstado(estado) {
    const sql = "SELECT COUNT(*) AS total FROM proveedor WHERE provEst = ?";
    const [rows] = await db.query(sql, [estado]);
    return rows[0].total;
  }

  static async getById(id) {
    const sql = 'SELECT * FROM proveedor WHERE provId = ?';
    const [rows] = await db.query(sql, [id]);
    if (rows.length === 0) return false;
    return { status: true, data: rows[0] };
  }

  static async generateNextId() {
    await db.query("CALL sp_generar_siguiente_id('PRV', 'proveedor', 'provId', @id_result)");
    const [[rows]] = await db.query("SELECT @id_result AS id");
    return rows.id;
  }

  static async create(data) {
    const { provId, provNom, provTel, provCorr, provDir, proTipMatSum } = data;
    const sql = `
      INSERT INTO proveedor (provId, provNom, provTel, provCorr, provDir, proTipMatSum)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.query(sql, [provId, provNom, provTel || null, provCorr || null, provDir || null, proTipMatSum || null]);
    return provId;
  }

  static async update(id, data) {
    const { provNom, provTel, provCorr, provDir, proTipMatSum } = data;
    const sql = `
      UPDATE proveedor
      SET provNom = ?, provTel = ?, provCorr = ?, provDir = ?, proTipMatSum = ?
      WHERE provId = ?
    `;
    const [result] = await db.query(sql, [provNom, provTel || null, provCorr || null, provDir || null, proTipMatSum || null, id]);
    return result.affectedRows > 0;
  }

  static async changeStatus(id, estado) {
    const sql = 'UPDATE proveedor SET provEst = ? WHERE provId = ?';
    const [result] = await db.query(sql, [estado, id]);
    return result.affectedRows > 0;
  }
}
