import { AppError } from '../utils/appError.js';
import { subirFotoService, eliminarFotoService } from '../services/pedido_foto.service.js';

// POST /pedidos/:id/fotos - Subir una imagen a un pedido
export const subirFotoController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return next(new AppError('No se ha enviado ninguna imagen', 400));
    }

    const result = await subirFotoService(id, file);

    if (result.err) return next(new AppError(result.err, result.errorCode));

    res.status(201).json({ status: true, msg: result.msg, data: result.data });
  } catch (error) {
    console.error('Error en subirFotoController:', error);
    next(new AppError('Error interno del servidor', 500));
  }
};

// DELETE /pedidos/:id/fotos/:fotoId - Eliminar una imagen de un pedido
export const eliminarFotoController = async (req, res, next) => {
  try {
    const { id, fotoId } = req.params;

    const result = await eliminarFotoService(id, fotoId);

    if (result.err) return next(new AppError(result.err, result.errorCode));

    res.status(200).json({ status: true, msg: result.msg });
  } catch (error) {
    console.error('Error en eliminarFotoController:', error);
    next(new AppError('Error interno del servidor', 500));
  }
};
