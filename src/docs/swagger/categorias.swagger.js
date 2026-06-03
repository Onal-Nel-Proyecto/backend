/**
 * Swagger paths y schemas para el módulo de Categorías.
 * Se importa desde src/config/swagger.js
 */
export const categoriasPaths = {
  '/categorias': {
    get: {
      tags: ['Categorías'],
      summary: 'Listar categorías',
      description: 'Obtiene todas las categorías con filtros opcionales.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'estado', schema: { type: 'string', enum: ['ACTIVO', 'INACTIVO'] }, description: 'Filtrar por estado' },
        { in: 'query', name: 'nombre', schema: { type: 'string' }, description: 'Filtrar por nombre' },
      ],
      responses: {
        200: { description: 'Lista de categorías', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
    post: {
      tags: ['Categorías'],
      summary: 'Crear categoría',
      description: 'Registra una nueva categoría en el sistema.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CrearCategoria' },
          },
        },
      },
      responses: {
        201: { description: 'Categoría creada exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
  },
  '/categorias/{id}': {
    get: {
      tags: ['Categorías'],
      summary: 'Obtener categoría por ID',
      description: 'Obtiene los datos de una categoría específica.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID de la categoría' },
      ],
      responses: {
        200: { description: 'Datos de la categoría', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        404: { description: 'Categoría no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
      },
    },
    put: {
      tags: ['Categorías'],
      summary: 'Actualizar categoría',
      description: 'Actualiza los datos de una categoría existente.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID de la categoría' },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ActualizarCategoria' },
          },
        },
      },
      responses: {
        200: { description: 'Categoría actualizada exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        404: { description: 'Categoría no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
      },
    },
  },
  '/categorias/{id}/estado': {
    patch: {
      tags: ['Categorías'],
      summary: 'Cambiar estado de categoría',
      description: 'Activa o desactiva una categoría.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID de la categoría' },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                estado: { type: 'string', enum: ['ACTIVO', 'INACTIVO'], example: 'INACTIVO' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Estado actualizado exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        404: { description: 'Categoría no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
      },
    },
  },
};

export const categoriasSchemas = {
  CrearCategoria: {
    type: 'object',
    required: ['catNom'],
    properties: {
      catNom: { type: 'string', description: 'Nombre de la categoría (mín. 3, máx. 50 caracteres)', example: 'Uniformes' },
      catDesc: { type: 'string', description: 'Descripción (máx. 120 caracteres)', example: 'Categoría de uniformes' },
      catEst: { type: 'string', enum: ['ACTIVO', 'INACTIVO'], description: 'Estado inicial', example: 'ACTIVO' },
    },
  },
  ActualizarCategoria: {
    type: 'object',
    required: ['catNom'],
    properties: {
      catNom: { type: 'string', description: 'Nombre de la categoría (mín. 3, máx. 50 caracteres)', example: 'Uniformes Ejecutivos' },
      catDesc: { type: 'string', description: 'Descripción (máx. 120 caracteres)', example: 'Categoría de uniformes ejecutivos' },
      catEst: { type: 'string', enum: ['ACTIVO', 'INACTIVO'], description: 'Estado', example: 'ACTIVO' },
    },
  },
};
