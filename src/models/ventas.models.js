import db from '../config/db.js';

export class VentasModel {
  /**
   * Obtener ventas paginadas con filtros desde la vista vw_ventas_detalladas
   */
  static async getAll(filtros = {}, limite = 15, offset = 0) {
    const whereClauses = [];
    const params = [];

    // Filtro estado: si se proporciona, filtra por ese valor exacto
    // Si no se proporciona, excluye ANULADO por defecto
    if (filtros.estado) {
      whereClauses.push('v.estadoPago = ?');
      params.push(filtros.estado);
    } else {
      whereClauses.push("v.estadoPago <> 'ANULADO'");
    }

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
        "(c.cliId LIKE ? OR c.cliNom LIKE ? OR c.cliApe LIKE ? OR CONCAT_WS(' ', c.cliNom, c.cliApe) LIKE ?)"
      );
      const like = `%${filtros.cliente}%`;
      console.log(like)
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
    const whereClauses = [];
    const params = [];

    // Filtro estado: si se proporciona, filtra por ese valor exacto
    // Si no se proporciona, excluye ANULADO por defecto
    if (filtros.estado) {
      whereClauses.push('v.estadoPago = ?');
      params.push(filtros.estado);
    } else {
      whereClauses.push("v.estadoPago <> 'ANULADO'");
    }

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
        "(c.cliId LIKE ? OR c.cliNom LIKE ? OR c.cliApe LIKE ? OR CONCAT_WS(' ', c.cliNom, c.cliApe) LIKE ?)"
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

  // ─────────────────────────────────────────────
  //  Resumen global (no afectado por filtros)
  // ─────────────────────────────────────────────

  /**
   * Obtener resumen global de ventas: total_vendido del mes, total cobrado,
   * pendiente por cobrar, y cantidad de ventas con abonos parciales activos.
   * No se ve afectado por ningún filtro de listado.
   */
  static async getResumenGlobal() {
    const [[row]] = await db.query(
      `SELECT
        MONTH(CURDATE()) AS mes,
        YEAR(CURDATE()) AS anio,
        COALESCE(SUM(CASE WHEN MONTH(v.venFec) = MONTH(CURDATE()) AND YEAR(v.venFec) = YEAR(CURDATE()) THEN v.venTotal END), 0) AS total_vendido,
        COUNT(CASE WHEN MONTH(v.venFec) = MONTH(CURDATE()) AND YEAR(v.venFec) = YEAR(CURDATE()) THEN 1 END) AS ventas_procesadas,
        COALESCE(SUM(pg_mes.total_pagado_mes), 0) AS total_cobrado_mes,
        COUNT(CASE WHEN v.estadoPago = 'PAGADO'
                      AND MONTH(v.venFec) = MONTH(CURDATE())
                      AND YEAR(v.venFec) = YEAR(CURDATE())
                THEN 1 END) AS ventas_completadas,
        COALESCE(SUM(v.venTotal - COALESCE(pg.total_pagado, 0)), 0) AS cobro_pendiente,
        COUNT(CASE WHEN v.estadoPago = 'ADELANTADO' THEN 1 END) AS abonos,
        (SELECT COALESCE(SUM(v2.venTotal), 0)
         FROM ventas v2
         WHERE DATE(v2.venFec) = CURDATE()
           AND v2.estadoPago <> 'ANULADO') AS ingreso_hoy_total,
        (SELECT COUNT(*)
         FROM ventas v2
         WHERE DATE(v2.venFec) = CURDATE()
           AND v2.estadoPago <> 'ANULADO') AS ingreso_hoy_cantidad,
        (SELECT COALESCE(SUM(p.pagMon), 0)
         FROM pagos p
         WHERE DATE(p.pagFec) = CURDATE()
           AND p.pagEst <> 'RECHAZADO') AS cobrado_hoy
      FROM ventas v
      LEFT JOIN (
        SELECT pagVenIdFk,
               SUM(CASE WHEN pagEst <> 'RECHAZADO' THEN pagMon ELSE 0 END) AS total_pagado
        FROM pagos
        GROUP BY pagVenIdFk
      ) pg ON pg.pagVenIdFk = v.venId
      LEFT JOIN (
        SELECT pagVenIdFk,
               SUM(CASE WHEN pagEst <> 'RECHAZADO' THEN pagMon ELSE 0 END) AS total_pagado_mes
        FROM pagos
        WHERE MONTH(pagFec) = MONTH(CURDATE())
          AND YEAR(pagFec) = YEAR(CURDATE())
        GROUP BY pagVenIdFk
      ) pg_mes ON pg_mes.pagVenIdFk = v.venId
      WHERE v.estadoPago <> 'ANULADO'`
    );

    return {
      total_vendido: {
        mes: row.mes,
        total: Number(row.total_vendido),
        ventas_procesadas: Number(row.ventas_procesadas)
      },
      total_cobrado: {
        total: Number(row.total_cobrado_mes),
        ventas_completadas: Number(row.ventas_completadas)
      },
      cobro_pendiente: Number(row.cobro_pendiente),
      abonos: Number(row.abonos),
      ingreso_hoy: {
        total: Number(row.ingreso_hoy_total),
        ventas_cantidad: Number(row.ingreso_hoy_cantidad)
      },
      cobrado_hoy: Number(row.cobrado_hoy)
    };
  }

  // ─────────────────────────────────────────────
  //  Reportes de ventas — SP almacenados
  // ─────────────────────────────────────────────

  /**
   * Ejecuta sp_reporte_ventas_mensual
   * @param {number} mes  (1-12)
   * @param {number} anio
   * @returns {Promise<Array>} Multi-result-set: [summary, topProductos, ventasPorDia]
   */
  static async getReporteVentasMensual(mes, anio) {
    const [results] = await db.query(
      'CALL sp_reporte_ventas_mensual(?, ?)',
      [mes, anio]
    );
    return results;
  }

  /**
   * Ejecuta sp_reporte_ventas_periodo
   * @param {string} fechaInicio  YYYY-MM-DD
   * @param {string} fechaFin     YYYY-MM-DD
   * @returns {Promise<Array>} Multi-result-set: [summary, topProductos, ventasPorDia]
   */
  static async getReporteVentasPeriodo(fechaInicio, fechaFin) {
    const [results] = await db.query(
      'CALL sp_reporte_ventas_periodo(?, ?)',
      [fechaInicio, fechaFin]
    );
    return results;
  }
}
