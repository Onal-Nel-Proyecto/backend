import { jest } from '@jest/globals';
import request from 'supertest';

// =====================================================
// 1. MOCKS (Antes de cualquier import real)
// =====================================================

// Mock del middleware de autenticación para evitar validar JWT
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

// Mock completo del service de clientes (evita cualquier acceso a BD)
jest.unstable_mockModule('../services/clientes.service.js', () => ({
  obtenerClientes: jest.fn(),
  obtenerClientePorId: jest.fn(),
  crearCliente: jest.fn(),
  changeStatusServices: jest.fn(),
  actualizarCliente: jest.fn()
}));

// =====================================================
// 2. IMPORTS (después de los mocks)
// =====================================================

const { default: app } = await import('../app.js');

const {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  changeStatusServices,
  actualizarCliente
} = await import('../services/clientes.service.js');

// =====================================================
// 3. DATOS DE PRUEBA
// =====================================================

const clienteEjemplo = {
  cliente_id: 'CLIabc123def4567',
  cliente_nombre: 'Juan',
  cliente_apellido: 'Pérez',
  cliente_email: 'juan@example.com',
  cliente_direccion: 'Av. Siempre Viva 123',
  estado: 'activo',
  fecha_creacion: '2025-01-15T10:00:00.000Z'
};

const clienteArrayEjemplo = [clienteEjemplo];

// =====================================================
// 4. TESTS: GET /clientes
// =====================================================

describe('GET /clientes', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe retornar lista paginada de clientes con código 200', async () => {
    obtenerClientes.mockResolvedValue({
      meta: { paginas_totales: 1, pagina_actual: 1, total: 1, limite: 15 },
      data: clienteArrayEjemplo
    });

    const response = await request(app).get('/clientes');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('meta');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveLength(1);
    expect(obtenerClientes).toHaveBeenCalledTimes(1);
  });

  test('debe aceptar parámetros de paginación', async () => {
    obtenerClientes.mockResolvedValue({
      meta: { paginas_totales: 3, pagina_actual: 2, total: 30, limite: 10 },
      data: []
    });

    const response = await request(app).get('/clientes?pagina=2&limite=10');

    expect(response.status).toBe(200);
    expect(obtenerClientes).toHaveBeenCalledWith('2', '10', { search: undefined });
  });

  test('debe retornar 500 si el service falla', async () => {
    obtenerClientes.mockRejectedValue(new Error('Error de BD'));

    const response = await request(app).get('/clientes');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 5. TESTS: POST /clientes
// =====================================================

describe('POST /clientes', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const clienteValido = {
    cliente_nombre: 'María',
    cliente_apellido: 'García',
    cliente_email: 'maria@example.com',
    cliente_direccion: 'Calle 456',
    telefono: [{ numero_telefono: '1234567890' }]
  };

  test('debe crear un cliente y retornar 201', async () => {
    crearCliente.mockResolvedValue({
      ...clienteEjemplo,
      cliente_nombre: 'María',
      cliente_apellido: 'García',
      cliente_email: 'maria@example.com'
    });

    const response = await request(app)
      .post('/clientes')
      .send(clienteValido);

    expect(response.status).toBe(201);
    expect(crearCliente).toHaveBeenCalledTimes(1);
  });

  test('debe retornar 400 si falta el nombre', async () => {
    const response = await request(app)
      .post('/clientes')
      .send({
        cliente_apellido: 'García',
        cliente_email: 'maria@example.com'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toHaveProperty('cliente_nombre');
  });

  test('debe retornar 400 si falta el apellido', async () => {
    const response = await request(app)
      .post('/clientes')
      .send({
        cliente_nombre: 'María',
        cliente_email: 'maria@example.com'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('cliente_apellido');
  });

  test('debe retornar 400 si el email es inválido', async () => {
    const response = await request(app)
      .post('/clientes')
      .send({
        cliente_nombre: 'María',
        cliente_apellido: 'García',
        cliente_email: 'email-invalido'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('cliente_email');
  });

  test('debe retornar 400 si el teléfono no es un arreglo', async () => {
    const response = await request(app)
      .post('/clientes')
      .send({
        ...clienteValido,
        telefono: 'no-soy-array'
      });

    expect(response.status).toBe(400);
  });

  test('debe retornar 400 si el usuario relacionado no existe', async () => {
    crearCliente.mockRejectedValue(new Error('El usuario US999 no existe'));

    const response = await request(app)
      .post('/clientes')
      .send(clienteValido);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ status: false, error: 'El usuario US999 no existe' });
  });

  test('debe retornar 500 si el service lanza error', async () => {
    crearCliente.mockRejectedValue(new Error('Error interno'));

    const response = await request(app)
      .post('/clientes')
      .send(clienteValido);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 6. TESTS: GET /clientes/:id
// =====================================================

describe('GET /clientes/:id', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe retornar un cliente por ID con código 200', async () => {
    obtenerClientePorId.mockResolvedValue(clienteEjemplo);

    const response = await request(app).get('/clientes/CLIabc123def4567');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(clienteEjemplo);
    expect(obtenerClientePorId).toHaveBeenCalledWith('CLIabc123def4567');
  });

  test('debe retornar 404 si el cliente no existe', async () => {
    obtenerClientePorId.mockResolvedValue(null);

    const response = await request(app).get('/clientes/IDINEXISTENTE');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ status: false, error: 'Cliente no encontrado' });
  });

  test('debe retornar 500 si el service falla', async () => {
    obtenerClientePorId.mockRejectedValue(new Error('Error de consulta'));

    const response = await request(app).get('/clientes/CLI999');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 7. TESTS: PUT /clientes/:id
// =====================================================

describe('PUT /clientes/:id', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const datosActualizacion = {
    cliente_nombre: 'Juan Carlos',
    cliente_apellido: 'Pérez López',
    cliente_email: 'juancarlos@example.com',
    cliente_direccion: 'Av. Nueva 789'
  };

  test('debe actualizar un cliente y retornar 200', async () => {
    actualizarCliente.mockResolvedValue({
      status: true,
      msg: 'Se actualizó con éxito los datos del cliente'
    });

    const response = await request(app)
      .put('/clientes/CLIabc123def4567')
      .send(datosActualizacion);

    expect(response.status).toBe(200);
    expect(actualizarCliente).toHaveBeenCalledWith(
      'CLIabc123def4567',
      expect.objectContaining({ cliente_nombre: 'Juan Carlos' })
    );
  });

  test('debe retornar 400 si falta el nombre', async () => {
    const response = await request(app)
      .put('/clientes/CLIabc123def4567')
      .send({
        cliente_apellido: 'Pérez López',
        cliente_email: 'juancarlos@example.com'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('cliente_nombre');
  });

  test('debe retornar 404 si el cliente a actualizar no existe', async () => {
    actualizarCliente.mockRejectedValue(new Error('Cliente no encontrado'));

    const response = await request(app)
      .put('/clientes/CLI999')
      .send(datosActualizacion);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ status: false, error: 'Cliente no encontrado' });
  });

  test('debe retornar 500 si el service falla', async () => {
    actualizarCliente.mockRejectedValue(new Error('Error inesperado'));

    const response = await request(app)
      .put('/clientes/CLIabc123def4567')
      .send(datosActualizacion);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 8. TESTS: PATCH /clientes/:id/estado
// =====================================================

describe('PATCH /clientes/:id/estado', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe cambiar el estado a 1 (activo) y retornar 200', async () => {
    changeStatusServices.mockResolvedValue(undefined);

    const response = await request(app)
      .patch('/clientes/CLIabc123def4567/estado')
      .send({ estado: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: true,
      msg: 'El cliente fue eliminado'
    });
  });

  test('debe cambiar el estado a 2 (inactivo) y retornar 200', async () => {
    changeStatusServices.mockResolvedValue(undefined);

    const response = await request(app)
      .patch('/clientes/CLIabc123def4567/estado')
      .send({ estado: 2 });

    expect(response.status).toBe(200);
  });

  test('debe retornar 400 si no se envía el campo estado', async () => {
    const response = await request(app)
      .patch('/clientes/CLIabc123def4567/estado')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('estado');
  });

  test('debe retornar 400 si el estado no es 1 ni 2', async () => {
    const response = await request(app)
      .patch('/clientes/CLIabc123def4567/estado')
      .send({ estado: 99 });

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('estado');
  });

  test('debe retornar 400 si el cliente no existe al cambiar estado', async () => {
    changeStatusServices.mockRejectedValue(new Error('El cliente CLI999 no existe'));

    const response = await request(app)
      .patch('/clientes/CLI999/estado')
      .send({ estado: 2 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ status: false, error: 'El cliente CLI999 no existe' });
  });

  test('debe retornar 500 si el cliente ya estaba eliminado (error no manejado)', async () => {
    changeStatusServices.mockRejectedValue(
      new Error('El cliente ya se encuentra eliminado')
    );

    const response = await request(app)
      .patch('/clientes/CLIabc123def4567/estado')
      .send({ estado: 2 });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });

  test('debe retornar 500 si el service falla', async () => {
    changeStatusServices.mockRejectedValue(new Error('Error inesperado'));

    const response = await request(app)
      .patch('/clientes/CLIabc123def4567/estado')
      .send({ estado: 2 });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});
