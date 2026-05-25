import db from '../config/db.js';

export class VentasModel {
  /**
   * Obtener ventas paginadas con filtros desde la vista vw_ventas_detalladas
   */
  static async getAll(filtros = {}, limite = 15, offset = 0) {
    const whereClauses = ["v.estadoPago <> 'ANULADO'"];
    const params = [];

    if (filtros.fecha_registro) {
      whereClauses.push('DATE(v.venFec) = ?');
      params.push(filtros.fecha_registro);
    }

    if (filtros.fecha_limite_pago) {
      whereClauses.push('DATE(v.venFecVenLimit) = ?');
      params.push(filtros.fecha_limite_pago);
    }

    if (filtros.cliente) {
      whereClauses.push(
        '(c.cliId LIKE ? OR c.cliNom LIKE ? OR c.cliApe LIKE ? OR CONCAT_WS(" ", c.cliNom, c.cliApe) LIKE ?)'
      );
      const like = `%${filtros.cliente}%`;
      params.push(like, like, like, like);
    }

    const whereSQL = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(' AND ')}`
      : '';

    params.push(limite, offset);

    const [rows] = await db.query(
      `SELECT 
        v.venId AS venta_id,
        v.venFec AS fecha_registro,
        v.estadoPago AS estado,
        v.venTotal AS total,
        v.venDesc AS descuento,
        v.venFecVenLimit AS fecha_limite_pago,
        v.pedIdFk AS pedido_id,
        c.cliId AS cliente_id,
        c.cliNom AS cliente_nombres,
        c.cliApe AS cliente_apellidos,
        COALESCE(p.total_pagado, 0) AS total_pagado,
        (v.venTotal - COALESCE(p.total_pagado, 0)) AS saldo_pendiente
      FROM ventas v
      JOIN cliente c ON c.cliId = v.cliIdFk
      LEFT JOIN (
        SELECT pagVenIdFk, 
               SUM(CASE WHEN pagEst <> 'RECHAZADO' THEN pagMon ELSE 0 END) AS total_pagado
        FROM pagos
        GROUP BY pagVenIdFk
      ) p ON p.pagVenIdFk = v.venId
      ${whereSQL}
      ORDER BY v.venFec DESC
      LIMIT ? OFFSET ?`,
      params
    );

    return rows;
  }

  /**
   * Contar ventas con filtros
   */
  static async countAll(filtros = {}) {
    const whereClauses = ["v.estadoPago <> 'ANULADO'"];
    const params = [];

    if (filtros.fecha_registro) {
      whereClauses.push('DATE(v.venFec) = ?');
      params.push(filtros.fecha_registro);
    }

    if (filtros.fecha_limite_pago) {
      whereClauses.push('DATE(v.venFecVenLimit) = ?');
      params.push(filtros.fecha_limite_pago);
    }

    if (filtros.cliente) {
      whereClauses.push(
        '(c.cliId LIKE ? OR c.cliNom LIKE ? OR c.cliApe LIKE ? OR CONCAT_WS(" ", c.cliNom, c.cliApe) LIKE ?)'
      );
      const like = `%${filtros.cliente}%`;
      params.push(like, like, like, like);
    }

    const whereSQL = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(' AND ')}`
      : '';

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total
      FROM ventas v
      JOIN cliente c ON c.cliId = v.cliIdFk
      ${whereSQL}`,
      params
    );

    return total;
  }

  /**
   * Obtener una venta por ID con datos de cliente y usuario
   */
  static async getById(id) {
    const [[row]] = await db.query(
      `SELECT 
        v.venId AS venta_id,
        v.venFec AS fecha_registro,
        v.estadoPago AS estado,
        v.venTotal AS total,
        v.venDesc AS descuento,
        v.venFecVenLimit AS fecha_limite_pago,
        v.pedIdFk AS pedido_id,
        c.cliId AS cliente_id,
        c.cliNom AS cliente_nombres,
        c.cliApe AS cliente_apellidos,
        u.usuId AS user_id,
        u.usuNom AS user_nombres,
        u.usuApe AS user_apellidos
      FROM ventas v
      JOIN cliente c ON c.cliId = v.cliIdFk
      LEFT JOIN usuario u ON u.usuId = v.usuIdFk
      WHERE v.venId = ? AND v.estadoPago <> 'ANULADO'`,
      [id]
    );

    return row || null;
  }

  /**
   * Obtener detalles de una venta con paginación
   */
  static async getDetallesByVentaId(ventaId, limite = 15, offset = 0) {
    const [rows] = await db.query(
      `SELECT 
        dv.detVenId AS detalle_id,
        dv.idProFk AS producto_id,
        p.proNom AS producto_nombre,
        dv.cantidad,
        dv.precio,
        dv.subtotal
      FROM det_venta dv
      JOIN productos p ON p.proId = dv.idProFk
      WHERE dv.idVenFk = ?
      ORDER BY dv.detVenId ASC
      LIMIT ? OFFSET ?`,
      [ventaId, limite, offset]
    );

    return rows;
  }

  /**
   * Contar detalles de una venta
   */
  static async countDetallesByVentaId(ventaId) {
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM det_venta WHERE idVenFk = ?',
      [ventaId]
    );

    return total;
  }

  /**
   * Registrar una venta usando el SP sp_registrar_venta
   * Retorna { venId, venTotal }
   */
  static async create(data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `CALL sp_registrar_venta(
          ?, ?, ?, ?, ?, ?, ?, ?, @venId, @venTotal
        )`,
        [
          data.cliente_id,
          data.usuario_id,
          data.descuento ?? 0,
          data.pedido_id,
          data.fecha_limite_pago,
          data.pago_inicial ?? 0,
          data.metodo_pago,
          JSON.stringify(data.detalles)
        ]
      );

      const [[{ venId, venTotal }]] = await connection.query(
        'SELECT @venId AS venId, @venTotal AS venTotal'
      );

      await connection.commit();

      return { venId, venTotal };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Actualizar campos de una venta (venDesc, venFecVenLimit)
   */
  static async update(id, data) {
    const fields = [];
    const values = [];

    if (data.descuento !== undefined) {
      fields.push('venDesc = ?');
      values.push(data.descuento);
    }

    if (data.fecha_limite_pago !== undefined) {
      fields.push('venFecVenLimit = ?');
      values.push(data.fecha_limite_pago);
    }

    if (fields.length === 0) return false;

    values.push(id);

    const [result] = await db.query(
      `UPDATE ventas SET ${fields.join(', ')} WHERE venId = ? AND estadoPago <> 'ANULADO'`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Anular venta (cambiar estado a ANULADO)
   */
  static async anular(id) {
    const [result] = await db.query(
      "UPDATE ventas SET estadoPago = 'ANULADO' WHERE venId = ? AND estadoPago <> 'ANULADO'",
      [id]
    );

    return result.affectedRows > 0;
  }
}
