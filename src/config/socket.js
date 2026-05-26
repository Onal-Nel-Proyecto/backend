import { Server } from 'socket.io';
import { FRONT_URL_DEV, FRONT_URL_PROD } from './config.js';

let io;

/**
 * Inicializar Socket.IO con el servidor HTTP
 * @param {import('http').Server} server - Servidor HTTP creado con http.createServer()
 * @returns {import('socket.io').Server} Instancia de Socket.IO
 */
export const initSocket = (server) => {
  const ACCEPTED_ORIGINS = [
    FRONT_URL_DEV || 'http://localhost:5173',
    FRONT_URL_PROD,
    'https://sp78zgqw-5173.use2.devtunnels.ms',
    'https://frontend-nine-vert-24.vercel.app'
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS (Socket.IO)'));
      },
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('[SOCKET] Cliente conectado:', socket.id);

    socket.on('disconnect', () => {
      console.log('[SOCKET] Cliente desconectado:', socket.id);
    });
  });

  console.log('[SOCKET] Socket.IO inicializado correctamente');
  return io;
};

/**
 * Obtener la instancia de Socket.IO (para emitir eventos desde cualquier parte)
 * @returns {import('socket.io').Server}
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO no ha sido inicializado. Llama a initSocket(server) primero.');
  }
  return io;
};
