import swaggerUi from 'swagger-ui-express';

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
    { name: 'Auth', description: 'Autenticación y gestión de sesiones' },
    { name: 'Usuarios', description: 'Gestión de usuarios del sistema' },
    { name: 'Clientes', description: 'Gestión de clientes' },
    { name: 'Productos', description: 'Gestión de productos' },
    { name: 'Materiales', description: 'Gestión de materiales' },
    { name: 'Pedidos', description: 'Gestión de pedidos' },
    { name: 'Producción', description: 'Gestión de producción asociada a pedidos' },
    { name: 'Ventas', description: 'Gestión de ventas y facturación' },
    { name: 'Pagos', description: 'Gestión de pagos' },
    { name: 'Dashboard', description: 'Indicadores y resúmenes del panel principal' },
    { name: 'Reportes', description: 'Reportes de ventas (mensuales y por período)' },
    { name: 'Alertas', description: 'Alertas del sistema' },
  ],
  paths: {
    // ============================================================
    // AUTH
    // ============================================================
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        description: 'Autentica un usuario con correo y contraseña, retorna un token JWT en cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Login',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Inicio de sesión exitoso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Respuesta200',
                },
              },
            },
          },
          400: {
            description: 'Datos inválidos',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Respuesta400',
                },
              },
            },
          },
          401: {
            description: 'Credenciales incorrectas',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Respuesta401',
                },
              },
            },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Cerrar sesión',
        description: 'Limpia las cookies de autenticación (token y refreshToken).',
        responses: {
          200: {
            description: 'Sesión cerrada correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    msg: { type: 'string', example: 'Sesión cerrada' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refrescar token',
        description: 'Genera un nuevo token de acceso usando el refreshToken.',
        responses: {
          200: {
            description: 'Token renovado exitosamente',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Respuesta200',
                },
              },
            },
          },
          401: {
            description: 'No autorizado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Respuesta401',
                },
              },
            },
          },
        },
      },
    },
    '/auth/perfil': {
      get: {
        tags: ['Auth'],
        summary: 'Obtener perfil del usuario autenticado',
        description: 'Retorna los datos del usuario actual según el token JWT.',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Perfil del usuario',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Respuesta200',
                },
              },
            },
          },
          401: {
            description: 'No autorizado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Respuesta401',
                },
              },
            },
          },
        },
      },
    },

    // ============================================================
    // DASHBOARD
    // ============================================================
    '/dashboard/resumen': {
      get: {
        tags: ['Dashboard'],
        summary: 'Resumen del dashboard',
        description: 'Obtiene indicadores generales (ventas, pedidos, clientes, etc.) para el panel principal.',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Resumen del dashboard',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Respuesta200',
                },
              },
            },
          },
          401: {
            description: 'No autorizado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Respuesta401',
                },
              },
            },
          },
        },
      },
    },
    '/dashboard/pedidos': {
      get: {
        tags: ['Dashboard'],
        summary: 'Pedidos del dashboard',
        description: 'Obtiene la lista de pedidos recientes para el panel principal.',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Lista de pedidos del dashboard',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Respuesta200',
                },
              },
            },
          },
          401: {
            description: 'No autorizado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Respuesta401',
                },
              },
            },
          },
        },
      },
    },

    // ============================================================
    // USUARIOS
    // ============================================================
    '/usuarios': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar todos los usuarios',
        description: 'Obtiene todos los usuarios del sistema (solo administrador).',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'pagina', schema: { type: 'integer' }, description: 'Número de página' },
          { in: 'query', name: 'limite', schema: { type: 'integer' }, description: 'Elementos por página' },
        ],
        responses: {
          200: {
            description: 'Lista de usuarios',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } },
          },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          403: { description: 'Acceso denegado (requiere admin)' },
        },
      },
      post: {
        tags: ['Usuarios'],
        summary: 'Crear un nuevo usuario',
        description: 'Registra un nuevo usuario en el sistema (solo administrador).',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombres: { type: 'string', example: 'Juan' },
                  apellidos: { type: 'string', example: 'Pérez' },
                  correo: { type: 'string', example: 'juan@empresa.com' },
                  password: { type: 'string', example: '123456' },
                  rol: { type: 'string', example: 'ADMINISTRADOR' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Usuario creado exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          403: { description: 'Acceso denegado (requiere admin)' },
        },
      },
    },
    '/usuarios/{id}': {
      get: {
        tags: ['Usuarios'],
        summary: 'Obtener usuario por ID',
        description: 'Obtiene los datos de un usuario específico (solo administrador).',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del usuario' },
        ],
        responses: {
          200: { description: 'Datos del usuario', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Usuario no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
      put: {
        tags: ['Usuarios'],
        summary: 'Actualizar usuario',
        description: 'Actualiza los datos de un usuario existente (solo administrador).',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del usuario' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombres: { type: 'string' },
                  apellidos: { type: 'string' },
                  correo: { type: 'string' },
                  password: { type: 'string' },
                  rol: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Usuario actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Usuario no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
    },
    '/usuarios/{id}/estado': {
      patch: {
        tags: ['Usuarios'],
        summary: 'Cambiar estado del usuario',
        description: 'Activa o bloquea un usuario (1=activo, 2=bloqueado). Solo administrador.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del usuario' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  estado: { type: 'integer', example: 1, description: '1=activo, 2=bloqueado' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Estado actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          403: { description: 'Acceso denegado (requiere admin)' },
          404: { description: 'Usuario no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
    },

    // ============================================================
    // CLIENTES
    // ============================================================
    '/clientes': {
      get: {
        tags: ['Clientes'],
        summary: 'Listar clientes',
        description: 'Obtiene todos los clientes registrados.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'pagina', schema: { type: 'integer' }, description: 'Número de página' },
          { in: 'query', name: 'limite', schema: { type: 'integer' }, description: 'Elementos por página' },
        ],
        responses: {
          200: { description: 'Lista de clientes', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
      post: {
        tags: ['Clientes'],
        summary: 'Crear cliente',
        description: 'Registra un nuevo cliente.',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', example: 'Cliente Ejemplo' },
                  documento: { type: 'string', example: '12345678' },
                  telefono: { type: 'string', example: '999888777' },
                  direccion: { type: 'string', example: 'Av. Principal 123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Cliente creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
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
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del cliente' },
        ],
        responses: {
          200: { description: 'Datos del cliente', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
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
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del cliente' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  documento: { type: 'string' },
                  telefono: { type: 'string' },
                  direccion: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cliente actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
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
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del cliente' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  estado: { type: 'integer', example: 1, description: '1=activo, 0=inactivo' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Estado actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Cliente no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
    },

    // ============================================================
    // PRODUCTOS
    // ============================================================
    '/productos': {
      get: {
        tags: ['Productos'],
        summary: 'Listar productos',
        description: 'Obtiene todos los productos registrados.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'pagina', schema: { type: 'integer' }, description: 'Número de página' },
          { in: 'query', name: 'limite', schema: { type: 'integer' }, description: 'Elementos por página' },
        ],
        responses: {
          200: { description: 'Lista de productos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
      post: {
        tags: ['Productos'],
        summary: 'Crear producto',
        description: 'Registra un nuevo producto (solo administrador).',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', example: 'Polo' },
                  descripcion: { type: 'string', example: 'Polo de algodón' },
                  precio: { type: 'number', example: 29.99 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Producto creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          403: { description: 'Acceso denegado (requiere admin)' },
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
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del producto' },
        ],
        responses: {
          200: { description: 'Datos del producto', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
      put: {
        tags: ['Productos'],
        summary: 'Actualizar producto',
        description: 'Actualiza los datos de un producto (solo administrador).',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del producto' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  descripcion: { type: 'string' },
                  precio: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Producto actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
    },
    '/productos/{id}/estado': {
      patch: {
        tags: ['Productos'],
        summary: 'Cambiar estado del producto',
        description: 'Activa o desactiva un producto (solo administrador).',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del producto' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  estado: { type: 'integer', example: 1, description: '1=activo, 0=inactivo' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Estado actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          403: { description: 'Acceso denegado (requiere admin)' },
          404: { description: 'Producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
    },

    // ============================================================
    // MATERIALES
    // ============================================================
    '/materiales': {
      get: {
        tags: ['Materiales'],
        summary: 'Listar materiales',
        description: 'Obtiene todos los materiales registrados.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'pagina', schema: { type: 'integer' }, description: 'Número de página' },
          { in: 'query', name: 'limite', schema: { type: 'integer' }, description: 'Elementos por página' },
        ],
        responses: {
          200: { description: 'Lista de materiales', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
      post: {
        tags: ['Materiales'],
        summary: 'Crear material',
        description: 'Registra un nuevo material (solo administrador).',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', example: 'Tela Algodón' },
                  descripcion: { type: 'string', example: 'Tela de algodón premium' },
                  stock: { type: 'number', example: 100 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Material creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          403: { description: 'Acceso denegado (requiere admin)' },
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
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del material' },
        ],
        responses: {
          200: { description: 'Datos del material', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Material no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
      put: {
        tags: ['Materiales'],
        summary: 'Actualizar material',
        description: 'Actualiza los datos de un material (solo administrador).',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del material' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  descripcion: { type: 'string' },
                  stock: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Material actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Material no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
    },
    '/materiales/{id}/estado': {
      patch: {
        tags: ['Materiales'],
        summary: 'Cambiar estado del material',
        description: 'Activa o desactiva un material (solo administrador).',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del material' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  estado: { type: 'integer', example: 1, description: '1=activo, 0=inactivo' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Estado actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          403: { description: 'Acceso denegado (requiere admin)' },
          404: { description: 'Material no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
    },

    // ============================================================
    // PEDIDOS
    // ============================================================
    '/pedidos': {
      get: {
        tags: ['Pedidos'],
        summary: 'Listar pedidos',
        description: 'Obtiene todos los pedidos con paginación y filtros.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'pagina', schema: { type: 'integer' }, description: 'Número de página' },
          { in: 'query', name: 'limite', schema: { type: 'integer' }, description: 'Elementos por página' },
        ],
        responses: {
          200: { description: 'Lista de pedidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
      post: {
        tags: ['Pedidos'],
        summary: 'Crear pedido',
        description: 'Registra un nuevo pedido con sus detalles.',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  clienteId: { type: 'string', example: 'CL001' },
                  detalles: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        productoId: { type: 'string' },
                        cantidad: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Pedido creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
    },
    '/pedidos/entregas': {
      get: {
        tags: ['Pedidos'],
        summary: 'Listar entregas',
        description: 'Obtiene todos los pedidos completados (TERMINADO + ENTREGADO).',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'pagina', schema: { type: 'integer' }, description: 'Número de página' },
          { in: 'query', name: 'limite', schema: { type: 'integer' }, description: 'Elementos por página' },
        ],
        responses: {
          200: { description: 'Lista de entregas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
    },
    '/pedidos/{id}': {
      get: {
        tags: ['Pedidos'],
        summary: 'Obtener pedido por ID',
        description: 'Obtiene los datos de un pedido específico.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del pedido' },
        ],
        responses: {
          200: { description: 'Datos del pedido', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Pedido no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
      put: {
        tags: ['Pedidos'],
        summary: 'Actualizar pedido',
        description: 'Actualiza los datos generales de un pedido.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del pedido' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  clienteId: { type: 'string' },
                  fechaEntrega: { type: 'string', format: 'date' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Pedido actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Pedido no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
    },
    '/pedidos/{id}/cancelar': {
      patch: {
        tags: ['Pedidos'],
        summary: 'Cancelar pedido',
        description: 'Cambia el estado del pedido a cancelado.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del pedido' },
        ],
        responses: {
          200: { description: 'Pedido cancelado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Pedido no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
    },
    '/pedidos/{id}/entregar': {
      patch: {
        tags: ['Pedidos'],
        summary: 'Entregar pedido',
        description: 'Cambia el estado del pedido de TERMINADO a ENTREGADO.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del pedido' },
        ],
        responses: {
          200: { description: 'Pedido entregado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Pedido no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
    },
    '/pedidos/{id}/detalles': {
      post: {
        tags: ['Pedidos'],
        summary: 'Agregar detalle a pedido',
        description: 'Agrega una línea de detalle a un pedido existente.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del pedido' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  productoId: { type: 'string' },
                  cantidad: { type: 'integer' },
                  precioUnitario: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Detalle agregado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
    },
    '/pedidos/{id}/detalles/{id_detalle}': {
      delete: {
        tags: ['Pedidos'],
        summary: 'Eliminar detalle de pedido',
        description: 'Elimina una línea de detalle de un pedido.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del pedido' },
          { in: 'path', name: 'id_detalle', required: true, schema: { type: 'string' }, description: 'ID del detalle' },
        ],
        responses: {
          200: { description: 'Detalle eliminado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Detalle no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
      patch: {
        tags: ['Pedidos'],
        summary: 'Actualizar detalle de pedido',
        description: 'Actualiza una línea de detalle existente.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del pedido' },
          { in: 'path', name: 'id_detalle', required: true, schema: { type: 'string' }, description: 'ID del detalle' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cantidad: { type: 'integer' },
                  precioUnitario: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Detalle actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
    },

    // ============================================================
    // PRODUCCIÓN (dentro de pedidos)
    // ============================================================
    '/pedidos/{id}/detalles/{id_detalle}/produccion': {
      post: {
        tags: ['Producción'],
        summary: 'Registrar producción de un detalle',
        description: 'Registra la producción asociada a un detalle de pedido.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del pedido' },
          { in: 'path', name: 'id_detalle', required: true, schema: { type: 'string' }, description: 'ID del detalle' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cantidadProducida: { type: 'integer', example: 50 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Producción registrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
    },
    '/pedidos/{id}/detalles/{id_detalle}/produccion/{id_produccion}': {
      patch: {
        tags: ['Producción'],
        summary: 'Actualizar producción',
        description: 'Actualiza los datos de una producción existente.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del pedido' },
          { in: 'path', name: 'id_detalle', required: true, schema: { type: 'string' }, description: 'ID del detalle' },
          { in: 'path', name: 'id_produccion', required: true, schema: { type: 'string' }, description: 'ID de la producción' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cantidadProducida: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Producción actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Producción no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
      delete: {
        tags: ['Producción'],
        summary: 'Eliminar producción',
        description: 'Elimina un registro de producción.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del pedido' },
          { in: 'path', name: 'id_detalle', required: true, schema: { type: 'string' }, description: 'ID del detalle' },
          { in: 'path', name: 'id_produccion', required: true, schema: { type: 'string' }, description: 'ID de la producción' },
        ],
        responses: {
          200: { description: 'Producción eliminada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Producción no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
    },

    // ============================================================
    // VENTAS
    // ============================================================
    '/ventas': {
      get: {
        tags: ['Ventas'],
        summary: 'Listar ventas',
        description: 'Obtiene todas las ventas con paginación y filtros.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'pagina', schema: { type: 'integer' }, description: 'Número de página' },
          { in: 'query', name: 'limite', schema: { type: 'integer' }, description: 'Elementos por página' },
          { in: 'query', name: 'clienteId', schema: { type: 'string' }, description: 'Filtrar por cliente' },
          { in: 'query', name: 'fechaInicio', schema: { type: 'string', format: 'date' }, description: 'Filtro fecha inicio' },
          { in: 'query', name: 'fechaFin', schema: { type: 'string', format: 'date' }, description: 'Filtro fecha fin' },
        ],
        responses: {
          200: { description: 'Lista de ventas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
      post: {
        tags: ['Ventas'],
        summary: 'Registrar venta',
        description: 'Registra una nueva venta.',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Venta',
              },
            },
          },
        },
        responses: {
          201: { description: 'Venta registrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
    },
    '/ventas/{id}': {
      get: {
        tags: ['Ventas'],
        summary: 'Obtener venta por ID',
        description: 'Obtiene los datos de una venta específica.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID de la venta' },
        ],
        responses: {
          200: { description: 'Datos de la venta', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Venta no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
      patch: {
        tags: ['Ventas'],
        summary: 'Actualizar venta',
        description: 'Actualiza datos de una venta (descuento, fecha límite de pago).',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID de la venta' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  descuento: { type: 'number', example: 10 },
                  fechaLimitePago: { type: 'string', format: 'date', example: '2026-06-30' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Venta actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Venta no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
      delete: {
        tags: ['Ventas'],
        summary: 'Anular venta',
        description: 'Anula una venta existente.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID de la venta' },
        ],
        responses: {
          200: { description: 'Venta anulada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Venta no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
    },
    '/ventas/{id}/detalles': {
      post: {
        tags: ['Ventas'],
        summary: 'Agregar detalle a venta',
        description: 'Agrega un producto como detalle a una venta existente.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID de la venta' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  productoId: { type: 'string' },
                  cantidad: { type: 'integer' },
                  precioUnitario: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Detalle agregado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
    },
    '/ventas/{id}/detalles/{id_detalle}': {
      delete: {
        tags: ['Ventas'],
        summary: 'Eliminar detalle de venta',
        description: 'Elimina un detalle de una venta.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID de la venta' },
          { in: 'path', name: 'id_detalle', required: true, schema: { type: 'string' }, description: 'ID del detalle' },
        ],
        responses: {
          200: { description: 'Detalle eliminado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Detalle no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
    },

    // ============================================================
    // FACTURAS (dentro de ventas)
    // ============================================================
    '/ventas/{id}/factura': {
      get: {
        tags: ['Ventas'],
        summary: 'Obtener factura',
        description: 'Obtiene los datos de la factura asociada a una venta.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID de la venta' },
        ],
        responses: {
          200: { description: 'Datos de la factura', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Factura no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
      post: {
        tags: ['Ventas'],
        summary: 'Crear factura',
        description: 'Genera una factura para una venta.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID de la venta' },
        ],
        responses: {
          201: { description: 'Factura creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
    },
    '/ventas/{id}/factura/{id_factura}/anular': {
      patch: {
        tags: ['Ventas'],
        summary: 'Anular factura',
        description: 'Anula una factura existente.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID de la venta' },
          { in: 'path', name: 'id_factura', required: true, schema: { type: 'string' }, description: 'ID de la factura' },
        ],
        responses: {
          200: { description: 'Factura anulada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Factura no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
    },
    '/ventas/{id}/factura/pdf': {
      get: {
        tags: ['Ventas'],
        summary: 'Descargar PDF de factura',
        description: 'Genera y descarga el PDF de una factura.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID de la venta' },
        ],
        responses: {
          200: { description: 'Archivo PDF', content: { 'application/pdf': {} } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Factura no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
    },

    // ============================================================
    // REPORTES DE VENTAS
    // ============================================================
    '/ventas/reportes/mensual': {
      get: {
        tags: ['Reportes'],
        summary: 'Reporte mensual de ventas',
        description: 'Obtiene el reporte de ventas de un mes y año específicos.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'mes', required: true, schema: { type: 'integer', example: 7 }, description: 'Número del mes (1-12)' },
          { in: 'query', name: 'anio', required: true, schema: { type: 'integer', example: 2026 }, description: 'Año' },
        ],
        responses: {
          200: { description: 'Reporte mensual', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Parámetros inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
    },
    '/ventas/reportes/periodo': {
      get: {
        tags: ['Reportes'],
        summary: 'Reporte de ventas por período',
        description: 'Obtiene el reporte de ventas entre dos fechas.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'fechaInicio', required: true, schema: { type: 'string', format: 'date', example: '2026-05-01' }, description: 'Fecha de inicio' },
          { in: 'query', name: 'fechaFin', required: true, schema: { type: 'string', format: 'date', example: '2026-05-31' }, description: 'Fecha de fin' },
        ],
        responses: {
          200: { description: 'Reporte por período', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Parámetros inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
    },
    '/ventas/reportes/mensual/pdf': {
      get: {
        tags: ['Reportes'],
        summary: 'Exportar reporte mensual a PDF',
        description: 'Genera y descarga un archivo PDF con el reporte mensual de ventas.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'mes', required: true, schema: { type: 'integer', example: 7 }, description: 'Número del mes (1-12)' },
          { in: 'query', name: 'anio', required: true, schema: { type: 'integer', example: 2026 }, description: 'Año' },
        ],
        responses: {
          200: { description: 'Archivo PDF del reporte mensual', content: { 'application/pdf': {} } },
          400: { description: 'Parámetros inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
    },
    '/ventas/reportes/periodo/pdf': {
      get: {
        tags: ['Reportes'],
        summary: 'Exportar reporte por período a PDF',
        description: 'Genera y descarga un archivo PDF con el reporte de ventas por período.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'fechaInicio', required: true, schema: { type: 'string', format: 'date', example: '2026-05-01' }, description: 'Fecha de inicio' },
          { in: 'query', name: 'fechaFin', required: true, schema: { type: 'string', format: 'date', example: '2026-05-31' }, description: 'Fecha de fin' },
        ],
        responses: {
          200: { description: 'Archivo PDF del reporte por período', content: { 'application/pdf': {} } },
          400: { description: 'Parámetros inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
    },
    '/ventas/reportes/mensual/excel': {
      get: {
        tags: ['Reportes'],
        summary: 'Exportar reporte mensual a Excel',
        description: 'Genera y descarga un archivo Excel con el reporte mensual de ventas.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'mes', required: true, schema: { type: 'integer', example: 7 }, description: 'Número del mes (1-12)' },
          { in: 'query', name: 'anio', required: true, schema: { type: 'integer', example: 2026 }, description: 'Año' },
        ],
        responses: {
          200: { description: 'Archivo Excel del reporte mensual' },
          400: { description: 'Parámetros inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
    },
    '/ventas/reportes/periodo/excel': {
      get: {
        tags: ['Reportes'],
        summary: 'Exportar reporte por período a Excel',
        description: 'Genera y descarga un archivo Excel con el reporte de ventas por período.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'fechaInicio', required: true, schema: { type: 'string', format: 'date', example: '2026-05-01' }, description: 'Fecha de inicio' },
          { in: 'query', name: 'fechaFin', required: true, schema: { type: 'string', format: 'date', example: '2026-05-31' }, description: 'Fecha de fin' },
        ],
        responses: {
          200: { description: 'Archivo Excel del reporte por período' },
          400: { description: 'Parámetros inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
    },

    // ============================================================
    // PAGOS
    // ============================================================
    '/pagos': {
      get: {
        tags: ['Pagos'],
        summary: 'Listar pagos',
        description: 'Obtiene todos los pagos registrados.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'pagina', schema: { type: 'integer' }, description: 'Número de página' },
          { in: 'query', name: 'limite', schema: { type: 'integer' }, description: 'Elementos por página' },
        ],
        responses: {
          200: { description: 'Lista de pagos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
      post: {
        tags: ['Pagos'],
        summary: 'Registrar pago',
        description: 'Registra un nuevo pago asociado a una venta.',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  ventaId: { type: 'string', example: 'V001' },
                  monto: { type: 'number', example: 150.00 },
                  metodo: { type: 'string', example: 'EFECTIVO' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Pago registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
    },
    '/pagos/{id}/rechazar': {
      patch: {
        tags: ['Pagos'],
        summary: 'Rechazar pago',
        description: 'Rechaza un pago pendiente.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID del pago' },
        ],
        responses: {
          200: { description: 'Pago rechazado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
          404: { description: 'Pago no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
        },
      },
    },

    // ============================================================
    // ALERTAS
    // ============================================================
    '/alertas': {
      get: {
        tags: ['Alertas'],
        summary: 'Listar alertas',
        description: 'Obtiene todas las alertas con paginación y filtros.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'pagina', schema: { type: 'integer' }, description: 'Número de página' },
          { in: 'query', name: 'limite', schema: { type: 'integer' }, description: 'Elementos por página' },
          { in: 'query', name: 'estado', schema: { type: 'string' }, description: 'Filtrar por estado' },
          { in: 'query', name: 'tipo', schema: { type: 'string' }, description: 'Filtrar por tipo' },
          { in: 'query', name: 'categoria', schema: { type: 'string' }, description: 'Filtrar por categoría' },
        ],
        responses: {
          200: { description: 'Lista de alertas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta200' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        },
      },
    },
  },
  components: {
    schemas: {
      // ============================================================
      // ESQUEMAS PRINCIPALES
      // ============================================================
      Login: {
        type: 'object',
        required: ['correo', 'password'],
        properties: {
          correo: {
            type: 'string',
            format: 'email',
            example: 'admin@empresa.com',
            description: 'Correo electrónico del usuario',
          },
          password: {
            type: 'string',
            format: 'password',
            example: '123456',
            description: 'Contraseña del usuario',
          },
        },
      },
      Venta: {
        type: 'object',
        required: ['clienteId'],
        properties: {
          clienteId: {
            type: 'string',
            example: 'CL001',
            description: 'ID del cliente',
          },
          productos: {
            type: 'array',
            description: 'Lista de productos en la venta',
            items: {
              type: 'object',
              properties: {
                productoId: { type: 'string', example: 'P001' },
                cantidad: { type: 'integer', example: 2 },
                precioUnitario: { type: 'number', example: 25.00 },
              },
            },
          },
          descuento: {
            type: 'number',
            example: 0,
            description: 'Descuento aplicado a la venta',
          },
          fechaLimitePago: {
            type: 'string',
            format: 'date',
            example: '2026-07-30',
            description: 'Fecha límite para el pago',
          },
        },
      },
      ReporteMensual: {
        type: 'object',
        required: ['mes', 'anio'],
        properties: {
          mes: {
            type: 'integer',
            example: 7,
            description: 'Número del mes (1-12)',
          },
          anio: {
            type: 'integer',
            example: 2026,
            description: 'Año del reporte',
          },
        },
      },
      ReportePeriodo: {
        type: 'object',
        required: ['fechaInicio', 'fechaFin'],
        properties: {
          fechaInicio: {
            type: 'string',
            format: 'date',
            example: '2026-05-01',
            description: 'Fecha de inicio del período',
          },
          fechaFin: {
            type: 'string',
            format: 'date',
            example: '2026-05-31',
            description: 'Fecha de fin del período',
          },
        },
      },
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
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
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
