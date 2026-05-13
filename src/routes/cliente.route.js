import express from 'express'
import { authValidator } from '../middleware/auth.middleware.js';
import { changeStatus, createCliente, getClienteById, getClientes, updateCliente } from '../controllers/cliente.controller.js';
import validateFields from '../middleware/validator.middleware.js';
import { createClienteRules, estadoValidator, updateClienteRules } from '../validators/cliente.validator.js';
export const router = express.Router();

router.get('/', authValidator, getClientes);
router.post('/', authValidator,
  [
    ...createClienteRules,
    validateFields
  ], createCliente);
router.get('/:id', authValidator, getClienteById);
router.put('/:id', authValidator,
  [
    ...updateClienteRules,
    validateFields
  ], updateCliente)
router.patch('/:id/estado', authValidator, 
  [
    ...estadoValidator,
    validateFields
  ],changeStatus);