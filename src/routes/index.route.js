import { Router } from 'express'
import { router as loginRute } from './log.route.js'
import { router as pedidoRute } from './pedidos.route.js'
import { router as clienteRoute } from './cliente.route.js'
import { authValidator, isAdmin } from "../middleware/auth.middleware.js";

const router = Router()

router.use('/auth', loginRute)
router.use('/pedidos', pedidoRute)
router.use('/clientes', clienteRoute)

router.get('/prueba', authValidator, isAdmin, (req, res) => {
  res.send("pagina protegida")
})

export default router