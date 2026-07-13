export const authPaths = {
  '/auth/login': {
    post: {
      tags: ['Autenticación'],
      summary: 'Iniciar sesión',
      description: 'Autentica un usuario y devuelve un token JWT en cookie.',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Login' } } },
      },
      responses: {
        200: { description: 'Inicio de sesión exitoso' },
        400: { description: 'Credenciales inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
  },
  '/auth/logout': {
    post: {
      tags: ['Autenticación'],
      summary: 'Cerrar sesión',
      description: 'Limpia las cookies de autenticación.',
      responses: {
        200: { description: 'Sesión cerrada correctamente' },
      },
    },
  },
  '/auth/refresh': {
    post: {
      tags: ['Autenticación'],
      summary: 'Refrescar token',
      description: 'Refresca el token de acceso usando el refresh token.',
      responses: {
        200: { description: 'Token renovado exitosamente' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
  },
  '/auth/perfil': {
    get: {
      tags: ['Autenticación'],
      summary: 'Obtener perfil',
      description: 'Obtiene los datos del usuario autenticado.',
      security: [{ cookieAuth: [] }],
      responses: {
        200: { description: 'Datos del perfil' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
  },
};

export const authSchemas = {
  Login: {
    type: 'object',
    required: ['correo', 'contraseña'],
    properties: {
      correo: { type: 'string', format: 'email', example: 'admin@onalnel.com' },
      contraseña: { type: 'string', format: 'password', example: '123456' },
    },
  },
};
