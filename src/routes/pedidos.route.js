import { Router } from "express";
import { PedidoModel } from "../models/pedido.models.js";
import { cancelPedidoController, createNewPedidoController, getAllPedidosController, getPedidoByIdController, updatePedidoController } from "../controllers/pedidos.controller.js";
import { authValidator } from "../middleware/auth.middleware.js";
import { basePedidoValidator, cancelPedidoValidator, parametroValidator, updateValidator } from "../validators/pedido.validator.js";
import validateFields from "../middleware/validator.middleware.js";
import { actualizarDetalleValidator, crearDetalleValidator } from "../validators/dt_pedido.validator.js";
import { actualizarDetalle, crearDetalle, eliminarDetalle } from "../controllers/dt_pedido.controller.js";

export const router = Router()

// rutas /pedidos
// ruta para obtener todos los pedidos con paginacion
router.get('/', authValidator,
  [
    ...parametroValidator,
    validateFields
  ],
  getAllPedidosController);

// ruta para crear un nuevo pedido
router.post('/', authValidator,
  [
    ...basePedidoValidator,
    validateFields
  ],
  createNewPedidoController);

// ruta para obtener un pedido por id (pendiente de implementar)
router.get('/:id', authValidator, getPedidoByIdController);

// ruta para actualizar un pedido
router.put('/:id', authValidator, 
  [
    ...updateValidator,
    validateFields
  ], updatePedidoController)

router.patch('/:id/cancelar', authValidator,
  [
    ...cancelPedidoValidator,
    validateFields
  ],
  cancelPedidoController
)

// ruta para detalles de pedido
router.post('/:id/detalles', authValidator,
   [
    ...crearDetalleValidator,
    validateFields
  ],
  crearDetalle
)

// ruta para eliminar detalle
router.delete('/:id/detalles/:id_detalle', authValidator, eliminarDetalle)

// PATCH para actualizar detalle
router.patch('/:id/detalles/:id_detalle', 
   [
    ...actualizarDetalleValidator,
    validateFields
  ],
   actualizarDetalle);