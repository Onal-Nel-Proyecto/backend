import db from '../config/db.js';

export class PedidoFotoModel {
  // Obtener todas las fotos de un pedido
  static async getFotosByPedidoId(pedidoId) {
    const [rows] = await db.query(
      `SELECT fotId, fotUrl, fotFec
       FROM pedido_foto
       WHERE pedIdFk = ?
       ORDER BY fotFec DESC`,
      [pedidoId]
    );
    return rows;
  }

  // Obtener una foto por su ID
  static async getFotoById(fotoId) {
    const [rows] = await db.query(
      `SELECT fotId, fotUrl, fotFec, pedIdFk
       FROM pedido_foto
       WHERE fotId = ?`,
      [fotoId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // Insertar una nueva foto para un pedido
  static async createFoto(pedidoId, fotUrl) {
    const [result] = await db.query(
      'INSERT INTO pedido_foto (pedIdFk, fotUrl) VALUES (?, ?)',
      [pedidoId, fotUrl]
    );
    return result;
  }

  // Eliminar una foto por su ID
  static async deleteFoto(fotoId) {
    const [result] = await db.query(
      'DELETE FROM pedido_foto WHERE fotId = ?',
      [fotoId]
    );
    return result;
  }

  // Contar cuántas fotos tiene un pedido (para validar máximo 15)
  static async countFotosByPedidoId(pedidoId) {
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM pedido_foto WHERE pedIdFk = ?',
      [pedidoId]
    );
    return total;
  }
}
