import express from 'express';
import { authValidator, isAdmin } from '../middleware/auth.middleware.js';
import validateFields from '../middleware/validator.middleware.js';
import {
  ctlGetAllCategorias,
  ctlGetCategoriaById,
  ctlCreateCategoria,
  ctlUpdateCategoria,
  ctlChangeCategoriaEstado
} from '../controllers/categorias.controller.js';
import {
  getAllCategoriasValidator,
  getCategoriaByIdValidator,
  createCategoriaValidator,
  updateCategoriaValidator,
  changeCategoriaEstadoValidator
} from '../validators/categorias.validator.js';

export const router = express.Router();

// [GET] /categorias - Listar todas las categorías
router.get('/',
  authValidator,
  [...getAllCategoriasValidator, validateFields],
  ctlGetAllCategorias
);

// [GET] /categorias/:id - Obtener categoría por ID
router.get('/:id',
  authValidator,
  [...getCategoriaByIdValidator, validateFields],
  ctlGetCategoriaById
);

// [POST] /categorias - Crear categoría
router.post('/',
  authValidator,
  isAdmin,
  [...createCategoriaValidator, validateFields],
  ctlCreateCategoria
);

// [PUT] /categorias/:id - Actualizar categoría
router.put('/:id',
  authValidator,
  isAdmin,
  [...updateCategoriaValidator, validateFields],
  ctlUpdateCategoria
);

// [PATCH] /categorias/:id/estado - Cambiar estado
router.patch('/:id/estado',
  authValidator,
  isAdmin,
  [...changeCategoriaEstadoValidator, validateFields],
  ctlChangeCategoriaEstado
);
