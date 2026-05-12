import db from "../config/db.js";

export class ClienteModel {
  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM cliente WHERE cliId = ?', [id])
    if (rows.length === 0) return false
    return { status: true, data: rows[0] }
  }
  static async getAll(limit = 15, offset = 0) {
    const sql = `
      SELECT 
        c.cliId,
        c.cliNom,
        c.cliApe,
        c.cliCorr,
        c.cliDir,
        c.cliEst,
        c.cliFecReg
      FROM cliente c
      ORDER BY cliFecReg DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [limit, offset]);
    return rows;
  }

  static async getTotalClientes() {
    const sql = 'SELECT COUNT(*) AS total FROM cliente';
    const [rows] = await db.query(sql);
    return rows[0].total;
  }
  static async getTelefonoByClienteId(id) {
    const sql = 'SELECT * FROM cliente_telefono WHERE cliIdFk = ?';
    const [rows] = await db.query(sql, [id]);
    return rows; // array de objetos con las columnas de la tabla
  }

  static async deleteTelByClienteId(cliIdFk) {
    await db.query('DELETE FROM cliente_telefono WHERE cliIdFk = ?', [cliIdFk]);
  }

  static async createBatch(cliIdFk, telefonos) {
    if (!telefonos.length) return;
    const values = telefonos.map(t => [cliIdFk, t.numero_telefono]);
    const sql = 'INSERT INTO cliente_telefono (cliIdFk, cliTel) VALUES ?';
    await db.query(sql, [values]);
  }

  static async create(cliente) {
    const { cliId, cliNom, cliApe, cliCorr, cliDir, cliEst, cliFecReg, usuIdFk } = cliente;
    const sql = `
      INSERT INTO cliente (cliId, cliNom, cliApe, cliCorr, cliDir, cliFecReg, usuIdFk)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(sql, [cliId, cliNom, cliApe, cliCorr, cliDir, cliFecReg, usuIdFk || null]);
    return cliId; // Retorna el ID del cliente insertado
  }

  static async changeStatus(id, estado) {
    const sql = 'UPDATE cliente SET cliEst = ? WHERE cliId = ?';
    const [rows] = await db.query(sql, [estado, id]);
    return rows; // array de objetos con las columnas de la tabla
  }

  static async update(id, datos, connection = null) {
    const { cliNom, cliApe, cliCorr, cliDir } = datos;
    const sql = `
    UPDATE cliente
    SET cliNom = ?, cliApe = ?, cliCorr = ?, cliDir = ?
    WHERE cliId = ?
  `;
    const [result] = await db.query(sql, [cliNom, cliApe, cliCorr, cliDir, id]);
    return result.affectedRows > 0; // true si se actualizó
  }
}