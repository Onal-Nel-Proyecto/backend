import db from "../config/db.js";

export class ClienteModel {
  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM cliente WHERE cliId = ?', [id])
    if (rows.length === 0) return false
    return { status: true, data: rows[0] }
  }
}