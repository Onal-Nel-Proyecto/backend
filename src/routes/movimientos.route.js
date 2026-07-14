import { Router } from 'express';
import { authValidator } from '../middleware/auth.middleware.js';
import validateFields from '../middleware/validator.middleware.js';
import { ctlGetAllMovimientos } from '../controllers/movimientos.controller.js';
import { getAllMovimientosValidator } from '../validators/movimientos.validator.js';

export const router = Router();

// [GET] /movimientos - Listar movimientos con paginación y filtros
router.get('/',
  authValidator,
  [
    ...getAllMovimientosValidator,
    validateFields
  ],
  ctlGetAllMovimientos
);
