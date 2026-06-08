/**
 * Swagger paths y schemas para el módulo de Medidas.
 * Se importa desde src/config/swagger.js
 */
export const medidasPaths = {
  '/medidas': {
    get: {
      tags: ['Medidas'],
      summary: 'Listar medidas',
      description: 'Obtiene todas las medidas con filtros opcionales.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'estado', schema: { type: 'string', enum: ['ACTIVO', 'INACTIVO'] }, description: 'Filtrar por estado' },
        { in: 'query', name: 'nombre', schema: { type: 'string' }, description: 'Filtrar por nombre' },
      ],
      responses: {
        200: { description: 'Lista de medidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
    post: {
      tags: ['Medidas'],
      summary: 'Crear medida',
      description: 'Registra una nueva medida en el sistema.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CrearMedida' },
          },
        },
      },
      responses: {
        201: { description: 'Medida creada exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
  },
  '/medidas/{id}': {
    get: {
      tags: ['Medidas'],
      summary: 'Obtener medida por ID',
      description: 'Obtiene los datos de una medida específica.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID de la medida' },
      ],
      responses: {
        200: { description: 'Datos de la medida', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        404: { description: 'Medida no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
      },
    },
    put: {
      tags: ['Medidas'],
      summary: 'Actualizar medida',
      description: 'Actualiza los datos de una medida existente.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID de la medida' },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ActualizarMedida' },
          },
        },
      },
      responses: {
        200: { description: 'Medida actualizada exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        404: { description: 'Medida no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
      },
    },
  },
  '/medidas/{id}/estado': {
    patch: {
      tags: ['Medidas'],
      summary: 'Cambiar estado de medida',
      description: 'Activa o desactiva una medida.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID de la medida' },
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
        404: { description: 'Medida no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
      },
    },
  },
};

export const medidasSchemas = {
  CrearMedida: {
    type: 'object',
    required: ['medNom'],
    properties: {
      medNom: { type: 'string', description: 'Nombre de la medida (mín. 3, máx. 50 caracteres)', example: 'Pecho' },
      medDesc: { type: 'string', description: 'Descripción (máx. 120 caracteres)', example: 'Medida del contorno del pecho' },
      medEst: { type: 'string', enum: ['ACTIVO', 'INACTIVO'], description: 'Estado inicial', example: 'ACTIVO' },
    },
  },
  ActualizarMedida: {
    type: 'object',
    required: ['medNom'],
    properties: {
      medNom: { type: 'string', description: 'Nombre de la medida (mín. 3, máx. 50 caracteres)', example: 'Contorno de pecho' },
      medDesc: { type: 'string', description: 'Descripción (máx. 120 caracteres)', example: 'Medida actualizada del contorno del pecho' },
      medEst: { type: 'string', enum: ['ACTIVO', 'INACTIVO'], description: 'Estado', example: 'ACTIVO' },
    },
  },
};
