import express from 'express';
import {
  ctlGetAll,
  ctlGetById,
  ctlCreate,
  ctlCancelar,
} from '../controllers/abastecimiento.controller.js';
import { authValidator, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET  /api/abastecimientos         — Listar paginado
router.get('/', authValidator, ctlGetAll);

// GET  /api/abastecimientos/:id     — Detalle con items
router.get('/:id', authValidator, ctlGetById);

// POST /api/abastecimientos         — Crear (el trigger actualiza stock automáticamente)
router.post('/', authValidator, isAdmin, ctlCreate);

// PATCH /api/abastecimientos/:id/cancelar — Cancelar
router.patch('/:id/cancelar', authValidator, isAdmin, ctlCancelar);

export { router };
