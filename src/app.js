import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from './routes/index.route.js'
import { errorMiddleware } from './middleware/err.middleware.js';
import { FRONT_URL_DEV, FRONT_URL_PROD } from "./config/config.js";

const app = express();

// configuración de middlewares
app.use(express.json());
const allowedOrigins = [
  FRONT_URL_DEV ?? 'http://localhost:5173',
  FRONT_URL_PROD
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use('/', routes)

// Middleware global de errores (debe ir después de las rutas)
app.use(errorMiddleware);

export default app