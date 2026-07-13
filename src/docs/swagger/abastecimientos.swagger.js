export const abastecimientosPaths = {
  '/abastecimientos': {
    get: {
      tags: ['Abastecimientos'],
      summary: 'Listar abastecimientos',
      description: 'Obtiene todos los abastecimientos con paginación.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'pag', schema: { type: 'integer' }, description: 'Número de página' },
      ],
      responses: {
        200: { description: 'Lista de abastecimientos' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
    post: {
      tags: ['Abastecimientos'],
      summary: 'Crear abastecimiento',
      description: 'Registra un nuevo abastecimiento de materiales/productos.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CrearAbastecimiento' } } },
      },
      responses: {
        201: { description: 'Abastecimiento creado exitosamente' },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
  },
  '/abastecimientos/{id}': {
    get: {
      tags: ['Abastecimientos'],
      summary: 'Obtener abastecimiento por ID',
      description: 'Obtiene los detalles de un abastecimiento específico.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID del abastecimiento' },
      ],
      responses: {
        200: { description: 'Detalles del abastecimiento' },
        401: { description: 'No autorizado' },
        404: { description: 'Abastecimiento no encontrado' },
      },
    },
  },
  '/abastecimientos/{id}/completar': {
    patch: {
      tags: ['Abastecimientos'],
      summary: 'Completar abastecimiento',
      description: 'Marca un abastecimiento como completado. El trigger actualiza stock y movimientos.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID del abastecimiento' },
      ],
      responses: {
        200: { description: 'Abastecimiento completado exitosamente' },
        401: { description: 'No autorizado' },
        404: { description: 'Abastecimiento no encontrado' },
      },
    },
  },
  '/abastecimientos/{id}/cancelar': {
    patch: {
      tags: ['Abastecimientos'],
      summary: 'Cancelar abastecimiento',
      description: 'Cancela un abastecimiento y revierte el stock.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID del abastecimiento' },
      ],
      responses: {
        200: { description: 'Abastecimiento cancelado exitosamente' },
        401: { description: 'No autorizado' },
        404: { description: 'Abastecimiento no encontrado' },
      },
    },
  },
};

export const abastecimientosSchemas = {
  CrearAbastecimiento: {
    type: 'object',
    required: ['proveedor', 'detalles'],
    properties: {
      proveedor: { type: 'string', example: 'PROV-001' },
      observacion: { type: 'string', example: 'Pedido de telas para próxima temporada' },
      detalles: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            tipo: { type: 'string', enum: ['PRODUCTO', 'MATERIAL'], example: 'MATERIAL' },
            referencia_id: { type: 'string', example: 'MAT-001' },
            cantidad: { type: 'integer', example: 50 },
          },
        },
      },
    },
  },
};
