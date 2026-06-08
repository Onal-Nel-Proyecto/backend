import swaggerUi from 'swagger-ui-express';
import { categoriasPaths, categoriasSchemas } from '../docs/swagger/categorias.swagger.js';
import { medidasPaths, medidasSchemas } from '../docs/swagger/medidas.swagger.js';

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
    { name: 'Categorías', description: 'Gestión de categorías de productos' },
    { name: 'Medidas', description: 'Gestión de medidas corporales' },
  ],
  paths: {
    ...categoriasPaths,
    ...medidasPaths,
  },
  components: {
    schemas: {
      // ============================================================
      // ESQUEMAS DE CATEGORÍAS
      // ============================================================
      ...categoriasSchemas,

      // ============================================================
      // ESQUEMAS DE MEDIDAS
      // ============================================================
      ...medidasSchemas,

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
