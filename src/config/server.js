import './config.js';
import http from 'http';
import app from "../app.js";
import { PORT } from "./config.js";
import { connectDB } from './db.js';
import { initSocket } from './socket.js';
import { iniciarJobAlertas } from '../jobs/alertas.job.js';

await connectDB(); // conectar a la base de datos antes de iniciar el servidor

// Crear servidor HTTP para soportar Socket.IO
const server = http.createServer(app);

// Inicializar Socket.IO
initSocket(server);

// Iniciar job de alertas (node-cron cada 15 min)
iniciarJobAlertas();

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
