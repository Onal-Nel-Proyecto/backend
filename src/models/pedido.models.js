import { format } from "morgan";
import db from "../config/db.js";

export class PedidoModel {
  static async countPedidos(filtros = {}) {
    const whereClauses = [];
    const values = [];

    // Por defecto: solo pedidos activos (pendiente + en_proceso)
    // Si se pasa ?estado=completados → trae terminado + entregado
    if (!filtros.estado) {
      whereClauses.push("pedEst IN ('pendiente', 'en_proceso')");
    } else if (filtros.estado === 'completados') {
      whereClauses.push("pedEst IN ('terminado', 'entregado')");
    } else {
      whereClauses.push("pedEst = ?");
      values.push(filtros.estado);
    }

    if (filtros.fecha_desde) {
      whereClauses.push("DATE(pedFecIng) >= ?");
      values.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      whereClauses.push("DATE(pedFecIng) <= ?");
      values.push(filtros.fecha_hasta);
    }

    if (filtros.cliente) {
      whereClauses.push("(c.cliNom LIKE ? OR c.cliApe LIKE ? OR CONCAT_WS(' ', c.cliNom, c.cliApe) LIKE ?)");
      const like = `%${filtros.cliente}%`;
      values.push(like, like, like);
    }

    if (filtros.tipo_pedido) {
      whereClauses.push("pedTipPed = ?");
      values.push(filtros.tipo_pedido);
    }

    if (filtros.fecha_entrega_desde) {
      whereClauses.push("DATE(pedFecEst) >= ?");
      values.push(filtros.fecha_entrega_desde);
    }

    if (filtros.fecha_entrega_hasta) {
      whereClauses.push("DATE(pedFecEst) <= ?");
      values.push(filtros.fecha_entrega_hasta);
    }

    if (filtros.descripcion) {
      whereClauses.push("pedDesc LIKE ?");
      values.push(`%${filtros.descripcion}%`);
    }

    const whereSQL = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    // Si se filtra por estado_pago, necesitamos la subconsulta con el JOIN a pagos
    if (filtros.estado_pago) {
      const [rows] = await db.query(
        `SELECT COUNT(*) AS total FROM (
          SELECT
            CASE
              WHEN COALESCE(pag.total_pagado, 0) >= p.pedTolEst AND p.pedTolEst > 0 THEN 'PAGADO'
              WHEN COALESCE(pag.total_pagado, 0) > 0 THEN 'ABONADO'
              ELSE 'SIN PAGAR'
            END AS estado_pago
          FROM pedidos p
          JOIN cliente c ON c.cliId = p.pedCliIdFk
          LEFT JOIN (
            SELECT
              pagPedIdFk,
              COALESCE(SUM(CASE WHEN pagEst <> 'RECHAZADO' THEN pagMon ELSE 0 END), 0) AS total_pagado
            FROM pagos
            GROUP BY pagPedIdFk
          ) pag ON pag.pagPedIdFk = p.pedId
          ${whereSQL}
        ) AS sub
        WHERE sub.estado_pago = ?`,
        [...values, filtros.estado_pago]
      );
      return Number(rows[0].total);
    }

    // Sin filtro estado_pago: count directo
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total FROM pedidos p
      JOIN cliente c ON c.cliId = p.pedCliIdFk
      ${whereSQL}`,
      values
    );
    return Number(rows[0].total)
  }

  static async getAllPedidos(pag = 1, limite = 15, filtros = {}) {
    // variables de paginacion
    const indice = limite * (pag - 1);

    // construir WHERE dinámico según filtros (excepto estado_pago que va aparte)
    const whereClauses = [];
    const values = [];

    // Por defecto: solo pedidos activos (pendiente + en_proceso)
    // Si se pasa ?estado=completados → trae terminado + entregado
    if (!filtros.estado) {
      whereClauses.push("pedEst IN ('pendiente', 'en_proceso')");
    } else if (filtros.estado === 'completados') {
      whereClauses.push("pedEst IN ('terminado', 'entregado')");
    } else {
      whereClauses.push("pedEst = ?");
      values.push(filtros.estado);
    }

    if (filtros.fecha_desde) {
      whereClauses.push("DATE(pedFecIng) >= ?");
      values.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      whereClauses.push("DATE(pedFecIng) <= ?");
      values.push(filtros.fecha_hasta);
    }

    if (filtros.cliente) {
      whereClauses.push("(c.cliNom LIKE ? OR c.cliApe LIKE ? OR CONCAT_WS(' ', c.cliNom, c.cliApe) LIKE ?)");
      const like = `%${filtros.cliente}%`;
      values.push(like, like, like);
    }

    if (filtros.tipo_pedido) {
      whereClauses.push("pedTipPed = ?");
      values.push(filtros.tipo_pedido);
    }

    if (filtros.fecha_entrega_desde) {
      whereClauses.push("DATE(pedFecEst) >= ?");
      values.push(filtros.fecha_entrega_desde);
    }

    if (filtros.fecha_entrega_hasta) {
      whereClauses.push("DATE(pedFecEst) <= ?");
      values.push(filtros.fecha_entrega_hasta);
    }

    if (filtros.descripcion) {
      whereClauses.push("pedDesc LIKE ?");
      values.push(`%${filtros.descripcion}%`);
    }

    const whereSQL = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    // Filtro por estado_pago (se aplica fuera de la subconsulta)
    let estadoPagoWhere = '';
    if (filtros.estado_pago) {
      estadoPagoWhere = 'WHERE sub.estado_pago = ?';
      values.push(filtros.estado_pago);
    }

    // 🔥 parámetros finales: valores del WHERE + posible estado_pago + LIMIT + OFFSET
    values.push(limite, indice);

    const [rows] = await db.query(
      `
      SELECT
        sub.id,
        sub.descripcion,
        sub.cliente_nombres,
        sub.fecha_estimada,
        sub.estado,
        sub.dias_faltantes,
        sub.estado_pago,
        sub.total_pedido
      FROM (
        SELECT
          p.pedId AS id,
          p.pedDesc AS descripcion,
          CONCAT_WS(' ', c.cliNom, c.cliApe) AS cliente_nombres,
          DATE(p.pedFecEst) AS fecha_estimada,
          p.pedEst AS estado,
          p.pedTolEst AS total_pedido,
          fn_dias_restantes_pedido(p.pedId) AS dias_faltantes,
          CASE
            WHEN COALESCE(pag.total_pagado, 0) >= p.pedTolEst AND p.pedTolEst > 0 THEN 'PAGADO'
            WHEN COALESCE(pag.total_pagado, 0) > 0 THEN 'ABONADO'
            ELSE 'SIN PAGAR'
          END AS estado_pago
        FROM pedidos p
        JOIN cliente c ON c.cliId = p.pedCliIdFk
        LEFT JOIN (
          SELECT
            pagPedIdFk,
            COALESCE(SUM(CASE WHEN pagEst <> 'RECHAZADO' THEN pagMon ELSE 0 END), 0) AS total_pagado
          FROM pagos
          GROUP BY pagPedIdFk
        ) pag ON pag.pagPedIdFk = p.pedId
        ${whereSQL}
      ) AS sub
      ${estadoPagoWhere}
      ORDER BY sub.fecha_estimada DESC
      LIMIT ? OFFSET ?
      `,
      values
    );

    return rows;
  }

  static async create(data) {
    const { cliente_id, fecha_estimada, observaciones, recordatorio, descripcion, usuarioId, tipo_pedido } = data
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        "CALL sp_generar_siguiente_id('PD','pedidos','pedId', @id)"
      );

      const [[{ id }]] = await connection.query("SELECT @id as id");

      await connection.query(
        `INSERT INTO pedidos 
      (pedId,pedCliIdFk, pedFecEst, pedObs, pedRecor, pedDesc, pedUsuIdFk, pedTipPed, pedFecIng)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [id, cliente_id, fecha_estimada, observaciones, recordatorio, descripcion, usuarioId, tipo_pedido]
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

  static async getById(id) {
    const [rows] = await db.query(`
      SELECT 
        p.pedId AS id,
        p.pedCliIdFk AS cliente_id,
        CONCAT_WS(' ', c.cliNom, c.cliApe) AS cliente_name,
        p.pedUsuIdFk AS user_id,
        CONCAT_WS(' ', u.usuNom, u.usuApe) AS user_name,
        p.pedDesc AS descripcion,
        p.pedEst AS estado,
        p.pedObs AS obs,
        p.pedFecEst AS f_estimada,
        p.pedFecEnt AS f_entrega,
        p.pedFecIng AS f_ingreso,
        p.pedRecor AS recordatorio,
        p.pedTolEst AS total_pedido,
        v.venId AS venta_id,
        CASE 
          WHEN COALESCE(pag.total_pagado, 0) >= p.pedTolEst AND p.pedTolEst > 0 THEN 'PAGADO'
          WHEN COALESCE(pag.total_pagado, 0) > 0 THEN 'ABONADO'
          ELSE 'SIN PAGAR'
        END AS estado_pago
      FROM pedidos p
      LEFT JOIN cliente c ON c.cliId = p.pedCliIdFk
      LEFT JOIN usuario u ON u.usuId = p.pedUsuIdFk
      LEFT JOIN ventas v ON v.pedIdFk = p.pedId
      LEFT JOIN (
        SELECT
          pagPedIdFk,
          COALESCE(SUM(CASE WHEN pagEst <> 'RECHAZADO' THEN pagMon ELSE 0 END), 0) AS total_pagado
        FROM pagos
        GROUP BY pagPedIdFk
      ) pag ON pag.pagPedIdFk = p.pedId
      WHERE p.pedId = ?`,
      [id])
    return rows.length > 0 ? rows : null
  }
  static async update(id, setClause, values) {

    const query = `
      UPDATE pedidos
      SET ${setClause}
      WHERE pedId = ?
    `;
    // console.log(values)
    await db.query(query, [...values, id]);
  }

  static async cancelar(connection, id, usuarioId, motivo) {
    await connection.query(
      "CALL sp_cancelar_pedido(?, ?, ?, @result)",
      [id, usuarioId, motivo]
    );

    const [[{ result }]] = await connection.query("SELECT @result AS result");
    return result;
  }
  /**
   * Entregar un pedido: cambia estado a ENTREGADO y registra fecha de entrega
   * @param {string} pedidoId - ID del pedido
   * @param {string} usuarioId - ID del usuario que entrega
   * @returns {Promise<object>} { status: true } o lanza error
   */
  /**
   * Entregar un pedido: llama al SP y registra la fecha de entrega
   * @param {string} pedidoId - ID del pedido
   * @param {string} usuarioId - ID del usuario que entrega
   * @param {object} connection - Conexión (transaction desde el service)
   * @returns {Promise<object>} Resultado del SP
   */
  static async entregar(pedidoId, usuarioId, connection) {
    // 1. Llamar al SP que valida y cambia el estado
    await connection.query(
      `CALL sp_cambiar_estado_pedido(?, 'ENTREGADO', ?, 'Pedido entregado al cliente', @result)`,
      [pedidoId, usuarioId]
    );

    const [[{ result }]] = await connection.query('SELECT @result AS result');

    if (result !== 'OK') {
      throw new Error(result || 'Error al cambiar estado del pedido');
    }

    // 2. Registrar la fecha de entrega real
    await connection.query(
      `UPDATE pedidos SET pedFecEnt = NOW() WHERE pedId = ?`,
      [pedidoId]
    );

    return { status: true };
  }

  /**
   * Obtener pedidos completados (TERMINADO + ENTREGADO) con paginación
   * @param {number} pag - Número de página
   * @param {number} limite - Registros por página
   * @returns {Promise<Array>} Lista de pedidos
   */
  static async getAllEntregas(pag = 1, limite = 15) {
    const indice = limite * (pag - 1);

    const [rows] = await db.query(
      `
      SELECT
        p.pedId AS id,
        p.pedDesc AS descripcion,
        CONCAT_WS(' ', c.cliNom, c.cliApe) AS cliente_nombres,
        DATE(p.pedFecEst) AS fecha_estimada,
        DATE(p.pedFecEnt) AS fecha_entrega,
        p.pedEst AS estado,
        CASE
          WHEN COALESCE(pag.total_pagado, 0) >= p.pedTolEst AND p.pedTolEst > 0 THEN 'PAGADO'
          WHEN COALESCE(pag.total_pagado, 0) > 0 THEN 'ABONADO'
          ELSE 'SIN PAGAR'
        END AS estado_pago
      FROM pedidos p
      JOIN cliente c ON c.cliId = p.pedCliIdFk
      LEFT JOIN (
        SELECT
          pagPedIdFk,
          COALESCE(SUM(CASE WHEN pagEst <> 'RECHAZADO' THEN pagMon ELSE 0 END), 0) AS total_pagado
        FROM pagos
        GROUP BY pagPedIdFk
      ) pag ON pag.pagPedIdFk = p.pedId
      WHERE p.pedEst IN ('TERMINADO', 'ENTREGADO')
      ORDER BY p.pedFecEnt DESC, p.pedFecEst DESC
      LIMIT ? OFFSET ?
      `,
      [limite, indice]
    );

    return rows;
  }

  /**
   * Contar pedidos completados (TERMINADO + ENTREGADO)
   * @returns {Promise<number>}
   */
  static async countEntregas() {
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM pedidos WHERE pedEst IN ('TERMINADO', 'ENTREGADO')`
    );
    return Number(total);
  }

  static async updateStatus({pedidoId, usu_id, estado, motivo}) {
    const sql = `
    CALL sp_cambiar_estado_pedido(
      ?, ?, ?, ?, @result
    )
  `;

    const values = [
      pedidoId,
      estado,
      usu_id,
      motivo ?? `la poduccion cambio el estado del pedido a ${estado}`
    ];

    // Ejecutar procedimiento
    await db.query(sql, values);

    // Obtener ID generado
    const [[result]] = await db.query(
      'SELECT @result AS resultado'
    );
    // console.log(result, estado)
    // Validar resultado
    if (!result) {
      throw new Error(
        'No se pudo cambiar el estado del pedido'
      );
    }

    return result.resultado;
  }
} 