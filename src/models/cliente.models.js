import db from "../config/db.js";

export class ClienteModel {
  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM cliente WHERE cliId = ?', [id])
    if (rows.length === 0) return false
    return { status: true, data: rows[0] }
  }
  static async getAll(limit = 15, offset = 0, filtros = {}) {
    const whereClauses = [];
    const values = [];

    if (filtros.search) {
      whereClauses.push("(c.cliId LIKE ? OR c.cliNom LIKE ? OR c.cliApe LIKE ? OR CONCAT_WS(' ', c.cliNom, c.cliApe) LIKE ?)");
      const like = `%${filtros.search}%`;
      values.push(like, like, like, like);
    }

    if (filtros.estado) {
      whereClauses.push("cliEst = ?");
      values.push(filtros.estado);
    }
    

    const whereSQL = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    values.push(limit, offset);

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
      ${whereSQL}
      ORDER BY cliFecReg DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, values);
    return rows;
  }

  static async getTotalClientes(filtros = {}) {
    const whereClauses = [];
    const values = [];

    if (filtros.search) {
      whereClauses.push("(cliId LIKE ? OR cliNom LIKE ? OR cliApe LIKE ? OR CONCAT_WS(' ', cliNom, cliApe) LIKE ?)");
      const like = `%${filtros.search}%`;
      values.push(like, like, like, like);
    }

    const whereSQL = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    const sql = `SELECT COUNT(*) AS total FROM cliente ${whereSQL}`;
    const [rows] = await db.query(sql, values);
    return rows[0].total;
  }
  static async getTelefonoByClienteId(id) {
    const sql = 'SELECT * FROM cliente_telefono WHERE cliIdFk = ?';
    const [rows] = await db.query(sql, [id]);
    return rows; // array de objetos con las columnas de la tabla
  }

  static async getTelefonosByClientesIds(ids) {
    if (!ids.length) return [];
    const placeholders = ids.map(() => '?').join(',');
    const sql = `SELECT cliIdFk, cliTel FROM cliente_telefono WHERE cliIdFk IN (${placeholders})`;
    const [rows] = await db.query(sql, ids);
    return rows;
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

  // Crear un nuevo cliente mediante SP (maneja cliente + teléfonos internamente)
  static async create({ cliId, cliNom, cliApe, cliCorr, cliDir, cliFecReg, usuIdFk }, telefonos = []) {
    // Convertir array de teléfonos a JSON plano: ["3001234567","3019876543"]
    const telefonosJSON = JSON.stringify(telefonos.map(t => t.numero_telefono));

    await db.query(
      `CALL sp_registrar_cliente(?, ?, ?, ?, ?, ?, ?, @cliIdOut, @tipoOperacion)`,
      [cliId, cliNom, cliApe, cliCorr, cliDir, telefonosJSON, usuIdFk]
    );

    const [[{ cliIdOut }]] = await db.query('SELECT @cliIdOut AS cliIdOut');
    const [[{ tipoOperacion }]] = await db.query('SELECT @tipoOperacion AS tipoOperacion');

    return { cliId, cliIdOut, tipoOperacion };
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