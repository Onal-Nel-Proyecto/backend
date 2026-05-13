import { Router } from 'express'
import { router as loginRute } from './log.route.js'
import { router as pedidoRute } from './pedidos.route.js'
import { router as dashboardRoute } from './dashboard.route.js'
import { authValidator, isAdmin } from "../middleware/auth.middleware.js";

const router = Router()

router.use('/auth', loginRute)
router.use('/pedidos', pedidoRute)
router.use('/dashboard', dashboardRoute)

router.get('/prueba', authValidator, isAdmin, (req, res) => {
  res.send("pagina protegida")
})

export default router