import { jest } from '@jest/globals';
import request from 'supertest';

// =====================================================
// Silenciar console.error en tests esperados
// =====================================================
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});

// =====================================================
// 1. MOCKS (antes de los imports)
// =====================================================

jest.unstable_mockModule('../middleware/auth.middleware.js', () => ({
  authValidator: (req, _res, next) => {
    req.user = {
      user_id: 'US001',
      nombres: 'Admin',
      apellidos: 'Test',
      rol: 'ADMINISTRADOR'
    };
    next();
  },
  isAdmin: (req, _res, next) => next()
}));

jest.unstable_mockModule('../services/user.services.js', () => ({
  getAllUsersService: jest.fn(),
  getUserByIdService: jest.fn(),
  createUserService: jest.fn(),
  updateUserService: jest.fn(),
  changeUserStatusService: jest.fn()
}));

// =====================================================
// 2. IMPORTS
// =====================================================

const { default: app } = await import('../app.js');

const userService = await import('../services/user.services.js');

// =====================================================
// 3. DATOS DE PRUEBA
// =====================================================

const usuarioEjemplo = {
  id: '12345678',
  nombres: 'Carlos',
  apellidos: 'Gómez',
  telefono: '3001234567',
  correo: 'carlos@example.com',
  estado: 1,
  fechaRegistro: '2025-01-15T10:00:00.000Z',
  rol: 'ADMINISTRADOR',
  supervisor: null
};

const usuariosArray = [usuarioEjemplo];

// =====================================================
// 4. TESTS: GET /usuarios
// =====================================================

describe('GET /usuarios', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe retornar lista de usuarios con 200', async () => {
    userService.getAllUsersService.mockResolvedValue({ data: usuariosArray });

    const res = await request(app).get('/usuarios');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    userService.getAllUsersService.mockRejectedValue(new Error('Error BD'));

    const res = await request(app).get('/usuarios');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 5. TESTS: GET /usuarios/:id
// =====================================================

describe('GET /usuarios/:id', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe retornar un usuario por ID con 200', async () => {
    userService.getUserByIdService.mockResolvedValue({ data: usuarioEjemplo });

    const res = await request(app).get('/usuarios/12345678');

    expect(res.status).toBe(200);
    expect(res.body.nombres).toBe('Carlos');
  });

  test('debe retornar 404 si el usuario no existe', async () => {
    userService.getUserByIdService.mockResolvedValue({
      err: 'Usuario no encontrado',
      errorCode: 404
    });

    const res = await request(app).get('/usuarios/INEXISTENTE');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, error: 'Usuario no encontrado' });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    userService.getUserByIdService.mockRejectedValue(new Error('Error'));

    const res = await request(app).get('/usuarios/12345678');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 6. TESTS: POST /usuarios
// =====================================================

describe('POST /usuarios', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  const usuarioValido = {
    id: '12345678',
    nombres: 'Carlos',
    apellidos: 'Gómez',
    telefono: '3001234567',
    correo: 'carlos@example.com',
    password: 'secreta123',
    rolId: 1
  };

  test('debe crear un usuario y retornar 201', async () => {
    userService.createUserService.mockResolvedValue({
      msg: 'Usuario creado correctamente'
    });

    const res = await request(app)
      .post('/usuarios')
      .send(usuarioValido);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ msg: 'Usuario creado correctamente' });
  });

  test('debe retornar 400 si falta el campo id', async () => {
    const res = await request(app)
      .post('/usuarios')
      .send({ ...usuarioValido, id: undefined });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('id');
  });

  test('debe retornar 400 si el id no es numérico', async () => {
    const res = await request(app)
      .post('/usuarios')
      .send({ ...usuarioValido, id: 'ABCDEF' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('id');
  });

  test('debe retornar 400 si el correo es inválido', async () => {
    const res = await request(app)
      .post('/usuarios')
      .send({ ...usuarioValido, correo: 'correo-invalido' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('correo');
  });

  test('debe retornar 400 si la contraseña es muy corta', async () => {
    const res = await request(app)
      .post('/usuarios')
      .send({ ...usuarioValido, password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('password');
  });

  test('debe retornar error del servicio (correo duplicado)', async () => {
    userService.createUserService.mockResolvedValue({
      err: 'El correo ya está registrado',
      errorCode: 409
    });

    const res = await request(app)
      .post('/usuarios')
      .send(usuarioValido);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ success: false, error: 'El correo ya está registrado' });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    userService.createUserService.mockRejectedValue(new Error('Error crítico'));

    const res = await request(app)
      .post('/usuarios')
      .send(usuarioValido);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 7. TESTS: PUT /usuarios/:id
// =====================================================

describe('PUT /usuarios/:id', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  const datosActualizacion = {
    nombres: 'Carlos Andrés',
    apellidos: 'Gómez López',
    telefono: '3009876543',
    correo: 'carlos.nuevo@example.com',
    rolId: 2
  };

  test('debe actualizar un usuario y retornar 200', async () => {
    userService.updateUserService.mockResolvedValue({
      msg: 'Usuario actualizado correctamente'
    });

    const res = await request(app)
      .put('/usuarios/12345678')
      .send(datosActualizacion);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ msg: 'Usuario actualizado correctamente' });
  });

  test('debe retornar 404 si el usuario no existe', async () => {
    userService.updateUserService.mockResolvedValue({
      err: 'Usuario no encontrado',
      errorCode: 404
    });

    const res = await request(app)
      .put('/usuarios/INEXISTENTE')
      .send(datosActualizacion);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, error: 'Usuario no encontrado' });
  });

  test('debe retornar 409 si el correo ya está en uso', async () => {
    userService.updateUserService.mockResolvedValue({
      err: 'El correo ya está en uso por otro usuario',
      errorCode: 409
    });

    const res = await request(app)
      .put('/usuarios/12345678')
      .send(datosActualizacion);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      success: false,
      error: 'El correo ya está en uso por otro usuario'
    });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    userService.updateUserService.mockRejectedValue(new Error('Error'));

    const res = await request(app)
      .put('/usuarios/12345678')
      .send(datosActualizacion);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 8. TESTS: PATCH /usuarios/:id/estado
// =====================================================

describe('PATCH /usuarios/:id/estado', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe bloquear usuario (estado=2) y retornar 200', async () => {
    userService.changeUserStatusService.mockResolvedValue({
      msg: 'Usuario bloqueado correctamente'
    });

    const res = await request(app)
      .patch('/usuarios/12345678/estado')
      .send({ estado: 2 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ msg: 'Usuario bloqueado correctamente' });
  });

  test('debe activar usuario (estado=1) y retornar 200', async () => {
    userService.changeUserStatusService.mockResolvedValue({
      msg: 'Usuario activado correctamente'
    });

    const res = await request(app)
      .patch('/usuarios/12345678/estado')
      .send({ estado: 1 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ msg: 'Usuario activado correctamente' });
  });

  test('debe retornar 400 si falta el campo estado', async () => {
    const res = await request(app)
      .patch('/usuarios/12345678/estado')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('estado');
  });

  test('debe retornar 400 si el estado no es 1 ni 2', async () => {
    const res = await request(app)
      .patch('/usuarios/12345678/estado')
      .send({ estado: 99 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('estado');
  });

  test('debe retornar 404 si el usuario no existe', async () => {
    userService.changeUserStatusService.mockResolvedValue({
      err: 'Usuario no encontrado',
      errorCode: 404
    });

    const res = await request(app)
      .patch('/usuarios/INEXISTENTE/estado')
      .send({ estado: 2 });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, error: 'Usuario no encontrado' });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    userService.changeUserStatusService.mockRejectedValue(new Error('Error'));

    const res = await request(app)
      .patch('/usuarios/12345678/estado')
      .send({ estado: 2 });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, error: 'Error interno del servidor' });
  });
});
