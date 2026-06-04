import db from '../config/db.js';

export class DetallePedidoModel {
  constructor(connection) {
    this.connection = connection;
  }
  static async getDetallesByPedidoId(pedId) {
    const [rows] = await db.query(
      `
      SELECT 
      dt.detPedId,
      p.proId,
      p.proNom,
      p.proPreUni,
      p.proCatFk,
      p.proGen,
      p.proTall,
      p.proTipPre,
      dt.pedObs,
      dt.detPedCant,
      md.medId,
      md.medNom,
      dm.detPedMedVal,
      pd.prodId,
      pd.cantidad,
      pd.estado,
      pd.fecha_inicio,
      pd.fecha_fin
      FROM det_pedido dt
      LEFT JOIN productos p ON p.proId = dt.proIdFk
      LEFT JOIN detped_med dm ON dt.detPedId = dm.detPedIdFk
      LEFT JOIN medidas md ON dm.detPedMedIdFk = md.medId
      LEFT JOIN categoria ct ON p.ProCatFk = ct.catId
      LEFT JOIN produccion pd ON pd.detPedIdFk = dt.detPedId
      WHERE dt.pedIdFk = ?
      `,
      [pedId]
    )
    return rows;
  }
  async generarId() {
    // Llamada al procedimiento almacenado y recuperación del ID
    await this.connection.execute("CALL sp_generar_siguiente_id('DP','det_pedido','detPedId', @id)");
    const [rows] = await this.connection.execute('SELECT @id AS id');
    // console.log(rows);
    
    return rows[0].id;
  }

  async insertarDetalle(detalle) {
    const sql = `
      INSERT INTO det_pedido (detPedId, pedIdFk, proIdFk, pedObs, detPedCant)
      VALUES (?, ?, ?, ?, ?)
    `;
    await this.connection.execute(sql, [
      detalle.detalleId,
      detalle.pedidoId,
      detalle.productoId,
      detalle.observacion,
      detalle.cantidad
    ]);
  }

  async insertarMedidaDetalle(medida) {
    const sql = `
      INSERT INTO detped_med (detPedIdFk, detPedMedIdFk, detPedMedVal)
      VALUES (?, ?, ?)
    `;
    await this.connection.execute(sql, [
      medida.detalleId,
      medida.medidaId,
      medida.medidaValor
    ]);
  }
  async getDetalle(detalleId) {
    const sql = 'SELECT pedIdFk, proIdFk, detPedCant FROM det_pedido WHERE detPedId = ? LIMIT 1';
    const [rows] = await this.connection.execute(sql, [detalleId]);
    return rows[0] || null;
  }

  async getProduccionesByEstados(detalleId, estados) {
    const placeholders = estados.map(() => '?').join(',');
    const sql = `SELECT prodId FROM produccion WHERE detPedIdFk = ? AND estado IN (${placeholders})`;
    const [rows] = await this.connection.execute(sql, [detalleId, ...estados]);
    return rows;
  }

  async deleteMedidas(detalleId) {
    const sql = 'DELETE FROM detped_med WHERE detPedIdFk = ?';
    await this.connection.execute(sql, [detalleId]);
  }

  async deleteProduccionesPendientes(detalleId) {
    const sql = "DELETE FROM produccion WHERE detPedIdFk = ? AND estado = 'pendiente'";
    await this.connection.execute(sql, [detalleId]);
  }

  async deleteDetalle(detalleId) {
    const sql = 'DELETE FROM det_pedido WHERE detPedId = ?';
    await this.connection.execute(sql, [detalleId]);
  }

   async updateDetalle(detalleId, data) {
    const campos = [];
    const valores = [];
    if (data.cantidad !== undefined) {
      campos.push('detPedCant = ?');
      valores.push(data.cantidad);
    }
    if (data.observacion !== undefined) {
      campos.push('pedObs = ?');
      valores.push(data.observacion);
    }
    if (campos.length === 0) return;

    valores.push(detalleId);
    const sql = `UPDATE det_pedido SET ${campos.join(', ')} WHERE detPedId = ?`;
    await this.connection.execute(sql, valores);
  }

}