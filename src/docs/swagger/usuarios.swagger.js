export const usuariosPaths = {
  '/usuarios': {
    get: {
      tags: ['Usuarios'],
      summary: 'Listar usuarios',
      description: 'Obtiene todos los usuarios registrados. Solo administradores.',
      security: [{ cookieAuth: [] }],
      responses: {
        200: { description: 'Lista de usuarios' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        403: { description: 'Acceso denegado' },
      },
    },
    post: {
      tags: ['Usuarios'],
      summary: 'Crear usuario',
      description: 'Registra un nuevo usuario en el sistema. Solo administradores.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CrearUsuario' } } },
      },
      responses: {
        201: { description: 'Usuario creado exitosamente' },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        403: { description: 'Acceso denegado' },
      },
    },
  },
  '/usuarios/{id}': {
    get: {
      tags: ['Usuarios'],
      summary: 'Obtener usuario por ID',
      description: 'Obtiene los datos de un usuario específico. Solo administradores.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del usuario' },
      ],
      responses: {
        200: { description: 'Datos del usuario' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        403: { description: 'Acceso denegado' },
        404: { description: 'Usuario no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
      },
    },
    put: {
      tags: ['Usuarios'],
      summary: 'Actualizar usuario',
      description: 'Actualiza los datos de un usuario. Solo administradores.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del usuario' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ActualizarUsuario' } } },
      },
      responses: {
        200: { description: 'Usuario actualizado exitosamente' },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        403: { description: 'Acceso denegado' },
        404: { description: 'Usuario no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
      },
    },
  },
  '/usuarios/{id}/estado': {
    patch: {
      tags: ['Usuarios'],
      summary: 'Cambiar estado del usuario',
      description: 'Activa (1) o bloquea (2) un usuario. Solo administradores.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del usuario' },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                estado: { type: 'integer', enum: [1, 2], example: 2 },
              },
              required: ['estado'],
            },
          },
        },
      },
      responses: {
        200: { description: 'Estado actualizado exitosamente' },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        403: { description: 'Acceso denegado' },
        404: { description: 'Usuario no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
      },
    },
  },
  '/usuarios/{id}/password': {
    patch: {
      tags: ['Usuarios'],
      summary: 'Cambiar contraseña',
      description: 'Actualiza la contraseña de un usuario. Admin o el propio usuario.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del usuario' },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                password_actual: { type: 'string', format: 'password', example: 'miClaveActual' },
                password_nuevo: { type: 'string', format: 'password', example: 'miNuevaClave' },
              },
              required: ['password_actual', 'password_nuevo'],
            },
          },
        },
      },
      responses: {
        200: { description: 'Contraseña actualizada exitosamente' },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
        404: { description: 'Usuario no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta404' } } } },
      },
    },
  },
};

export const usuariosSchemas = {
  CrearUsuario: {
    type: 'object',
    required: ['id', 'nombres', 'apellidos', 'correo', 'password', 'rolId'],
    properties: {
      id: { type: 'string', example: 'US001' },
      nombres: { type: 'string', example: 'Carlos' },
      apellidos: { type: 'string', example: 'Mendoza' },
      telefono: { type: 'string', example: '3001234567' },
      correo: { type: 'string', format: 'email', example: 'carlos@onalnel.com' },
      password: { type: 'string', format: 'password', example: '123456' },
      rolId: { type: 'integer', example: 1 },
      supervisorId: { type: 'string', example: 'US001' },
    },
  },
  ActualizarUsuario: {
    type: 'object',
    properties: {
      nombres: { type: 'string', example: 'Carlos Andrés' },
      apellidos: { type: 'string', example: 'Mendoza López' },
      telefono: { type: 'string', example: '3007654321' },
      correo: { type: 'string', format: 'email', example: 'carlos.m@onalnel.com' },
      rolId: { type: 'integer', example: 2 },
      supervisorId: { type: 'string', example: 'US002' },
    },
  },
};
