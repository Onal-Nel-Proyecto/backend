import express from 'express';
import { ctlGetAllUsers, ctlGetUserById, ctlCreateUser, ctlUpdateUser, ctlChangeUserStatus, ctlUpdatePassword } from '../controllers/user.controller.js';
import { createUserValidator, updateUserValidator, changeStatusValidator, updatePasswordValidator } from '../validators/user.validator.js';
import validateFields from '../middleware/validator.middleware.js';
import { authValidator, isAdmin, isAdminOrSelf } from '../middleware/auth.middleware.js';
import { createLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

// GET /usuarios - Obtener todos los usuarios (solo admin)
router.get('/', authValidator, isAdmin, ctlGetAllUsers);

// GET /usuarios/:id - Obtener un usuario por ID (solo admin)
router.get('/:id', authValidator, isAdmin, ctlGetUserById);

// POST /usuarios - Crear un nuevo usuario (solo admin)
router.post('/',
  authValidator,
  isAdmin,
  createLimiter,
  [...createUserValidator, validateFields],
  ctlCreateUser
);

// PUT /usuarios/:id - Actualizar datos de un usuario (solo admin)
router.put('/:id',
  authValidator,
  isAdmin,
  createLimiter,
  [...updateUserValidator, validateFields],
  ctlUpdateUser
);

// PATCH /usuarios/:id/estado - Cambiar estado del usuario: 1=activo, 2=bloqueado (solo admin)
router.patch('/:id/estado',
  authValidator,
  isAdmin,
  [...changeStatusValidator, validateFields],
  ctlChangeUserStatus
);

// PATCH /usuarios/:id/password - Actualizar contraseña (admin o propio usuario)
router.patch('/:id/password',
  authValidator,
  isAdminOrSelf,
  createLimiter,
  [...updatePasswordValidator, validateFields],
  ctlUpdatePassword
);

export { router };
