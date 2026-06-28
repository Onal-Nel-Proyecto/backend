import { Router } from "express";
import { PedidoModel } from "../models/pedido.models.js";
import { cancelPedidoController, createNewPedidoController, devolverPedidoController, entregarPedidoController, getAllEntregasController, getAllPedidosController, getHistorialPedidoController, getPedidoByIdController, updatePedidoController } from "../controllers/pedidos.controller.js";
import { authValidator, isAdmin } from "../middleware/auth.middleware.js";
import { basePedidoValidator, cancelPedidoValidator, devolverPedidoValidator, entregarPedidoValidator, parametroValidator, updateValidator } from "../validators/pedido.validator.js";
import validateFields from "../middleware/validator.middleware.js";
import { actualizarDetalleValidator, crearDetalleValidator } from "../validators/dt_pedido.validator.js";
import { actualizarDetalle, crearDetalle, eliminarDetalle } from "../controllers/dt_pedido.controller.js";
import { createNewProductionController, eliminarProduccion, updateProductionController } from "../controllers/produccion.controller.js";
import { produccionPATCHValidator, produccionPOSTValidator } from "../validators/produccion.validator.js";
import { subirFotoController, eliminarFotoController } from "../controllers/pedido_foto.controller.js";
import { subirFotoValidator, eliminarFotoValidator } from "../validators/pedido_foto.validator.js";
import { upload } from "../config/upload.js";

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

// ruta para obtener el historial de cambios de estado de un pedido (solo administradores)
router.get('/:id/historial', authValidator, isAdmin, getHistorialPedidoController);

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

// ruta para devolver un pedido (ENTREGADO → TERMINADO + anulación/corrección)
router.patch('/:id/devolver', authValidator,
  [
    ...devolverPedidoValidator,
    validateFields
  ],
  devolverPedidoController
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

// ─────────────────────────────────────────────
//  Rutas para fotos de pedidos
// ─────────────────────────────────────────────

// POST /pedidos/:id/fotos - Subir imagen a un pedido (máx. 15)
router.post('/:id/fotos',
  authValidator,
  (req, res, next) => {
    upload.single('foto')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ msg: 'La imagen no puede superar los 5MB' });
        }
        if (err.message) {
          return res.status(400).json({ msg: err.message });
        }
        return res.status(400).json({ msg: 'Error al subir la imagen' });
      }
      next();
    });
  },
  [...subirFotoValidator, validateFields],
  subirFotoController
);

// DELETE /pedidos/:id/fotos/:fotoId - Eliminar imagen de un pedido
router.delete('/:id/fotos/:fotoId',
  authValidator,
  [...eliminarFotoValidator, validateFields],
  eliminarFotoController
);