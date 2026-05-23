import { format } from "morgan";
import db from "../config/db.js";

export class PedidoModel {
  static async countPedidos() {
    const [rows] = await db.query('SELECT COUNT(*) AS total FROM pedidos')
    return Number(rows[0].total)
  }

  static async getAllPedidos(pag = 1, limite = 15, filtros = {}) {
    // variables de paginacion
    const indice = limite * (pag - 1);
    // console.log(pag, limite, filtros);

    // construir WHERE dinámico según filtros
    const whereClauses = [];
    const values = [];

    if (filtros.estado) {
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

    const whereSQL = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    // 🔥 parámetros finales: primero los del WHERE, luego LIMIT y OFFSET
    values.push(limite, indice);

    const [rows] = await db.query(
      `
      SELECT 
      p.pedId AS id,
      p.pedDesc AS descripcion,
      CONCAT_WS(' ', c.cliNom, c.cliApe) AS cliente_nombres,
      Date(pedFecEst) AS fecha_estimada,
      pedEst AS estado,
      fn_dias_restantes_pedido(p.pedId) AS dias_faltantes
      FROM pedidos p
      JOIN cliente c ON c.cliId = p.pedCliIdFk
      ${whereSQL}
      ORDER BY pedFecIng DESC
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
      p.pedFecIng AS f_ingreso
      FROM pedidos p
      LEFT JOIN cliente c ON c.cliId = p.pedCliIdFk
      LEFT JOIN usuario u ON u.usuId = p.pedUsuIdFk
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