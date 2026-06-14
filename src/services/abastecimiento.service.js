import db from "../config/db.js";
import { calculateTotalPages } from '../utils/paginacion.js';

// ══════════════════════════════════════════════════════════════
// NOTA: El trigger `trg_entrada_abastecimiento` (AFTER INSERT
// ON detalle_abastecimiento) maneja AUTOMÁTICAMENTE:
//   - Aumento de proStock en productos
//   - Aumento de matCantDisp en materiales
//   - Reactivación de materiales AGOTADO → DISPONIBLE
//   - Registro en movimientos
//   - Registro en actividad_sistema
// ══════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
// getAllAbastecimientosService — Lista paginada
// ────────────────────────────────────────────────────────────
export const getAllAbastecimientosService = async ({ pagina, limite }) => {
  try {
    const offset = (pagina - 1) * limite;

    const [countRows] = await db.query('SELECT COUNT(*) AS total FROM abastecimiento');
    const total = countRows[0].total;

    const sql = `
      SELECT 
        a.id,
        a.abaFec AS fecha,
        a.abaObs AS observacion,
        a.provIdFk,
        pv.provNom AS proveedor_nombre,
        a.usuIdFk,
        (SELECT COUNT(*) FROM detalle_abastecimiento d WHERE d.absIdFk = a.id) AS total_items,
        (SELECT COALESCE(SUM(d.detAbsCant * d.detAbsCos), 0) 
         FROM detalle_abastecimiento d WHERE d.absIdFk = a.id) AS costo_total
      FROM abastecimiento a
      LEFT JOIN proveedor pv ON pv.provId = a.provIdFk
      ORDER BY a.abaFec DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [limite, offset]);

    return {
      data: rows,
      meta: {
        pagina_actual: pagina,
        paginas_totales: calculateTotalPages(total, limite),
        total,
        limite,
      },
    };
  } catch (error) {
    return { err: 'Error al listar abastecimientos', errorCode: 500 };
  }
};

// ────────────────────────────────────────────────────────────
// getAbastecimientoByIdService — Detalle + items con nombre
// ────────────────────────────────────────────────────────────
export const getAbastecimientoByIdService = async ({ id }) => {
  try {
    const [absRows] = await db.query(
      `SELECT a.*, pv.provNom AS proveedor_nombre
       FROM abastecimiento a
       LEFT JOIN proveedor pv ON pv.provId = a.provIdFk
       WHERE a.id = ?`,
      [id]
    );
    if (absRows.length === 0) {
      return { err: 'Abastecimiento no encontrado', errorCode: 404 };
    }

    // Detalles con nombre resuelto según el tipo de suministro
    const sqlDet = `
      SELECT 
        dt.detAbsId AS id,
        dt.detAbsTip AS tipo_suministro,
        dt.detAbsCant AS cantidad,
        dt.detAbsCos AS costo_unitario,
        dt.detAbsRefId AS id_referencia,
        CASE
          WHEN dt.detAbsTip = 'PRODUCTO' THEN p.proNom
          WHEN dt.detAbsTip = 'MATERIAL' THEN m.matNom
          ELSE NULL
        END AS nombre_suministro
      FROM detalle_abastecimiento dt
      LEFT JOIN productos p  ON dt.detAbsTip = 'PRODUCTO' AND p.proId  = dt.detAbsRefId
      LEFT JOIN materiales m ON dt.detAbsTip = 'MATERIAL' AND m.matId = dt.detAbsRefId
      WHERE dt.absIdFk = ?
    `;
    const [detalles] = await db.query(sqlDet, [id]);

    return { data: { ...absRows[0], detalles } };
  } catch (error) {
    return { err: 'Error al obtener abastecimiento', errorCode: 500 };
  }
};

// ────────────────────────────────────────────────────────────
// createAbastecimientoService — Crear con transacción
// ────────────────────────────────────────────────────────────
// El trigger trg_entrada_abastecimiento (AFTER INSERT) se
// dispara por cada detalle insertado y actualiza stock,
// movimientos y actividad automáticamente.
export const createAbastecimientoService = async ({ provIdFk, detalles, usuIdFk }) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Validar proveedor
    const [prov] = await connection.query(
      'SELECT provId FROM proveedor WHERE provId = ?',
      [provIdFk]
    );
    if (prov.length === 0) {
      await connection.rollback();
      return { err: 'El proveedor no existe', errorCode: 400 };
    }

    if (!detalles || detalles.length === 0) {
      await connection.rollback();
      return { err: 'Debe incluir al menos un detalle', errorCode: 400 };
    }

    // Insertar encabezado
    const [result] = await connection.query(
      `INSERT INTO abastecimiento (abaFec, provIdFk, usuIdFk)
       VALUES (NOW(), ?, ?)`,
      [provIdFk, usuIdFk || null]
    );
    const absId = result.insertId;

    // Insertar cada detalle — el trigger se dispara en cada INSERT
    for (const det of detalles) {
      await connection.query(
        `INSERT INTO detalle_abastecimiento (absIdFk, detAbsTip, detAbsCant, detAbsCos, detAbsRefId)
         VALUES (?, ?, ?, ?, ?)`,
        [absId, det.detAbsTip, det.detAbsCant, det.detAbsCos || 0, det.detAbsRefId]
      );
    }

    await connection.commit();

    return { msg: 'Abastecimiento creado correctamente', id: absId };
  } catch (error) {
    await connection.rollback();
    return { err: 'Error al crear abastecimiento', errorCode: 500 };
  } finally {
    connection.release();
  }
};

// ────────────────────────────────────────────────────────────
// cancelarAbastecimientoService — Marcar como cancelado
// ────────────────────────────────────────────────────────────
export const cancelarAbastecimientoService = async ({ id }) => {
  try {
    const [abs] = await db.query('SELECT id FROM abastecimiento WHERE id = ?', [id]);
    if (abs.length === 0) {
      return { err: 'Abastecimiento no encontrado', errorCode: 404 };
    }

    // Si la tabla tiene columna de estado, actualizarla
    // (ej: abaEst, absEstado)
    await db.query(
      "UPDATE abastecimiento SET abaEst = 'CANCELADO' WHERE id = ?",
      [id]
    );

    return { msg: 'Abastecimiento cancelado' };
  } catch (error) {
    return { err: 'Error al cancelar abastecimiento', errorCode: 500 };
  }
};
