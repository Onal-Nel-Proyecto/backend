import { Router } from 'express';
import { authValidator } from '../middleware/auth.middleware.js';
import { getResumenController } from '../controllers/dashboard.controller.js';

export const router = Router();

router.get('/resumen', authValidator, getResumenController);
