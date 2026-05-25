import {
  getFacturaService,
  createFacturaService,
  anularFacturaService,
  generarPdfFacturaService,
} from '../services/factura.service.js';
import { AppError } from '../utils/appError.js';

export const getFacturaController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await getFacturaService(id);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en getFacturaController:', error);
    next(error instanceof AppError ? error : new AppError('Error interno del servidor', 500));
  }
};

export const createFacturaController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await createFacturaService(id);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error en createFacturaController:', error);
    next(error instanceof AppError ? error : new AppError('Error interno del servidor', 500));
  }
};

export const anularFacturaController = async (req, res, next) => {
  try {
    const { id_factura } = req.params;

    const result = await anularFacturaService(id_factura);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en anularFacturaController:', error);
    next(error instanceof AppError ? error : new AppError('Error interno del servidor', 500));
  }
};

export const pdfFacturaController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { pdfBuffer, filename } = await generarPdfFacturaService(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error en pdfFacturaController:', error);
    next(error instanceof AppError ? error : new AppError('Error interno del servidor', 500));
  }
};
