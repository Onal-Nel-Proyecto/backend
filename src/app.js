import express from "express";
import cors from "cors";
import { router as loginRute } from './routes/log.route.js'
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/log', loginRute)


export default app