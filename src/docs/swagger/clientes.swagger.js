export const clientesPaths = {
  '/clientes': {
    get: {
      tags: ['Clientes'],
      summary: 'Listar clientes',
      description: 'Obtiene todos los clientes con filtros opcionales.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'pag', schema: { type: 'integer' }, description: 'Número de página' },
        { in: 'query', name: 'nombre', schema: { type: 'string' }, description: 'Filtrar por nombre' },
        { in: 'query', name: 'estado', schema: { type: 'string' }, description: 'Filtrar por estado' },
      ],
      responses: {
        200: { description: 'Lista de clientes' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
    post: {
      tags: ['Clientes'],
      summary: 'Crear cliente',
      description: 'Registra un nuevo cliente en el sistema.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CrearCliente' } } },
      },
      responses: {
        201: { description: 'Cliente creado exitosamente' },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
  },
  '/clientes/{id}': {
    get: {
      tags: ['Clientes'],
      summary: 'Obtener cliente por ID',
      description: 'Obtiene los datos de un cliente específico.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del cliente' },
      ],
      responses: {
        200: { description: 'Datos del cliente' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        404: { description: 'Cliente no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
      },
    },
    put: {
      tags: ['Clientes'],
      summary: 'Actualizar cliente',
      description: 'Actualiza los datos de un cliente existente.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del cliente' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ActualizarCliente' } } },
      },
      responses: {
        200: { description: 'Cliente actualizado exitosamente' },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        404: { description: 'Cliente no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
      },
    },
  },
  '/clientes/{id}/estado': {
    patch: {
      tags: ['Clientes'],
      summary: 'Cambiar estado del cliente',
      description: 'Activa o desactiva un cliente.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del cliente' },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                estado: { type: 'integer', enum: [1, 2], description: '1=activo, 2=bloqueado', example: 2 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Estado actualizado exitosamente' },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        404: { description: 'Cliente no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
      },
    },
  },
};

export const clientesSchemas = {
  CrearCliente: {
    type: 'object',
    required: ['cliNumDoc', 'cliNom', 'cliApe'],
    properties: {
      cliNumDoc: { type: 'string', example: '12345678' },
      cliNom: { type: 'string', example: 'Juan' },
      cliApe: { type: 'string', example: 'Pérez' },
      cliTel: { type: 'string', example: '3001234567' },
      cliCor: { type: 'string', format: 'email', example: 'juan@email.com' },
      cliDir: { type: 'string', example: 'Calle 123' },
    },
  },
  ActualizarCliente: {
    type: 'object',
    properties: {
      cliNom: { type: 'string', example: 'Juan Carlos' },
      cliApe: { type: 'string', example: 'Pérez García' },
      cliTel: { type: 'string', example: '3007654321' },
      cliCor: { type: 'string', format: 'email', example: 'juanc@email.com' },
      cliDir: { type: 'string', example: 'Carrera 45 #67-89' },
    },
  },
};
