import { Router } from 'express';

import { authValidator } from '../middleware/auth.middleware.js';
import validateFields from '../middleware/validator.middleware.js';

import {
  getFacturaController,
  createFacturaController,
  anularFacturaController,
  pdfFacturaController,
} from '../controllers/factura.controller.js';

import {
  getFacturaValidator,
  createFacturaValidator,
  anularFacturaValidator,
  pdfFacturaValidator,
} from '../validators/factura.validator.js';

export const router = Router();

// [GET] /ventas/:id/factura - Obtener datos de la factura
router.get(
  '/:id/factura',
  authValidator,
  [...getFacturaValidator, validateFields],
  getFacturaController
);

// [POST] /ventas/:id/factura - Crear factura
router.post(
  '/:id/factura',
  authValidator,
  // [...createFacturaValidator, validateFields],
  createFacturaController
);

// [PATCH] /ventas/:id/factura/:id_factura/anular - Anular factura
router.patch(
  '/:id/factura/:id_factura/anular',
  authValidator,
  [...anularFacturaValidator, validateFields],
  anularFacturaController
);

// [GET] /ventas/:id/factura/pdf - Generar y descargar PDF de factura
router.get(
  '/:id/factura/pdf',
  authValidator,
  [...pdfFacturaValidator, validateFields],
  pdfFacturaController
);
