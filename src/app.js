import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from './routes/index.route.js'
import { errorMiddleware } from './middleware/err.middleware.js';

const app = express();

// configuración de middlewares
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use('/', routes)

// Middleware global de errores (debe ir después de las rutas)
app.use(errorMiddleware);

export default app