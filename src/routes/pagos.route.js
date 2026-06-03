import { Router } from 'express';

import { authValidator } from '../middleware/auth.middleware.js';
import { getPagosController, createPagoController, rechazarPagoController } from '../controllers/pagos.controller.js';
import { crearPagoValidator, rechazarPagoValidator } from '../validators/pagos.validator.js';
import validateFields from '../middleware/validator.middleware.js';

export const router = Router();

router.get('/', authValidator, getPagosController);

router.post(
  '/',
  authValidator,
  [...crearPagoValidator, validateFields],
  createPagoController
);

router.patch(
  '/:id/rechazar',
  authValidator,
  [...rechazarPagoValidator, validateFields],
  rechazarPagoController
);
