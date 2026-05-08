export class ProductoModel {
  constructor(connection) {
    this.connection = connection;
  }

  async existe(productoId) { // <- Sin 'static'
    const sql = 'SELECT 1 FROM productos WHERE proId = ? LIMIT 1';
    const [rows] = await this.connection.execute(sql, [productoId]);
    return rows.length > 0;
  }

  async crear(productoData) { // <- Sin 'static'
    const sql = 'INSERT INTO productos (proId, proNom, proStock,proPreUni, proDesc, proGen, ProCatFk, proTipPre, proTipPro, proUmbMin, proTall, proEst) VALUES (?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const [result] = await this.connection.execute(sql, [
      productoData.producto_id,
      productoData.nombre,
      productoData.stock ?? 0,
      productoData.precio,
      productoData.descripcion ?? null,
      productoData.genero ?? null,
      productoData.categoria_id ?? null,
      productoData.tipo_prenda ?? null,
      productoData.tipo_producto,
      productoData.umbral_minimo ?? null,
      productoData.talla ?? null,
      productoData.estado ?? 3
    ]);
    console.log(result)
    return  productoData.producto_id.toString();
  }
  async generarId() {
    // Llamada al procedimiento almacenado y recuperación del ID
    await this.connection.execute("CALL sp_generar_siguiente_id('PR','productos','proId', @id)");
    const [rows] = await this.connection.execute('SELECT @id AS id');
    // console.log(rows);

    return rows[0].id;
  }

  async getById(productoId) {
    const sql = 'SELECT proId, proNom, proPreUni, proEst FROM productos WHERE proId = ? LIMIT 1';
    const [rows] = await this.connection.execute(sql, [productoId]);
    return rows[0] || null;
  }

  async contarDetallesConProducto(productoId, detalleExcluido) {
    const sql = 'SELECT COUNT(*) AS total FROM det_pedido WHERE proIdFk = ? AND detPedId != ?';
    const [rows] = await this.connection.execute(sql, [productoId, detalleExcluido]);
    return rows[0].total;
  }

  async deleteProducto(productoId) {
    const sql = 'DELETE FROM productos WHERE proId = ?';
    await this.connection.execute(sql, [productoId]);
  }

  async update(productoId, data) {
    const campos = [];
    const valores = [];
    if (data.nombre !== undefined) {
      campos.push('proNom = ?');
      valores.push(data.nombre);
    }
    if (data.precio !== undefined) {
      campos.push('proPreUni = ?');
      valores.push(data.precio);
    }
    if (campos.length === 0) return;
    console.log(productoId)
    valores.push(productoId);
    const sql = `UPDATE productos SET ${campos.join(', ')} WHERE proId = ?`;
    await this.connection.execute(sql, valores);
  }
}