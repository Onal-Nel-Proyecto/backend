import mysql2 from 'mysql2/promise'
import { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } from './config.js'

const connection = await mysql2.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE
})
console.log('Conexión a la base de datos MySQL establecida')


export default connection