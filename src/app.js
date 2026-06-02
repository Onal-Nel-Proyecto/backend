import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from './routes/index.route.js'
import { errorMiddleware } from './middleware/err.middleware.js';
import { FRONT_URL_DEV, FRONT_URL_PROD } from "./config/config.js";

const app = express();

// configuración de middlewares
app.use(express.json());

app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      "http://localhost:5173",
      "https://sp78zgqw-5173.use2.devtunnels.ms",  
      "https://frontend-nine-vert-24.vercel.app",
      'http://10.2.129.229:5173',
      "http://192.168.18.65:5173"
    ]
    console.log(origin)
    if(ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }
    if(!origin) return callback(null, true)
    return callback(new Error("Not allowed by CORS"))
  },
  credentials: true
}
))
// app.use((err, req, res, next) => {
//   console.error("ERROR GLOBAL:", err);

//   res.status(500).json({
//     status: false,
//     error: err.message
//   });
// });
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use('/', routes)

// Middleware global de errores (debe ir después de las rutas)
app.use(errorMiddleware);

export default app