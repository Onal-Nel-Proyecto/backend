import express from 'express';
import { authValidator, isAdmin } from '../middleware/auth.middleware.js';
import validateFields from '../middleware/validator.middleware.js';
import {
  ctlGetAllMedidas,
  ctlGetMedidaById,
  ctlCreateMedida,
  ctlUpdateMedida,
  ctlChangeMedidaEstado
} from '../controllers/medidas.controller.js';
import {
  getAllMedidasValidator,
  getMedidaByIdValidator,
  createMedidaValidator,
  updateMedidaValidator,
  changeMedidaEstadoValidator
} from '../validators/medidas.validator.js';

export const router = express.Router();

// [GET] /medidas - Listar todas las medidas
router.get('/',
  authValidator,
  [...getAllMedidasValidator, validateFields],
  ctlGetAllMedidas
);

// [GET] /medidas/:id - Obtener medida por ID
router.get('/:id',
  authValidator,
  [...getMedidaByIdValidator, validateFields],
  ctlGetMedidaById
);

// [POST] /medidas - Crear medida
router.post('/',
  authValidator,
  isAdmin,
  [...createMedidaValidator, validateFields],
  ctlCreateMedida
);

// [PUT] /medidas/:id - Actualizar medida
router.put('/:id',
  authValidator,
  isAdmin,
  [...updateMedidaValidator, validateFields],
  ctlUpdateMedida
);

// [PATCH] /medidas/:id/estado - Cambiar estado
router.patch('/:id/estado',
  authValidator,
  isAdmin,
  [...changeMedidaEstadoValidator, validateFields],
  ctlChangeMedidaEstado
);
