import db from "../config/db.js";

export class ProductoModel {

  // Obtener todos los productos con paginación y filtros
  static async getAllProductos({ pagina = 1, limite = 15, nombre, estado, categoria, tipoProducto }) {
    const offset = (pagina - 1) * limite;
    const filtros = [];
    const valores = [];

    // Aplicar filtros opcionales según los query params recibidos
    if (nombre) {
      filtros.push('p.proNom LIKE ?');
      valores.push(`%${nombre}%`);
    }
    if (estado) {
      filtros.push('p.proEst = ?');
      valores.push(estado);
    }
    if (categoria) {
      filtros.push('c.catNom LIKE ?');
      valores.push(`%${categoria}%`);
    }
    if (tipoProducto) {
      filtros.push('p.proTipPro = ?');
      valores.push(tipoProducto.toUpperCase());
    }

    const where = filtros.length > 0 ? `WHERE ${filtros.join(' AND ')}` : '';

    // Consulta principal con paginación
    const [rows] = await db.query(
      `SELECT
        p.proId AS id,
        p.proNom AS nombre,
        p.proStock AS stock,
        p.proPreUni AS precioUnitario,
        p.proDesc AS descripcion,
        p.proGen AS genero,
        p.proTipPre AS tipoPrenda,
        p.proTipPro AS tipoProducto,
        p.proUmbMin AS umbralMinimo,
        p.proTall AS talla,
        p.proEst AS estado,
        c.catNom AS categoria,
        p.proCatFk as categoria_id
      FROM productos p
      LEFT JOIN categoria c ON c.catId = p.ProCatFk
      ${where}
      LIMIT ? OFFSET ?`,
      [...valores, limite, offset]
    );

    // Consulta para obtener el total de registros (para calcular páginas)
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM productos p
       LEFT JOIN categoria c ON c.catId = p.ProCatFk
       ${where}`,
      valores
    );

    return { rows, total };
  }

  // Obtener un producto por su ID
  static async getProductoById({ id }) {
    const [rows] = await db.query(
      `SELECT
        p.proId AS id,
        p.proNom AS nombre,
        p.proStock AS stock,
        p.proPreUni AS precioUnitario,
        p.proDesc AS descripcion,
        p.proGen AS genero,
        p.proTipPre AS tipoPrenda,
        p.proTipPro AS tipoProducto,
        p.proUmbMin AS umbralMinimo,
        p.proTall AS talla,
        p.proEst AS estado,
        c.catNom AS categoria,
        p.proCatFk as categoria_id
      FROM productos p
      LEFT JOIN categoria c ON c.catId = p.ProCatFk
      WHERE p.proId = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0];
  }

  // Crear un nuevo producto
  static async createProducto({ nombre, precioUnitario, descripcion, genero, categoriaId, tipoPrenda, tipoProducto, umbralMinimo, talla, estado }) {
    await db.query("CALL sp_generar_siguiente_id('PR','productos','proId', @id)");
    const [[{ id }]] = await db.query('SELECT @id AS id');

    await db.query(
      `INSERT INTO productos (proId, proNom, proStock, proPreUni, proDesc, proGen, ProCatFk, proTipPre, proTipPro, proUmbMin, proTall, proEst)
       VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, nombre, precioUnitario, descripcion || null, genero || null, categoriaId || null, tipoPrenda || null, tipoProducto.toUpperCase(), umbralMinimo || null, talla || null, estado || 1]
    );

    return id;
  }

  // Actualizar datos de un producto
  static async updateProducto({ id, nombre, precioUnitario, descripcion, genero, categoriaId, tipoPrenda, umbralMinimo, talla }, connection = db) {
    const [result] = await connection.query(
      `UPDATE productos SET
        proNom = ?,
        proPreUni = ?,
        proDesc = ?,
        proGen = ?,
        ProCatFk = ?,
        proTipPre = ?,
        proUmbMin = ?,
        proTall = ?
      WHERE proId = ?`,
      [nombre, precioUnitario, descripcion || null, genero || null, categoriaId || null, tipoPrenda || null, umbralMinimo || null, talla || null, id]
    );
    return result;
  }

  // Cambiar estado
  static async changeEstado({ id, estado }) {
    const [result] = await db.query(
      'UPDATE productos SET proEst = ? WHERE proId = ?',
      [estado, id]
    );
    return result;
  }

  // VALIDACIONES

  // Verificar si una categoría existe
  static async categoriaExists({ categoriaId }) {
    const [rows] = await db.query('SELECT catId FROM categoria WHERE catId = ?', [categoriaId]);
    return rows.length > 0;
  }

  //  async generarId() {
  //   // Llamada al procedimiento almacenado y recuperación del ID
  //   await this.connection.execute("CALL sp_generar_siguiente_id('PR','productos','proId', @id)");
  //   const [rows] = await this.connection.execute('SELECT @id AS id');
  //   // console.log(rows);

  //   return rows[0].id;
  // }

  async contarDetallesConProducto(productoId, detalleExcluido) {
    const sql = 'SELECT COUNT(*) AS total FROM det_pedido WHERE proIdFk = ? AND detPedId != ?';
    const [rows] = await this.connection.execute(sql, [productoId, detalleExcluido]);
    return rows[0].total;
  }
}
