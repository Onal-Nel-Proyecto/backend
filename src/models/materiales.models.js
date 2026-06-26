import db from "../config/db.js";

export class MaterialesModel {

  // Obtener todos los materiales con paginación y filtros
  static async getAllMateriales({ pagina = 1, limite = 15, nombre, estado, tipoMaterial }) {
    const offset = (pagina - 1) * limite;
    const filtros = [];
    const valores = [];

    // Aplicar filtros opcionales según los query params recibidos
    if (nombre) {
      filtros.push('matNom LIKE ?');
      valores.push(`%${nombre}%`);
    }
    if (estado) {
      filtros.push('matEst = ?');
      valores.push(estado.toUpperCase());
    }
    if (tipoMaterial) {
      filtros.push('matTipMat = ?');
      valores.push(tipoMaterial.toUpperCase());
    }

    const where = filtros.length > 0 ? `WHERE ${filtros.join(' AND ')}` : '';

    // Consulta principal con paginación
    const [rows] = await db.query(
      `SELECT
        matId AS id,
        matNom AS nombre,
        matEst AS estado,
        matDesc AS descripcion,
        matUmbMin AS umbralMinimo,
        matCantDisp AS cantidadDisponible,
        matUniMed AS unidadMedida,
        matTipMat AS tipoMaterial
      FROM materiales
      ${where}
      LIMIT ? OFFSET ?`,
      [...valores, limite, offset]
    );

    // Total para calcular páginas
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM materiales ${where}`,
      valores
    );

    return { rows, total };
  }

  // Obtener un material por su ID
  static async getMaterialById({ id }) {
    const [rows] = await db.query(
      `SELECT
        matId AS id,
        matNom AS nombre,
        matEst AS estado,
        matDesc AS descripcion,
        matUmbMin AS umbralMinimo,
        matCantDisp AS cantidadDisponible,
        matUniMed AS unidadMedida,
        matTipMat AS tipoMaterial
      FROM materiales
      WHERE matId = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0];
  }

  // Crear un nuevo material
  static async createMaterial({ nombre, descripcion, umbralMinimo, unidadMedida, tipoMaterial, cantidadDisponible }) {
    const [result] = await db.query(
      `INSERT INTO materiales (matNom, matEst, matDesc, matUmbMin, matCantDisp, matUniMed, matTipMat)
       VALUES (?, 'DISPONIBLE', ?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, umbralMinimo, cantidadDisponible ?? 0, unidadMedida || null, tipoMaterial.toUpperCase()]
    );
    return result.insertId;
  }

  // Actualizar datos de un material
  static async updateMaterial({ id, nombre, descripcion, umbralMinimo, unidadMedida, tipoMaterial, stock }) {
    const campos = ['matNom = ?', 'matDesc = ?', 'matUmbMin = ?', 'matUniMed = ?', 'matTipMat = ?'];
    const valores = [nombre, descripcion || null, umbralMinimo, unidadMedida || null, tipoMaterial.toUpperCase()];

    if (stock !== undefined) {
      campos.push('matCantDisp = ?');
      valores.push(stock);
    }

    valores.push(id);

    const [result] = await db.query(
      `UPDATE materiales SET ${campos.join(', ')} WHERE matId = ?`,
      valores
    );
    return result;
  }

  // Obtener resumen de materiales
  // total_stock.total y alertas_stock son dinámicos (respetan filtros)
  // total_stock.materiales_registrados es estático (total absoluto sin importar filtros)
  static async getMaterialesResumen({ nombre, estado, tipoMaterial }) {
    const filtros = [];
    const valores = [];

    if (nombre) {
      filtros.push('matNom LIKE ?');
      valores.push(`%${nombre}%`);
    }
    if (estado) {
      filtros.push('matEst = ?');
      valores.push(estado.toUpperCase());
    }
    if (tipoMaterial) {
      filtros.push('matTipMat = ?');
      valores.push(tipoMaterial.toUpperCase());
    }

    const whereBase = filtros.length > 0 ? `WHERE ${filtros.join(' AND ')}` : '';
    const whereAlertas = filtros.length > 0
      ? `WHERE ${filtros.join(' AND ')} AND (matCantDisp < matUmbMin OR matCantDisp = 0)`
      : 'WHERE (matCantDisp < matUmbMin OR matCantDisp = 0)';

    const from = 'FROM materiales';

    // total_stock.total: suma de cantidad disponible (dinámico con filtros)
    const [[{ total }]] = await db.query(
      `SELECT COALESCE(SUM(matCantDisp), 0) AS total ${from} ${whereBase}`,
      valores
    );

    // total_stock.materiales_registrados: total absoluto sin filtros (estático)
    const [[{ totalMateriales }]] = await db.query(
      `SELECT COUNT(*) AS totalMateriales FROM materiales`
    );

    // alertas_stock: cantidad bajo umbral mínimo o agotados (dinámico con filtros)
    const [[{ alertas_stock }]] = await db.query(
      `SELECT COUNT(*) AS alertas_stock ${from} ${whereAlertas}`,
      valores
    );

    return {
      total_stock: { total, materiales_registrados: totalMateriales },
      alertas_stock
    };
  }

  // Cambiar estado del material
  static async changeEstado({ id, estado }) {
    const [result] = await db.query(
      'UPDATE materiales SET matEst = ? WHERE matId = ?',
      [estado.toUpperCase(), id]
    );
    return result;
  }
}
