import './config.js';
import app from "../app.js";
import { PORT } from "./config.js";
import { connectDB } from './db.js';

await connectDB(); //  conectar a la base de datos antes de iniciar el servidor

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
