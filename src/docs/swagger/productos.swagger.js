export const productosPaths = {
  '/productos': {
    get: {
      tags: ['Productos'],
      summary: 'Listar productos',
      description: 'Obtiene todos los productos con paginación y filtros.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'pagina', schema: { type: 'integer' }, description: 'Número de página' },
        { in: 'query', name: 'limite', schema: { type: 'integer' }, description: 'Registros por página' },
        { in: 'query', name: 'nombre', schema: { type: 'string' }, description: 'Filtrar por nombre' },
        { in: 'query', name: 'estado', schema: { type: 'string' }, description: 'Filtrar por estado' },
        { in: 'query', name: 'categoria', schema: { type: 'string' }, description: 'Filtrar por categoría' },
        { in: 'query', name: 'tipoProducto', schema: { type: 'string' }, description: 'Filtrar por tipo de producto' },
      ],
      responses: {
        200: { description: 'Lista de productos' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
    post: {
      tags: ['Productos'],
      summary: 'Crear producto',
      description: 'Registra un nuevo producto. Solo administradores.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CrearProducto' } } },
      },
      responses: {
        201: { description: 'Producto creado exitosamente' },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        403: { description: 'Acceso denegado' },
      },
    },
  },
  '/productos/{id}': {
    get: {
      tags: ['Productos'],
      summary: 'Obtener producto por ID',
      description: 'Obtiene los datos de un producto específico.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del producto' },
      ],
      responses: {
        200: { description: 'Datos del producto' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        404: { description: 'Producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
      },
    },
    put: {
      tags: ['Productos'],
      summary: 'Actualizar producto',
      description: 'Actualiza los datos de un producto. Solo administradores.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del producto' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ActualizarProducto' } } },
      },
      responses: {
        200: { description: 'Producto actualizado exitosamente' },
        400: { description: 'Datos inválidos' },
        401: { description: 'No autorizado' },
        403: { description: 'Acceso denegado' },
        404: { description: 'Producto no encontrado' },
      },
    },
  },
  '/productos/{id}/estado': {
    patch: {
      tags: ['Productos'],
      summary: 'Cambiar estado del producto',
      description: 'Cambia el estado de un producto (1=activo, 2=agotado, 3=desactivado). Solo administradores.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del producto' },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                estado: { type: 'integer', enum: [1, 2, 3], example: 2 },
              },
              required: ['estado'],
            },
          },
        },
      },
      responses: {
        200: { description: 'Estado actualizado exitosamente' },
        400: { description: 'Datos inválidos' },
        401: { description: 'No autorizado' },
        403: { description: 'Acceso denegado' },
        404: { description: 'Producto no encontrado' },
      },
    },
  },
};

export const productosSchemas = {
  CrearProducto: {
    type: 'object',
    required: ['nombre', 'precioUnitario', 'tipoProducto'],
    properties: {
      nombre: { type: 'string', example: 'Camisa Oxford' },
      precioUnitario: { type: 'number', example: 45000 },
      descripcion: { type: 'string', example: 'Camisa manga larga' },
      genero: { type: 'string', enum: ['MASCULINO', 'FEMENINO', 'UNISEX'], example: 'MASCULINO' },
      categoriaId: { type: 'integer', example: 1 },
      tipoPrenda: { type: 'string', example: 'CAMISA' },
      tipoProducto: { type: 'string', enum: ['INVENTARIO', 'PERSONALIZADO'], example: 'INVENTARIO' },
      umbralMinimo: { type: 'integer', example: 5 },
      talla: { type: 'string', example: 'M' },
      cantidadDisponible: { type: 'integer', example: 50 },
    },
  },
  ActualizarProducto: {
    type: 'object',
    properties: {
      nombre: { type: 'string', example: 'Camisa Oxford Premium' },
      precioUnitario: { type: 'number', example: 55000 },
      descripcion: { type: 'string', example: 'Camisa manga larga premium' },
      genero: { type: 'string', enum: ['MASCULINO', 'FEMENINO', 'UNISEX'] },
      categoriaId: { type: 'integer', example: 2 },
      tipoPrenda: { type: 'string', example: 'CAMISA' },
      umbralMinimo: { type: 'integer', example: 10 },
      talla: { type: 'string', example: 'L' },
    },
  },
};
