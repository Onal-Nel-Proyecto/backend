import express from "express";
import path from "node:path";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from './routes/index.route.js'
import { errorMiddleware } from './middleware/err.middleware.js';
import { FRONT_URL_DEV, FRONT_URL_PROD } from "./config/config.js";
import { swaggerServe, swaggerSetup } from './config/swagger.js';

const app = express();

// configuración de middlewares
app.use(express.json());

app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      "http://localhost:5173",
      "https://sp78zgqw-5173.use2.devtunnels.ms",  
      "https://frontend-nine-vert-24.vercel.app",
      "http://192.168.18.65:5173"
    ]
    // console.log(origin)
    if(ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, origin)
    }
    if(!origin) return callback(null, true)
    return callback(new Error("Not allowed by CORS"))
  },
  credentials: true
}
))
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.resolve('uploads')));

app.use('/', routes)

// Documentación Swagger/OpenAPI
app.use('/api-docs', swaggerServe, swaggerSetup);

// Middleware global de errores (debe ir después de las rutas)
app.use(errorMiddleware);

export default app
