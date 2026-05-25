import { normalizeEmptyStrings } from '../utils/normalizacion_datos.js';
import {
  getVentasService,
  getVentaByIdService,
  createVentaService,
  updateVentaService,
  anularVentaService
} from '../services/ventas.service.js';

export const getVentasController = async (req, res, next) => {
  try {
    const {
      pagina = 1,
      limite = 15,
      fecha_registro,
      fecha_limite_pago,
      cliente
    } = req.query;

    const filtros = {
      fecha_registro,
      fecha_limite_pago,
      cliente
    };

    const result = await getVentasService(pagina, limite, filtros);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en getVentasController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};

export const getVentaByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await getVentaByIdService(id);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en getVentaByIdController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};

export const createVentaController = async (req, res, next) => {
  try {
    req.body = normalizeEmptyStrings(req.body);

    const userId = req.user.user_id;

    const result = await createVentaService(req.body, userId);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error en createVentaController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};

export const updateVentaController = async (req, res, next) => {
  try {
    req.body = normalizeEmptyStrings(req.body);

    const { id } = req.params;

    const result = await updateVentaService(id, req.body);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en updateVentaController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};

export const anularVentaController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await anularVentaService(id);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en anularVentaController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};


