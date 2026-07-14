import { AppError } from '../utils/appError.js';
import { createNewProduction, deleteProduction, updateProduction } from "../services/produccion.service.js";

export const createNewProductionController = async (req, res, next) => {
  try {
    const { id, id_detalle } = req.params;
    await createNewProduction(id, id_detalle, req.body);

    return res.status(201).json({
      status: true,
      msg: "El detalle del pedido fue agregado a producción."
    });
  } catch (error) {
    console.error('Error en createNewProductionController:', error);
    if (error.code === 'ER_SIGNAL_EXCEPTION') {

      return next(
        new AppError(error.sqlMessage, 400)
      );

    }
    next(new AppError('Error interno del servidor', error.statusCode || 500));
  }
};

export const updateProductionController = async (req, res, next) => {
  try {
    const { id, id_detalle, id_produccion } = req.params;
    const { user_id } = req.user;
    await updateProduction(id_produccion, id_detalle, id, user_id, req.body);

    return res.status(201).json({
      status: true,
      msg: "Estado de producción actualizado correctamente."
    });
  } catch (error) {
    console.error('Error en updateProductionController:', error);
    if (error.code === 'ER_SIGNAL_EXCEPTION') {

      return next(
        new AppError(error.sqlMessage, 400)
      );

    }
    next(new AppError('Error interno del servidor', error.statusCode || 500));
  }
};

export const eliminarProduccion = async (req, res, next) => {
  try {
    const { id, id_detalle, id_produccion } = req.params;
    await deleteProduction(id, id_detalle, id_produccion);

    return res.status(200).json({
      status: true,
      msg: "Producción cancelada correctamente."
    });
  } catch (error) {
    console.error('Error en eliminarProduccion:', error);
    if (error.code === 'ER_SIGNAL_EXCEPTION') {

      return next(
        new AppError(error.sqlMessage, 400)
      );

    }
    next(new AppError('Error interno del servidor', error.statusCode || 500));
  }
};