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

import {
  getVentasController,
  getVentaByIdController,
  createVentaController,
  updateVentaController,
  anularVentaController
} from '../controllers/ventas.controller.js';

import {
  createDetalleController,
  deleteDetalleController
} from '../controllers/dt_venta.controller.js';

import {
  getVentasValidator,
  getVentaByIdValidator,
  createVentaValidator,
  updateVentaValidator,
  anularVentaValidator,
  createDetalleValidator,
  deleteDetalleValidator
} from '../validators/ventas.validator.js';

export const router = Router();

// ============================================================
// RUTAS DE VENTAS
// ============================================================

// [GET] /ventas - Listar ventas con paginación y filtros
router.get(
  '/',
  authValidator,
  [...getVentasValidator, validateFields],
  getVentasController
);

// [POST] /ventas - Registrar nueva venta
router.post(
  '/',
  authValidator,
  [...createVentaValidator, validateFields],
  createVentaController
);

// [GET] /ventas/:id - Obtener venta por ID
router.get(
  '/:id',
  authValidator,
  [...getVentaByIdValidator, validateFields],
  getVentaByIdController
);

// [PATCH] /ventas/:id - Actualizar venta (descuento, fecha_limite_pago)
router.patch(
  '/:id',
  authValidator,
  [...updateVentaValidator, validateFields],
  updateVentaController
);

// [DELETE] /ventas/:id - Anular venta
router.delete(
  '/:id',
  authValidator,
  [...anularVentaValidator, validateFields],
  anularVentaController
);

// [POST] /ventas/:id/detalles - Agregar detalle a venta
router.post(
  '/:id/detalles',
  authValidator,
  [...createDetalleValidator, validateFields],
  createDetalleController
);

// [DELETE] /ventas/:id/detalles/:id_detalle - Eliminar detalle de venta
router.delete(
  '/:id/detalles/:id_detalle',
  authValidator,
  [...deleteDetalleValidator, validateFields],
  deleteDetalleController
);

// ============================================================
// RUTAS DE FACTURA (se mantienen)
// ============================================================

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
