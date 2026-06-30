import { AppError } from '../utils/appError.js';
import { getAllMovimientosService } from '../services/movimientos.service.js';

export const ctlGetAllMovimientos = async (req, res, next) => {
  try {
    const {
      pag = 1,
      usuario,
      fecha_desde,
      fecha_hasta,
      tipo_suministro,
      tipo_mov,
      nombre
    } = req.query;

    const filtros = { usuario, fecha_desde, fecha_hasta, tipo_suministro, tipo_mov, nombre };

    const result = await getAllMovimientosService(pag, filtros);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    next(new AppError('Error interno del servidor', 500));
  }
};
