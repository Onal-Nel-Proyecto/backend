import db from "../config/db.js";

export class DashboardModel {

  static async getResumen() {
    const [[pedidos]] = await db.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN pedEst = 'pendiente' THEN 1 ELSE 0 END) AS pendientes,
        SUM(CASE WHEN pedEst = 'en_proceso' THEN 1 ELSE 0 END) AS en_proceso,
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
}
