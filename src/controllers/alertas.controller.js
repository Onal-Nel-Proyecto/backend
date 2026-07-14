import { getAlertasService } from '../services/alertas.service.js';

export const getAlertasController = async (req, res, next) => {
  try {
    const {
      pagina = 1,
      limite = 15,
      estado,
      tipo,
      categoria
    } = req.query;

    const filtros = { estado, tipo, categoria };

    const result = await getAlertasService(pagina, limite, filtros);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en getAlertasController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};
