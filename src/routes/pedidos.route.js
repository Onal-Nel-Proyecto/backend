import { Router } from "express";
import { PedidoModel } from "../models/pedido.models.js";
import { cancelPedidoController, createNewPedidoController, entregarPedidoController, getAllEntregasController, getAllPedidosController, getPedidoByIdController, updatePedidoController } from "../controllers/pedidos.controller.js";
import { authValidator } from "../middleware/auth.middleware.js";
import { basePedidoValidator, cancelPedidoValidator, entregarPedidoValidator, parametroValidator, updateValidator } from "../validators/pedido.validator.js";
import validateFields from "../middleware/validator.middleware.js";
import { actualizarDetalleValidator, crearDetalleValidator } from "../validators/dt_pedido.validator.js";
import { actualizarDetalle, crearDetalle, eliminarDetalle } from "../controllers/dt_pedido.controller.js";
import { createNewProductionController, eliminarProduccion, updateProductionController } from "../controllers/produccion.controller.js";
import { produccionPATCHValidator, produccionPOSTValidator } from "../validators/produccion.validator.js";

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

// ruta para listar pedidos completados (TERMINADO + ENTREGADO) — debe ir ANTES de /:id
router.get('/entregas', authValidator,
  [
    ...parametroValidator,
    validateFields
  ],
  getAllEntregasController);

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

// ruta para entregar un pedido (TERMINADO → ENTREGADO)
router.patch('/:id/entregar', authValidator,
  [
    ...entregarPedidoValidator,
    validateFields
  ],
  entregarPedidoController
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
router.patch('/:id/detalles/:id_detalle', authValidator,
  [
    ...actualizarDetalleValidator,
    validateFields
  ],
  actualizarDetalle);

// ruta para produccion

// registrar produccion de un detalle
router.post('/:id/detalles/:id_detalle/produccion', authValidator,
  [
    ...produccionPOSTValidator,
    validateFields
  ], createNewProductionController)

router.patch('/:id/detalles/:id_detalle/produccion/:id_produccion', authValidator,
  [
    ...produccionPATCHValidator,
    validateFields
  ], updateProductionController)
router.delete('/:id/detalles/:id_detalle/produccion/:id_produccion', authValidator, eliminarProduccion)