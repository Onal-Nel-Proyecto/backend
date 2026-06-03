import { Router } from 'express';
import { authValidator } from '../middleware/auth.middleware.js';
import { getAlertasController } from '../controllers/alertas.controller.js';

export const router = Router();

// [GET] /alertas - Listar alertas con paginación y filtros
// Query params: pagina, limite, estado, tipo, categoria
router.get(
  '/',
  authValidator,
  getAlertasController
);
