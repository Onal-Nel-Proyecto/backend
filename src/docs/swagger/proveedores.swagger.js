export const proveedoresPaths = {
  '/proveedores': {
    get: {
      tags: ['Proveedores'],
      summary: 'Listar proveedores',
      description: 'Obtiene todos los proveedores registrados.',
      security: [{ cookieAuth: [] }],
      responses: {
        200: { description: 'Lista de proveedores' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
    post: {
      tags: ['Proveedores'],
      summary: 'Crear proveedor',
      description: 'Registra un nuevo proveedor.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CrearProveedor' } } },
      },
      responses: {
        201: { description: 'Proveedor creado exitosamente' },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
  },
  '/proveedores/{id}': {
    get: {
      tags: ['Proveedores'],
      summary: 'Obtener proveedor por ID',
      description: 'Obtiene los datos de un proveedor específico.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del proveedor' },
      ],
      responses: {
        200: { description: 'Datos del proveedor' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        404: { description: 'Proveedor no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
      },
    },
    put: {
      tags: ['Proveedores'],
      summary: 'Actualizar proveedor',
      description: 'Actualiza los datos de un proveedor.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del proveedor' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ActualizarProveedor' } } },
      },
      responses: {
        200: { description: 'Proveedor actualizado exitosamente' },
        400: { description: 'Datos inválidos' },
        401: { description: 'No autorizado' },
        404: { description: 'Proveedor no encontrado' },
      },
    },
    delete: {
      tags: ['Proveedores'],
      summary: 'Eliminar proveedor',
      description: 'Elimina un proveedor del sistema.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del proveedor' },
      ],
      responses: {
        200: { description: 'Proveedor eliminado exitosamente' },
        401: { description: 'No autorizado' },
        404: { description: 'Proveedor no encontrado' },
      },
    },
  },
};

export const proveedoresSchemas = {
  CrearProveedor: {
    type: 'object',
    required: ['proveedor_nombre'],
    properties: {
      proveedor_nombre: { type: 'string', example: 'Distribuidora Textil S.A.S.' },
      proveedor_contacto: { type: 'string', example: 'Carlos López' },
      proveedor_telefono: { type: 'string', example: '3101234567' },
      proveedor_correo: { type: 'string', format: 'email', example: 'ventas@distribuidoratextil.com' },
      proveedor_direccion: { type: 'string', example: 'Cra 48 # 20-30' },
      proveedor_notas: { type: 'string', example: 'Proveedor confiable' },
    },
  },
  ActualizarProveedor: {
    type: 'object',
    properties: {
      proveedor_nombre: { type: 'string', example: 'Distribuidora Textil S.A.S.' },
      proveedor_contacto: { type: 'string', example: 'María García' },
      proveedor_telefono: { type: 'string', example: '3107654321' },
      proveedor_correo: { type: 'string', format: 'email', example: 'maria@distribuidoratextil.com' },
      proveedor_direccion: { type: 'string', example: 'Cra 48 # 20-30' },
      proveedor_notas: { type: 'string', example: 'Proveedor actualizado' },
    },
  },
};
