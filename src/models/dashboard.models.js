import db from "../config/db.js";

export class DashboardModel {

  // ─────────────────────────────────────────────
  //  Métodos existentes del dashboard general
  // ─────────────────────────────────────────────

  static async getResumen() {
    const [[pedidos]] = await db.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN pedEst = 'pendiente' THEN 1 ELSE 0 END) AS pendientes,
        SUM(CASE WHEN pedEst = 'en proceso' THEN 1 ELSE 0 END) AS en_proceso,
        SUM(CASE WHEN pedEst = 'terminado' THEN 1 ELSE 0 END) AS terminados,
        SUM(CASE WHEN pedEst = 'cancelado' THEN 1 ELSE 0 END) AS cancelados
      FROM pedidos
    `);
    return pedidos;
  }

  static async getPedidosPorEstado() {
    const [rows] = await db.query(`
      SELECT 
        pedEst AS estado,
        COUNT(*) AS cantidad
      FROM pedidos
      GROUP BY pedEst
      ORDER BY cantidad DESC
    `);
    return rows;
  }

  static async getTopClientes(limite = 10) {
    const [rows] = await db.query(`
      SELECT 
        c.cliId AS cliente_id,
        CONCAT_WS(' ', c.cliNom, c.cliApe) AS nombre,
        COUNT(p.pedId) AS total_pedidos
      FROM cliente c
      LEFT JOIN pedidos p ON p.pedCliIdFk = c.cliId
      GROUP BY c.cliId, c.cliNom, c.cliApe
      ORDER BY total_pedidos DESC
      LIMIT ?
    `, [limite]);
    return rows;
  }

  static async getPedidosRecientes(limite = 5) {
    const [rows] = await db.query(`
      SELECT 
        p.pedId AS id,
        p.pedDesc AS descripcion,
        CONCAT_WS(' ', c.cliNom, c.cliApe) AS cliente,
        pedEst AS estado,
        DATE(pedFecIng) AS fecha_ingreso,
        DATE(pedFecEst) AS fecha_estimada
      FROM pedidos p
      JOIN cliente c ON c.cliId = p.pedCliIdFk
      ORDER BY pedFecIng DESC
      LIMIT ?
    `, [limite]);
    return rows;
  }

  // ─────────────────────────────────────────────
  //  Dashboard de Pedidos — Resumen indicadores
  // ─────────────────────────────────────────────
  static async getPedidosDashboardSummary() {
    const [[result]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM pedidos WHERE pedEst = 'pendiente') AS pendientes,
        (SELECT COUNT(*) FROM pedidos WHERE pedEst = 'en proceso') AS enProceso,
        (SELECT COUNT(*) FROM pedidos
         WHERE DATE(pedFecEst) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
           AND pedEst NOT IN ('TERMINADO', 'ENTREGADO', 'CANCELADO')
        ) AS entregasSemana,
        (SELECT COUNT(*) FROM pedidos
         WHERE pedFecEst < CURDATE()
           AND pedEst NOT IN ('TERMINADO', 'ENTREGADO', 'CANCELADO')
        ) AS retrasados
    `);
    return result;
  }

  // ─────────────────────────────────────────────
  //  Dashboard de Pedidos — Carga de producción
  // ─────────────────────────────────────────────
  static async getProduccionLoad() {
    const [[result]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM produccion WHERE estado IN ('PENDIENTE', 'EN PROCESO')) AS actual,
        (SELECT COUNT(*) FROM produccion) AS capacidad
    `);
    return result;
  }

  // ─────────────────────────────────────────────
  //  Dashboard de Pedidos — Eventos calendario
  // ─────────────────────────────────────────────
  static async getCalendarEvents() {
    const [rows] = await db.query(`
      SELECT
        p.pedId AS id,
        p.pedDesc AS numeroPedido,
        CONCAT_WS(' ', c.cliNom, c.cliApe) AS cliente,
        DATE(p.pedFecEst) AS fechaEntrega,
        p.pedEst AS estado,
        p.pedTolEst AS total
      FROM pedidos p
      JOIN cliente c ON c.cliId = p.pedCliIdFk
      WHERE p.pedFecEst IS NOT NULL
        AND p.pedEst NOT IN ('CANCELADO')
      ORDER BY p.pedFecEst ASC
    `);
    return rows;
  }

  // ─────────────────────────────────────────────
  //  Dashboard de Pedidos — Producción activa
  // ─────────────────────────────────────────────
  static async getActiveProduction() {
    const [rows] = await db.query(`
      SELECT
        p.pedId AS id,
        CONCAT_WS(' ', c.cliNom, c.cliApe) AS cliente,
        pr.proNom AS producto,
        ct.catNom AS categoria,
        prod.cantidad
      FROM produccion prod
      JOIN det_pedido dp ON dp.detPedId = prod.detPedIdFk
      JOIN pedidos p ON p.pedId = dp.pedIdFk
      JOIN cliente c ON c.cliId = p.pedCliIdFk
      JOIN productos pr ON pr.proId = dp.proIdFk
      LEFT JOIN categoria ct ON ct.catId = pr.ProCatFk
      WHERE prod.estado IN ('PENDIENTE', 'EN PROCESO')
      ORDER BY prod.fecha_inicio ASC
      LIMIT 5
    `);
    return rows;
  }

  // ─────────────────────────────────────────────
  //  Dashboard de Pedidos — Últimos pedidos
  // ─────────────────────────────────────────────
  static async getUltimosPedidos() {
    const [rows] = await db.query(`
      SELECT
        p.pedId AS id,
        CONCAT_WS(' ', c.cliNom, c.cliApe) AS cliente,
        DATE(p.pedFecIng) AS fechaRegistro,
        DATE(p.pedFecEst) AS fechaEntrega,
        p.pedEst AS estado,
        p.pedTolEst AS total
      FROM pedidos p
      JOIN cliente c ON c.cliId = p.pedCliIdFk
      ORDER BY p.pedFecIng DESC
      LIMIT 5
    `);
    return rows;
  }
}
