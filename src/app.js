import express from "express";
import cors from "cors";
import { router as loginRute } from './routes/log.route.js'
import { authValidator, isAdmin } from "./middleware/auth.middleware.js";
import cookieParser from "cookie-parser";
const app = express();

// configuración de middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use('/log', loginRute) // ruta para login y logout

// ruta de prueba de autenticacion y autorizacion
app.get('/prueba', authValidator, isAdmin, (req, res) => {
  res.send("pagina protegida")
})



export default app