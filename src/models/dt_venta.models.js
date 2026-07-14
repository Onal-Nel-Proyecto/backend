import db from '../config/db.js';

export class DetalleVentaModel {
  /**
   * Generar el siguiente ID para det_venta usando el SP
   */
  static async generarId(connection) {
    await connection.query(
      "CALL sp_generar_siguiente_id('DT', 'det_venta', 'detVenId', @id)"
    );

    const [[{ id }]] = await connection.query('SELECT @id AS id');

    return id;
  }

  /**
   * Insertar un nuevo detalle de venta
   */
  static async create(detalle, connection) {
    await connection.query(
      `INSERT INTO det_venta (detVenId, idVenFk, idProFk, cantidad, precio, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        detalle.detalle_id,
        detalle.venta_id,
        detalle.producto_id,
        detalle.cantidad,
        detalle.precio,
        detalle.subtotal
      ]
    );
  }

  /**
   * Eliminar un detalle de venta
   */
  static async delete(ventaId, detalleId, usuarioId = null) {
    // Establecer variable de sesión para auditoría
    if (usuarioId) {
      await db.query('SET @usuActual = ?', [usuarioId]);
    }

    const [result] = await db.query(
      'DELETE FROM det_venta WHERE idVenFk = ? AND detVenId = ?',
      [ventaId, detalleId]
    );

    return result.affectedRows > 0;
  }

  /**
   * Verificar que un detalle pertenezca a una venta
   */
  static async perteneceAVenta(ventaId, detalleId) {
    const [[row]] = await db.query(
      'SELECT 1 FROM det_venta WHERE idVenFk = ? AND detVenId = ?',
      [ventaId, detalleId]
    );

    return !!row;
  }
}
