import db from "../config/db.js";

export class PagosModel {

  /** Obtener pagos filtrados por pedido_id o venta_id */
  static async getPagos({ pedido_id, venta_id, pagina = 1, limite = 5 }) {
    const offset = (pagina - 1) * limite;

    let whereClause = '';
    const params = [];

    if (pedido_id) {
      whereClause = 'WHERE pagPedIdFk = ?';
      params.push(pedido_id);
    } else if (venta_id) {
      whereClause = 'WHERE pagVenIdFk = ?';
      params.push(venta_id);
    }
    // console.log(pedido_id)

    const [rows] = await db.query(
      `SELECT 
        pagId AS pago_id,
        pagVenIdFk AS venta_id,
        pagPedIdFk AS pedido_id,
        pagMon AS monto,
        pagMetPag AS metodo_pago,
        pagFec AS fecha_registro,
        pagEst AS estado
      FROM pagos
      ${whereClause}
      ORDER BY pagFec DESC
      LIMIT ? OFFSET ?`,
      [...params, limite, offset]
    );


    return rows;
  }

  /** Contar total de pagos filtrados */
  static async countPagos({ pedido_id, venta_id }) {
    let whereClause = '';
    const params = [];

    if (pedido_id) {
      whereClause = 'WHERE pagPedIdFk = ?';
      params.push(pedido_id);
    } else if (venta_id) {
      whereClause = 'WHERE pagVenIdFk = ?';
      params.push(venta_id);
    }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM pagos ${whereClause}`,
      params
    );

    return total;
  }

  /** Obtener resumen de pagos de un pedido */
  static async getResumenPedido(pedido_id) {
    // modificar esto para ser reutlizable con venta
    const [[row]] = await db.query(
      `SELECT
        ped.pedTolEst AS total,
        COALESCE(SUM(CASE WHEN p.pagEst <> 'RECHAZADO' THEN p.pagMon ELSE 0 END), 0) AS total_pagado,
        (COALESCE(ped.pedTolEst, 0) - COALESCE(SUM(CASE WHEN p.pagEst <> 'RECHAZADO' THEN p.pagMon ELSE 0 END), 0)) AS faltante
      FROM pedidos ped
      LEFT JOIN pagos p ON p.pagPedIdFk = ped.pedId
      WHERE ped.pedId = ?
      GROUP BY ped.pedId, ped.pedTolEst`,
      [pedido_id]
    );

    return row || null;
  }

  /** Obtener resumen de pagos de una venta */
  static async getResumenVenta(venta_id) {
    const [[row]] = await db.query(
      `SELECT
        v.venTotal AS total,
        COALESCE(SUM(CASE WHEN p.pagEst <> 'RECHAZADO' THEN p.pagMon ELSE 0 END), 0) AS total_pagado,
        (COALESCE(v.venTotal, 0) - COALESCE(SUM(CASE WHEN p.pagEst <> 'RECHAZADO' THEN p.pagMon ELSE 0 END), 0)) AS faltante
      FROM ventas v
      LEFT JOIN pagos p ON p.pagVenIdFk = v.venId
      WHERE v.venId = ?
      GROUP BY v.venId, v.venTotal`,
      [venta_id]
    );

    return row || null;
  }

  /** Validar que un pedido existe y no está cancelado */
  static async validarPedido(pedido_id) {
    const [[row]] = await db.query(
      'SELECT pedId, pedEst FROM pedidos WHERE pedId = ?',
      [pedido_id]
    );
    return row || null;
  }

  /** Validar que una venta existe */
  static async validarVenta(venta_id) {
    const [[row]] = await db.query(
      'SELECT venId, venTotal FROM ventas WHERE venId = ?',
      [venta_id]
    );
    return row || null;
  }

  /** Crear un nuevo pago */
  static async create({ pedido_id, venta_id, monto, metodo_pago }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "CALL sp_generar_siguiente_id('PAG','pagos','pagId', @id)"
      );

      const [[{ id }]] = await connection.query("SELECT @id as id");

      await connection.query(
        `INSERT INTO pagos (pagId, pagPedIdFk, pagVenIdFk, pagMon, pagMetPag, pagEst)
        VALUES (?, ?, ?, ?, ?, 'COMPLETADO')`,
        [id, pedido_id || null, venta_id || null, monto, metodo_pago]
      );

      await connection.commit();

      return { insertId: id, status: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /** Rechazar un pago */
  static async rechazar(pago_id) {
    const [result] = await db.query(
      "UPDATE pagos SET pagEst = 'RECHAZADO' WHERE pagId = ? AND pagEst <> 'RECHAZADO'",
      [pago_id]
    );
    return result.affectedRows > 0;
  }
}
