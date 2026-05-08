import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from './routes/index.route.js'
const app = express();

// configuración de middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use('/', routes)


export default app