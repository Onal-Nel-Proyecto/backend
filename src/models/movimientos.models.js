import db from "../config/db.js";

export class MovimientosModel {
  /**
   * Construye el WHERE dinámico para la consulta de movimientos
   * @param {object} filtros - { usuario, fecha_desde, fecha_hasta, tipo_suministro, tipo_mov }
   * @param {Array} values - Array de valores (se modifica por referencia)
   * @returns {string} Cláusula WHERE
   */
  static _buildWhere(filtros, values) {
    const whereClauses = [];

    // Filtro por usuario (nombre, apellido o ID)
    if (filtros.usuario) {
      whereClauses.push("(u.usuNom LIKE ? OR u.usuApe LIKE ? OR m.usuIdFk LIKE ?)");
      const like = `%${filtros.usuario}%`;
      values.push(like, like, like);
    }

    // Filtro por rango de fechas
    if (filtros.fecha_desde) {
      whereClauses.push("DATE(m.fecha) >= ?");
      values.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      whereClauses.push("DATE(m.fecha) <= ?");
      values.push(filtros.fecha_hasta);
    }

    // Filtro por tipo de suministro (PRODUCTO / MATERIAL)
    if (filtros.tipo_suministro) {
      whereClauses.push("m.tipoSuministro = ?");
      values.push(filtros.tipo_suministro);
    }

    // Filtro por tipo de movimiento (COMPRA / VENTA / PRODUCCION / AJUSTE)
    if (filtros.tipo_mov) {
      whereClauses.push("m.tipoMov = ?");
      values.push(filtros.tipo_mov);
    }

    return whereClauses.length > 0
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";
  }

  /**
   * Obtiene todos los movimientos con paginación y filtros
   * @param {number} pag - Número de página
   * @param {number} limite - Registros por página
   * @param {object} filtros - { usuario, fecha_desde, fecha_hasta, tipo_suministro, tipo_mov }
   * @returns {Promise<Array>}
   */
  static async getAll(pag = 1, limite = 15, filtros = {}) {
    const indice = limite * (pag - 1);
    const values = [];
    const whereSQL = this._buildWhere(filtros, values);

    values.push(limite, indice);

    const [rows] = await db.query(
      `SELECT
        m.idMov,
        m.tipoMov,
        m.tipoSuministro,
        m.referenciaID,
        m.cantidad,
        m.fecha,
        m.usuIdFk,
        u.usuNom,
        u.usuApe,
        m.stockAnterior,
        m.stockActual,
        m.motivo,
        CASE
          WHEN m.tipoSuministro = 'PRODUCTO' THEN p.proNom
          WHEN m.tipoSuministro = 'MATERIAL' THEN mat.matNom
          ELSE NULL
        END AS suministro_nombre
      FROM movimientos m
      LEFT JOIN usuario u ON u.usuId = m.usuIdFk
      LEFT JOIN productos p ON p.proId = m.referenciaID AND m.tipoSuministro = 'PRODUCTO'
      LEFT JOIN materiales mat ON mat.matId = m.referenciaID AND m.tipoSuministro = 'MATERIAL'
      ${whereSQL}
      ORDER BY m.fecha DESC
      LIMIT ? OFFSET ?`,
      values
    );

    return rows;
  }

  /**
   * Crea un nuevo movimiento en el inventario
   * @param {object} data - { tipoMov, tipoSuministro, referenciaID, cantidad, usuIdFk }
   * @returns {Promise<number>} ID del movimiento insertado
   */
  static async create({ tipoMov, tipoSuministro, referenciaID, cantidad, usuIdFk, stockAnterior, stockActual, motivo }) {
    const [result] = await db.query(
      `INSERT INTO movimientos (tipoMov, tipoSuministro, referenciaID, cantidad, usuIdFk, stockAnterior, stockActual, motivo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tipoMov, tipoSuministro, referenciaID || null, cantidad, usuIdFk || null, stockAnterior ?? null, stockActual ?? null, motivo ?? null]
    );
    return result.insertId;
  }

  /**
   * Cuenta el total de movimientos según los filtros
   * @param {object} filtros - { usuario, fecha_desde, fecha_hasta, tipo_suministro, tipo_mov }
   * @returns {Promise<number>}
   */
  static async countAll(filtros = {}) {
    const values = [];
    const whereSQL = this._buildWhere(filtros, values);

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total
      FROM movimientos m
      LEFT JOIN usuario u ON u.usuId = m.usuIdFk
      ${whereSQL}`,
      values
    );

    return Number(total);
  }
}
