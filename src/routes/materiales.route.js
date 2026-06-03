import express from 'express';
import { ctlGetAllMateriales, ctlGetMaterialById, ctlCreateMaterial, ctlUpdateMaterial, ctlChangeMaterialEstado } from '../controllers/materiales.controller.js';
import { getAllMaterialesValidator, getMaterialByIdValidator, createMaterialValidator, updateMaterialValidator, changeMaterialEstadoValidator } from '../validators/materiales.validator.js';
import validateFields from '../middleware/validator.middleware.js';
import { authValidator, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Listar todos los materiales
router.get('/',
  authValidator,
  [...getAllMaterialesValidator, validateFields],
  ctlGetAllMateriales
);

// Obtener un material por ID
router.get('/:id',
  authValidator,
  [...getMaterialByIdValidator, validateFields],
  ctlGetMaterialById
);

// Crear material
router.post('/',
  authValidator,
  isAdmin,
  [...createMaterialValidator, validateFields],
  ctlCreateMaterial
);

// Actualizar material 
router.put('/:id',
  authValidator,
  isAdmin,
  [...updateMaterialValidator, validateFields],
  ctlUpdateMaterial
);

// Cambiar estado 
router.patch('/:id/estado',
  authValidator,
  isAdmin,
  [...changeMaterialEstadoValidator, validateFields],
  ctlChangeMaterialEstado
);

export { router };
