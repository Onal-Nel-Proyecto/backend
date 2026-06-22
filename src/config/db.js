import mysql2 from 'mysql2/promise';
import {
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_PORT
} from './config.js';

//  crear pool (sin await)
const pool = mysql2.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  port: MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '-05:00',
  
});

// función para validar conexión
export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();

    await connection.ping(); // validar que la conexión esté activa

    connection.release(); // liberar conexión de vuelta al pool

    console.log('Conexión a MySQL establecida');
  } catch (error) {
    console.error('Error conectando a la base de datos:', error.message);

    process.exit(1); // detiene la app si falla
  }
};

export default pool;