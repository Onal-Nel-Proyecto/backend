import { Router } from 'express';
import { authValidator } from '../middleware/auth.middleware.js';
import { getResumenController, getPedidosDashboardController } from '../controllers/dashboard.controller.js';

export const router = Router();

router.get('/resumen', authValidator, getResumenController);
router.get('/pedidos', authValidator, getPedidosDashboardController);
