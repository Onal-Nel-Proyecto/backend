import db from '../config/db.js';

export class AlertasModel {
  /**
   * Crear una nueva alerta
   */
  static async create(data) {
    const {
      altTitulo,
      altMensaje,
      altTipo,
      altModulo,
      altReferenciaId,
      altCategoria,
      altInfoExtra
    } = data;

    const [result] = await db.query(
      `INSERT INTO alertas 
        (altTitulo, altMensaje, altTipo, altModulo, altReferenciaId, altCategoria, altEstado, altInfoExtra)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVO', ?)`,
      [
        altTitulo,
        altMensaje,
        altTipo,
        altModulo,
        altReferenciaId,
        altCategoria,
        JSON.stringify(altInfoExtra)
      ]
    );

    return result.insertId;
  }

  /**
   * Listar alertas con paginación y filtros opcionales
   */
  static async getAll(filtros = {}, limite = 15, offset = 0) {
    const whereClauses = [];
    const params = [];

    if (filtros.estado) {
      whereClauses.push('altEstado = ?');
      params.push(filtros.estado);
    }

    if (filtros.tipo) {
      whereClauses.push('altTipo = ?');
      params.push(filtros.tipo);
    }

    if (filtros.categoria) {
      whereClauses.push('altCategoria = ?');
      params.push(filtros.categoria);
    }

    const whereSQL = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(' AND ')}`
      : '';

    params.push(limite, offset);

    const [rows] = await db.query(
      `SELECT 
        altId,
        altTitulo,
        altMensaje,
        altTipo,
        altModulo,
        altReferenciaId,
        altCategoria,
        altEstado,
        altFecha,
        altInfoExtra
      FROM alertas
      ${whereSQL}
      ORDER BY altFecha DESC
      LIMIT ? OFFSET ?`,
      params
    );

    return rows;
  }

  /**
   * Contar alertas con filtros
   */
  static async countAll(filtros = {}) {
    const whereClauses = [];
    const params = [];

    if (filtros.estado) {
      whereClauses.push('altEstado = ?');
      params.push(filtros.estado);
    }

    if (filtros.tipo) {
      whereClauses.push('altTipo = ?');
      params.push(filtros.tipo);
    }

    if (filtros.categoria) {
      whereClauses.push('altCategoria = ?');
      params.push(filtros.categoria);
    }

    const whereSQL = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(' AND ')}`
      : '';

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM alertas ${whereSQL}`,
      params
    );

    return total;
  }

  /**
   * Buscar una alerta por altReferenciaId + altCategoria (para evitar duplicados)
   */
  static async findByReferenciaYCategoria(altReferenciaId, altCategoria) {
    const [[row]] = await db.query(
      'SELECT * FROM alertas WHERE altReferenciaId = ? AND altCategoria = ?',
      [altReferenciaId, altCategoria]
    );
    return row || null;
  }

  /**
   * Actualizar el estado de una alerta
   */
  static async updateEstado(altId, nuevoEstado) {
    const [result] = await db.query(
      'UPDATE alertas SET altEstado = ? WHERE altId = ?',
      [nuevoEstado, altId]
    );
    return result.affectedRows > 0;
  }
}
