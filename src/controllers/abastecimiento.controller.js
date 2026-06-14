import { AppError } from '../utils/appError.js';
import {
  getAllAbastecimientosService,
  getAbastecimientoByIdService,
  createAbastecimientoService,
  cancelarAbastecimientoService,
} from '../services/abastecimiento.service.js';

// ── GET /api/abastecimientos — Listar paginado ──
const ctlGetAll = async (req, res, next) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 15;

    const result = await getAllAbastecimientosService({ pagina, limite });
    if (result.err) return next(new AppError(result.err, result.errorCode));

    res.status(200).json({
      status: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(new AppError('Error interno del servidor', 500));
  }
};

// ── GET /api/abastecimientos/:id — Obtener con detalles ──
const ctlGetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getAbastecimientoByIdService({ id });
    if (result.err) return next(new AppError(result.err, result.errorCode));

    res.status(200).json({ status: true, data: result.data });
  } catch (error) {
    next(new AppError('Error interno del servidor', 500));
  }
};

// ── POST /api/abastecimientos — Crear (dispara trigger) ──
const ctlCreate = async (req, res, next) => {
  try {
    const { provIdFk, detalles } = req.body;
    const usuIdFk = req.user?.id || null;

    const result = await createAbastecimientoService({ provIdFk, detalles, usuIdFk });
    if (result.err) return next(new AppError(result.err, result.errorCode));

    res.status(201).json({
      status: true,
      msg: result.msg,
      id: result.id,
    });
  } catch (error) {
    next(new AppError('Error interno del servidor', 500));
  }
};

// ── PATCH /api/abastecimientos/:id/cancelar — Cancelar ──
const ctlCancelar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await cancelarAbastecimientoService({ id });
    if (result.err) return next(new AppError(result.err, result.errorCode));

    res.status(200).json({ status: true, msg: result.msg });
  } catch (error) {
    next(new AppError('Error interno del servidor', 500));
  }
};

export { ctlGetAll, ctlGetById, ctlCreate, ctlCancelar };
