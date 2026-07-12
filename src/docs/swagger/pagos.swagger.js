export const pagosPaths = {
  '/pagos': {
    get: {
      tags: ['Pagos'],
      summary: 'Listar pagos',
      description: 'Obtiene todos los pagos registrados.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'pag', schema: { type: 'integer' }, description: 'Número de página' },
      ],
      responses: {
        200: { description: 'Lista de pagos' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
    post: {
      tags: ['Pagos'],
      summary: 'Crear pago',
      description: 'Registra un nuevo pago.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CrearPago' } } },
      },
      responses: {
        201: { description: 'Pago registrado exitosamente' },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
  },
  '/pagos/{id}/rechazar': {
    patch: {
      tags: ['Pagos'],
      summary: 'Rechazar pago',
      description: 'Rechaza un pago registrado.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID del pago' },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                motivo: { type: 'string', example: 'Pago duplicado' },
              },
              required: ['motivo'],
            },
          },
        },
      },
      responses: {
        200: { description: 'Pago rechazado exitosamente' },
        400: { description: 'Datos inválidos' },
        401: { description: 'No autorizado' },
        404: { description: 'Pago no encontrado' },
      },
    },
  },
};

export const pagosSchemas = {
  CrearPago: {
    type: 'object',
    required: ['monto', 'tipoPago'],
    properties: {
      monto: { type: 'number', example: 50000 },
      tipoPago: { type: 'string', enum: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'], example: 'EFECTIVO' },
      pedidoId: { type: 'string', example: 'PD001' },
      ventaId: { type: 'integer', example: 1 },
      observacion: { type: 'string', example: 'Pago inicial del 50%' },
    },
  },
};
