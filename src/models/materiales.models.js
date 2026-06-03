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
  static async createMaterial({ nombre, descripcion, umbralMinimo, unidadMedida, tipoMaterial }) {
    const [result] = await db.query(
      `INSERT INTO materiales (matNom, matEst, matDesc, matUmbMin, matCantDisp, matUniMed, matTipMat)
       VALUES (?, 'DISPONIBLE', ?, ?, 0, ?, ?)`,
      [nombre, descripcion || null, umbralMinimo, unidadMedida || null, tipoMaterial.toUpperCase()]
    );
    return result.insertId;
  }

  // Actualizar datos de un material
  static async updateMaterial({ id, nombre, descripcion, umbralMinimo, unidadMedida, tipoMaterial }) {
    const [result] = await db.query(
      `UPDATE materiales SET
        matNom = ?,
        matDesc = ?,
        matUmbMin = ?,
        matUniMed = ?,
        matTipMat = ?
      WHERE matId = ?`,
      [nombre, descripcion || null, umbralMinimo, unidadMedida || null, tipoMaterial.toUpperCase(), id]
    );
    return result;
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
