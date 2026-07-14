import express from "express";
import path from "node:path";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from './routes/index.route.js'
import { errorMiddleware } from './middleware/err.middleware.js';
import { FRONT_URL_DEV, FRONT_URL_PROD } from "./config/config.js";
import { swaggerServe, swaggerSetup } from './config/swagger.js';

const app = express();
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("FRONT_END_URL:", process.env.FRONT_END_URL);

// configuración de middlewares
app.use(express.json());

app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      process.env.FRONT_END_URL
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
