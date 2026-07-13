import { MovimientosModel } from '../models/movimientos.models.js';
import { formatDateColombia } from '../utils/normalizacion_datos.js';
import { calculateTotalPages } from '../utils/paginacion.js';

/**
 * Crea un nuevo movimiento de inventario
 * @param {object} data - { tipoMov, tipoSuministro, referenciaID, cantidad, usuIdFk, stockAnterior, stockActual, motivo }
 * @returns {Promise<{ status: boolean, id_mov: number }>}
 */
export const createMovimientoService = async (data) => {
  const insertId = await MovimientosModel.create(data);
  return { status: true, id_mov: insertId };
};

/**
 * Obtiene todos los movimientos con paginación y filtros
 * @param {number} pag - Número de página
 * @param {object} filtros - { usuario, fecha_desde, fecha_hasta, tipo_suministro, tipo_mov }
 * @returns {Promise<{ maxPag: number, pagAct: number, data: Array }>}
 */
export const getAllMovimientosService = async (pag = 1, filtros = {}) => {
  const limite = 15;

  const [rows, total] = await Promise.all([
    MovimientosModel.getAll(pag, limite, filtros),
    MovimientosModel.countAll(filtros)
  ]);

  const data = rows.map(e => ({
    id_mov: e.idMov,
    tipo_mov: e.tipoMov,
    tipo_suministro: e.tipoSuministro || null,
    suministro: e.suministro_nombre ? {
      nombre: e.suministro_nombre,
      referencia_id: e.referenciaID || null,
    } : null,
    stock_anterior: e.stockAnterior ?? null,
    stock_actual: e.stockActual ?? null,
    motivo: e.motivo ?? null,
    cantidad: e.cantidad > 0 ? `+${e.cantidad}` : String(e.cantidad),
    fecha: e.fecha ? formatDateColombia(new Date(e.fecha), true) : null,
    usuario: e.usuIdFk ? {
      user_id: e.usuIdFk,
      user_nombres: e.usuNom,
      user_apellidos: e.usuApe,
    } : null,
  }));

  return {
    maxPag: calculateTotalPages(total, limite),
    pagAct: Number(pag),
    data
  };
};
