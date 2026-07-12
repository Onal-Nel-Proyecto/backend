import swaggerUi from 'swagger-ui-express';
import { categoriasPaths, categoriasSchemas } from '../docs/swagger/categorias.swagger.js';
import { medidasPaths, medidasSchemas } from '../docs/swagger/medidas.swagger.js';
import { authPaths, authSchemas } from '../docs/swagger/auth.swagger.js';
import { dashboardPaths, dashboardSchemas } from '../docs/swagger/dashboard.swagger.js';
import { clientesPaths, clientesSchemas } from '../docs/swagger/clientes.swagger.js';
import { usuariosPaths, usuariosSchemas } from '../docs/swagger/usuarios.swagger.js';
import { productosPaths, productosSchemas } from '../docs/swagger/productos.swagger.js';
import { materialesPaths, materialesSchemas } from '../docs/swagger/materiales.swagger.js';
import { pagosPaths, pagosSchemas } from '../docs/swagger/pagos.swagger.js';
import { proveedoresPaths, proveedoresSchemas } from '../docs/swagger/proveedores.swagger.js';
import { movimientosPaths, movimientosSchemas } from '../docs/swagger/movimientos.swagger.js';
import { alertasPaths, alertasSchemas } from '../docs/swagger/alertas.swagger.js';
import { abastecimientosPaths, abastecimientosSchemas } from '../docs/swagger/abastecimientos.swagger.js';
import { ventasPaths, ventasSchemas } from '../docs/swagger/ventas.swagger.js';
import { pedidosPaths, pedidosSchemas } from '../docs/swagger/pedidos.swagger.js';

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API Confecciones ONA & NEL',
    version: '1.0.0',
    description: 'Sistema de gestión de confecciones',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local',
    },
  ],
  tags: [
    { name: 'Autenticación', description: 'Inicio y cierre de sesión' },
    { name: 'Dashboard', description: 'Indicadores del sistema' },
    { name: 'Clientes', description: 'Gestión de clientes' },
    { name: 'Usuarios', description: 'Gestión de usuarios del sistema' },
    { name: 'Productos', description: 'Gestión de productos' },
    { name: 'Materiales', description: 'Gestión de materiales' },
    { name: 'Categorías', description: 'Gestión de categorías de productos' },
    { name: 'Medidas', description: 'Gestión de medidas corporales' },
    { name: 'Pedidos', description: 'Gestión de pedidos' },
    { name: 'Pedidos - Detalles', description: 'Detalles de los pedidos' },
    { name: 'Pedidos - Producción', description: 'Órdenes de producción' },
    { name: 'Pedidos - Fotos', description: 'Fotos de los pedidos' },
    { name: 'Pedidos - Historial', description: 'Historial de cambios de estado' },
    { name: 'Ventas', description: 'Gestión de ventas' },
    { name: 'Ventas - Factura', description: 'Facturación de ventas' },
    { name: 'Ventas - Reportes', description: 'Reportes de ventas' },
    { name: 'Pagos', description: 'Gestión de pagos' },
    { name: 'Abastecimientos', description: 'Gestión de abastecimientos' },
    { name: 'Proveedores', description: 'Gestión de proveedores' },
    { name: 'Movimientos', description: 'Movimientos de inventario' },
    { name: 'Alertas', description: 'Alertas del sistema' },
  ],
  paths: {
    ...authPaths,
    ...dashboardPaths,
    ...clientesPaths,
    ...usuariosPaths,
    ...productosPaths,
    ...materialesPaths,
    ...categoriasPaths,
    ...medidasPaths,
    ...pedidosPaths,
    ...ventasPaths,
    ...pagosPaths,
    ...abastecimientosPaths,
    ...proveedoresPaths,
    ...movimientosPaths,
    ...alertasPaths,
  },
  components: {
    schemas: {
      // ============================================================
      // ESQUEMAS POR MÓDULO
      // ============================================================
      ...authSchemas,
      ...dashboardSchemas,
      ...clientesSchemas,
      ...usuariosSchemas,
      ...productosSchemas,
      ...materialesSchemas,
      ...categoriasSchemas,
      ...medidasSchemas,
      ...pedidosSchemas,
      ...ventasSchemas,
      ...pagosSchemas,
      ...abastecimientosSchemas,
      ...proveedoresSchemas,
      ...movimientosSchemas,
      ...alertasSchemas,

      // ============================================================
      // RESPUESTAS ESTÁNDAR
      // ============================================================
      Respuesta200: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            description: 'Datos de la respuesta',
            example: {},
          },
        },
      },
      Respuesta400: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Datos inválidos',
          },
        },
      },
      Respuesta401: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'No autorizado',
          },
        },
      },
      Respuesta404: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Recurso no encontrado',
          },
        },
      },
      Respuesta500: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error interno del servidor',
          },
        },
      },
    },
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'Autenticación mediante cookie JWT (token)',
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
};

// Deshabilitar "Try it out" — solo referencia, sin ejecución
const swaggerOptions = {
  swaggerOptions: {
    supportedSubmitMethods: [],
  },
};

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerSpec, swaggerOptions);
