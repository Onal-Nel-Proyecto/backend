export const materialesPaths = {
  '/materiales': {
    get: {
      tags: ['Materiales'],
      summary: 'Listar materiales',
      description: 'Obtiene todos los materiales con paginación y filtros.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'pagina', schema: { type: 'integer' }, description: 'Número de página' },
        { in: 'query', name: 'limite', schema: { type: 'integer' }, description: 'Registros por página' },
        { in: 'query', name: 'nombre', schema: { type: 'string' }, description: 'Filtrar por nombre' },
        { in: 'query', name: 'estado', schema: { type: 'string' }, description: 'Filtrar por estado' },
        { in: 'query', name: 'tipoMaterial', schema: { type: 'string' }, description: 'Filtrar por tipo de material' },
      ],
      responses: {
        200: { description: 'Lista de materiales' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
    post: {
      tags: ['Materiales'],
      summary: 'Crear material',
      description: 'Registra un nuevo material. Solo administradores.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CrearMaterial' } } },
      },
      responses: {
        201: { description: 'Material creado exitosamente' },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        403: { description: 'Acceso denegado' },
      },
    },
  },
  '/materiales/{id}': {
    get: {
      tags: ['Materiales'],
      summary: 'Obtener material por ID',
      description: 'Obtiene los datos de un material específico.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del material' },
      ],
      responses: {
        200: { description: 'Datos del material' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        404: { description: 'Material no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
      },
    },
    put: {
      tags: ['Materiales'],
      summary: 'Actualizar material',
      description: 'Actualiza los datos de un material. Solo administradores.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del material' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ActualizarMaterial' } } },
      },
      responses: {
        200: { description: 'Material actualizado exitosamente' },
        400: { description: 'Datos inválidos' },
        401: { description: 'No autorizado' },
        403: { description: 'Acceso denegado' },
        404: { description: 'Material no encontrado' },
      },
    },
  },
  '/materiales/{id}/estado': {
    patch: {
      tags: ['Materiales'],
      summary: 'Cambiar estado del material',
      description: 'Cambia el estado de un material. Solo administradores.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del material' },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                estado: { type: 'string', enum: ['DISPONIBLE', 'AGOTADO', 'ELIMINADO'], example: 'DISPONIBLE' },
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
        404: { description: 'Material no encontrado' },
      },
    },
  },
};

export const materialesSchemas = {
  CrearMaterial: {
    type: 'object',
    required: ['nombre', 'tipoMaterial'],
    properties: {
      nombre: { type: 'string', example: 'Tela Algodón Premium' },
      descripcion: { type: 'string', example: 'Tela de algodón 100% peinada' },
      umbralMinimo: { type: 'integer', example: 10 },
      unidadMedida: { type: 'string', example: 'Metros' },
      tipoMaterial: { type: 'string', enum: ['TELA', 'HILO', 'BOTON', 'CIERRE', 'HERRAJE', 'HERRAMIENTA', 'EMPAQUE', 'OTRO'], example: 'TELA' },
      cantidadDisponible: { type: 'integer', example: 100 },
    },
  },
  ActualizarMaterial: {
    type: 'object',
    properties: {
      nombre: { type: 'string', example: 'Tela Algodón Superior' },
      descripcion: { type: 'string', example: 'Tela de algodón egipcio' },
      umbralMinimo: { type: 'integer', example: 15 },
      unidadMedida: { type: 'string', example: 'Metros' },
      tipoMaterial: { type: 'string', enum: ['TELA', 'HILO', 'BOTON', 'CIERRE', 'HERRAJE', 'HERRAMIENTA', 'EMPAQUE', 'OTRO'] },
      stock: { type: 'integer', example: 80 },
    },
  },
};
