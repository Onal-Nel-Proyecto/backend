import db from "../config/db.js";

export class AbastecimientoModel {
  static async getByProveedorId(proveedorId, limit = 15, offset = 0) {
    const sql = `
      SELECT 
        id AS id_abastecimiento,
        abaFec AS fecha_abastecimiento
      FROM abastecimiento
      WHERE provIdFk = ?
      ORDER BY abaFec DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [proveedorId, limit, offset]);
    return rows;
  }

  static async getTotalByProveedorId(proveedorId) {
    const sql = 'SELECT COUNT(*) AS total FROM abastecimiento WHERE provIdFk = ?';
    const [rows] = await db.query(sql, [proveedorId]);
    return rows[0].total;
  }

  static async getDetallesByAbsId(absId) {
    const sql = `
      SELECT 
        dt.detAbsId AS id,
        dt.detAbsTip AS tipo_suministro,
        dt.detAbsCant AS cantidad,
        dt.detAbsCos AS costo_de_compra,
        dt.detAbsRefId AS id_referencia,
        CASE
          WHEN dt.detAbsTip = 'PRODUCTO'
            THEN p.proNom
          WHEN dt.detAbsTip = 'MATERIAL'
            THEN m.matNom
          ELSE NULL
        END AS nombre_suministro
      FROM detalle_abastecimiento dt
      LEFT JOIN productos p
        ON dt.detAbsTip = 'PRODUCTO'
        AND p.proId = dt.detAbsRefId
      LEFT JOIN materiales m
        ON dt.detAbsTip = 'MATERIAL'
        AND m.matId = dt.detAbsRefId
      WHERE dt.absIdFk = ?
    `;
    const [rows] = await db.query(sql, [absId]);
    return rows;
  }
}
