import db from "../config/db.js";

export class FacturaModel {

  /** Obtener datos principales de la factura por venta */
  static async getFacturaByVenta(venta_id) {
    const [[row]] = await db.query(
      `SELECT 
        f.facId AS factura_id,
        f.facFecEmi AS fecha_emision,
        f.facVenIdFk AS venta_id,
        f.facEst AS estado,

        v.estadoPago AS venta_estado,
        v.venTotal AS subtotal,
        v.venDesc AS descuento,
        v.pedIdFk AS pedido_id,

        p.pedEst AS pedido_estado,

        c.cliNumDoc AS cliente_id,
        c.cliNom AS nombres,
        c.cliApe AS apellidos,
        c.cliDir AS direccion,
        c.cliCorr AS correo,

        (
          SELECT cl.cliTel
          FROM cliente_telefono cl
          WHERE cl.cliIdFk = c.cliId
          LIMIT 1
        ) AS telefono

      FROM factura f

      JOIN ventas v 
        ON v.venId = f.facVenIdFk

      LEFT JOIN pedidos p 
        ON p.pedId = v.pedIdFk

      JOIN cliente c 
        ON v.cliIdFk = c.cliId

      WHERE f.facVenIdFk = ? AND facEst <> 'ANULADA'`,
      [venta_id]
    );

    return row || null;
  }

  /** Obtener datos principales de la factura por ID de factura */
  static async getFacturaById(factura_id) {
    const [[row]] = await db.query(
      `SELECT 
        f.facId AS factura_id,
        f.facFecEmi AS fecha_emision,
        f.facVenIdFk AS venta_id,
        f.facEst AS estado,

        v.estadoPago AS venta_estado,
        v.venTotal AS subtotal,
        v.venDesc AS descuento,
        v.pedIdFk AS pedido_id,

        p.pedEst AS pedido_estado,

        v.cliIdFk AS cliente_id,
        c.cliNom AS nombres,
        c.cliApe AS apellidos,
        c.cliDir AS direccion,
        c.cliCorr AS correo,

        (
          SELECT cl.cliTel
          FROM cliente_telefono cl
          WHERE c.cliId = cl.cliIdFk
          LIMIT 1
        ) AS telefono

      FROM factura f

      JOIN ventas v 
        ON v.venId = f.facVenIdFk

      LEFT JOIN pedidos p 
        ON p.pedId = v.pedIdFk

      JOIN cliente c 
        ON v.cliIdFk = c.cliId

      WHERE f.facId = ? AND facEst <> 'ANULADA'`,
      [factura_id]
    );

    return row || null;
  }

  /** Obtener detalle de productos de la venta */
  static async getDetalles(venta_id) {
    const [rows] = await db.query(
      `SELECT 
        dt.detVenId AS detalle_id,
        dt.cantidad,
        dt.precio AS precio_unitario,
        dt.subtotal,
        p.proNom AS producto_nombre
      FROM det_venta dt
      JOIN productos p ON p.proId = dt.idProFk
      WHERE dt.idVenFk = ?`,
      [venta_id]
    );

    return rows;
  }

  /** Obtener métodos de pago usados en la venta */
  static async getMetodosPago(venta_id) {
    const [rows] = await db.query(
      `SELECT pag.pagMetPag AS metodo_pago
      FROM pagos pag
      WHERE pag.pagVenIdFk = ?
      GROUP BY pag.pagMetPag`,
      [venta_id]
    );

    return rows.map(r => r.metodo_pago);
  }

  /** Crear factura usando el SP */
  static async create(venta_id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "CALL sp_generar_factura(?, @id_factura)",
        [venta_id]
      );

      const [[{ id_factura }]] = await connection.query(
        "SELECT @id_factura AS id_factura"
      );

      await connection.commit();

      return { factura_id: id_factura, status: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /** Anular factura */
  static async anular(factura_id) {
    const [result] = await db.query(
      "UPDATE factura SET facEst = 'ANULADA' WHERE facId = ? AND facEst <> 'ANULADO'",
      [factura_id]
    );
    return result.affectedRows > 0;
  }

  /** Validar que una venta existe */
  static async validarVenta(venta_id) {
    const [[row]] = await db.query(
      'SELECT venId FROM ventas WHERE venId = ?',
      [venta_id]
    );
    return row || null;
  }

  /** Validar que una venta no tenga ya una factura */
  static async validarFacturaExistente(venta_id) {
    const [[row]] = await db.query(
      "SELECT facId FROM factura WHERE facVenIdFk = ? AND facEst <> 'ANULADA'",
      [venta_id]
    );
    return row || null;
  }
}
