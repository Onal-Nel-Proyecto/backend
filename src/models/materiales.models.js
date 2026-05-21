import db from "../config/db.js";

export class MaterialesModel {

  // Obtener todos los materiales
  static async getAllMateriales() {
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
      FROM materiales`
    );
    return rows;
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
  static async createMaterial({ nombre, descripcion, umbralMinimo, cantidadInicial, unidadMedida, tipoMaterial }) {
    const [result] = await db.query(
      `INSERT INTO materiales (matNom, matEst, matDesc, matUmbMin, matCantDisp, matUniMed, matTipMat)
       VALUES (?, 'DISPONIBLE', ?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, umbralMinimo, cantidadInicial, unidadMedida || null, tipoMaterial]
    );
    return result.insertId; // retorna el ID autoincremental generado
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
      [nombre, descripcion || null, umbralMinimo, unidadMedida || null, tipoMaterial, id]
    );
    return result;
  }

  // Cambiar estado del material: DISPONIBLE, AGOTADO, ELIMINADO
  static async changeEstado({ id, estado }) {
    const [result] = await db.query(
      'UPDATE materiales SET matEst = ? WHERE matId = ?',
      [estado, id]
    );
    return result;
  }

  // Registrar abastecimiento inicial al crear un material
  static async registrarAbastecimiento({ proveedorId, usuarioId, materialId, cantidad, costo }) {
    // Crear encabezado del abastecimiento
    const [encabezado] = await db.query(
      'INSERT INTO abastecimiento (provIdFk, usuIdFk) VALUES (?, ?)',
      [proveedorId, usuarioId]
    );
    const abastecimientoId = encabezado.insertId;

    // Crear detalle del abastecimiento
    await db.query(
      `INSERT INTO detalle_abastecimiento (detAbsId, absIdFk, detAbsTip, detAbsRefId, detAbsCant, detAbsCos)
       VALUES (?, ?, 'MATERIAL', ?, ?, ?)`,
      [abastecimientoId, abastecimientoId, String(materialId), cantidad, costo || null]
    );
  }

  // ==================== VALIDACIONES ====================

  // Verificar si un proveedor existe
  static async proveedorExists({ proveedorId }) {
    const [rows] = await db.query('SELECT provId FROM proveedor WHERE provId = ?', [proveedorId]);
    return rows.length > 0;
  }
}
