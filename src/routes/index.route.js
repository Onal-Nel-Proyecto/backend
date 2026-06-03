import { Router } from 'express'
import { router as loginRute } from './log.route.js'
import { router as pedidoRute } from './pedidos.route.js'
import { router as dashboardRoute } from './dashboard.route.js'
import { router as clienteRoute } from './cliente.route.js'
import { router as userRoute } from './user.route.js'
import { router as productosRoute } from './productos.route.js'
import { router as materialesRoute } from './materiales.route.js'
import { router as pagosRoute } from './pagos.route.js'
import { router as ventasRoute } from './ventas.route.js'
import { router as alertasRoute } from './alertas.route.js'
import { authValidator, isAdmin } from "../middleware/auth.middleware.js";

const router = Router()

router.use('/auth', loginRute)
router.use('/pedidos', pedidoRute)
router.use('/dashboard', dashboardRoute)
router.use('/clientes', clienteRoute)
router.use('/usuarios', userRoute)
router.use('/productos', productosRoute)
router.use('/materiales', materialesRoute)
router.use('/pagos', pagosRoute)
router.use('/ventas', ventasRoute)
router.use('/alertas', alertasRoute)

router.get('/prueba', authValidator, isAdmin, (req, res) => {
  res.send("pagina protegida")
})

export default router
