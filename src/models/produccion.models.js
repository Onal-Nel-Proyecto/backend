import db from "../config/db.js";

export class ProduccionModel {
  // Método para obtener todas las producciones con estado específico para dashboard
  static async getAllProduccionOnStatus({ estado = 'Pendiente', pag = 1, limite = 5 }) {
    const offset = (pag - 1) * limite;
    const query = "SELECT * FROM produccion WHERE estado = ? ORDER BY fecha_inicio ASC LIMIT ? OFFSET ?";
    const values = [estado, limite, offset];
    return await db.query(query, values);
  }
  // Método para obtener el total de producciones por estado para el dashboard
  static async getTotalProduccion() {
    const query = `SELECT 
    (SELECT COUNT(*) FROM produccion WHERE estado = 'pendiente') AS total_pendiente,
    (SELECT COUNT(*) FROM produccion WHERE estado = 'en_proceso') AS total_en_proceso,
    (SELECT COUNT(*) FROM produccion WHERE estado = 'terminado') AS total_terminado,
    (SELECT COUNT(*) FROM produccion) AS total`;
    const [rows] = await db.query(query);
    return rows[0];
  }
  // Metodo para ver total faltante de produccion
  static async produccionFaltante(detalle_id) {
    const query = `SELECT COALESCE(SUM(cantidad), 0) AS cantidad_total
    FROM produccion
    WHERE detPedIdFk = ?
    AND estado <> 'CANCELADO'`;
    const [result] = await db.query(query, [detalle_id])
    return result[0]
  }
  // Método para crear una nueva producción
  static async create({
    id_detalle,
    id_producto,
    cantidad
  }) {

    const sql = `
    CALL sp_crear_orden_produccion(
      ?, ?, ?, @p_prodId
    )
  `;

    const values = [
      id_detalle,
      id_producto,
      cantidad
    ];

    // Ejecutar procedimiento
    await db.query(sql, values);

    // Obtener ID generado
    const [[result]] = await db.query(
      'SELECT @p_prodId AS prodId'
    );
    console.log(result)
    // Validar resultado
    if (!result.prodId) {
      throw new Error(
        'No se pudo crear la orden de producción'
      );
    }

    return result.prodId;

  }
  // Método para actualizar una producción existente
  // Método para actualizar una producción
  static async update(id, data) {

    const campos = [];
    const valores = [];

    // Actualizar cantidad
    if (data.cantidad !== undefined) {
      campos.push('cantidad = ?');
      valores.push(data.cantidad);
    }

    // Actualizar estado
    if (data.estado !== undefined) {
      console.log(data.estado)
      if (data.estado.toUpperCase() == 'EN PROCESO') {
        campos.push('fecha_inicio = NOW()')
      }
      else if (data.estado.toUpperCase() == 'TERMINADO') {
        campos.push('fecha_fin = NOW()')
      }
      campos.push('estado = ?');
      valores.push(data.estado);
    }

    // Validar que exista algo para actualizar
    if (campos.length === 0) {
      throw new Error('No se enviaron campos para actualizar');
    }

    // Agregar id al final
    valores.push(id);

    const sql = `
    UPDATE produccion
    SET ${campos.join(', ')}
    WHERE prodId = ?
  `;

    const [result] = await db.query(sql, valores);

    // Validar existencia
    if (result.affectedRows === 0) {
      throw new Error('La producción no existe o no se pudo actualizar');
    }

    return result;
  }
  // Método para eliminar una producción por su ID
  static async delete(id) {
    const query = "DELETE FROM produccion WHERE prodId = ? AND estado != 'terminado' ";
    return await db.query(query, [id]);
  }
  static async getById(id) {
    const query = "SELECT * FROM produccion WHERE prodId = ?";
    const [result] = await db.query(query, [id])
    return result;
  }

  static async countPendingByPedido(idPedido) {

    const sql = `
      SELECT COUNT(*) AS total
      FROM produccion p
      INNER JOIN det_pedido d
      ON d.detPedId = p.detPedIdFk
      WHERE d.pedIdFk = ?
      AND p.estado IN ('PENDIENTE', 'EN PROCESO')
    `;

    const [[result]] = await db.query(sql, [
      idPedido
    ]);

    return result.total;

  }
}