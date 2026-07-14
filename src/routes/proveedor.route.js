import express from 'express'
import { authValidator } from '../middleware/auth.middleware.js';
import {
  getProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor
} from '../controllers/proveedor.controller.js';
import validateFields from '../middleware/validator.middleware.js';
import {
  createProveedorRules,
  updateProveedorRules
} from '../validators/proveedor.validator.js';

export const router = express.Router();

router.get('/', authValidator, getProveedores);
router.post('/', authValidator, createProveedorRules, validateFields, createProveedor);
router.get('/:id', authValidator, getProveedorById);
router.put('/:id', authValidator, updateProveedorRules, validateFields, updateProveedor);
router.delete('/:id', authValidator, deleteProveedor);
