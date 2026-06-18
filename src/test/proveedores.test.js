import { jest } from '@jest/globals';
import request from 'supertest';

// =====================================================
// 1. MOCKS (Antes de cualquier import real)
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
  isAdmin: (req, _res, next) => next(),
  isAdminOrSelf: (req, _res, next) => next()
}));

jest.unstable_mockModule('../services/proveedores.service.js', () => ({
  obtenerProveedores: jest.fn(),
  obtenerProveedorPorId: jest.fn(),
  crearProveedor: jest.fn(),
  actualizarProveedor: jest.fn(),
  deshabilitarProveedor: jest.fn()
}));

// =====================================================
// 2. IMPORTS
// =====================================================

const { default: app } = await import('../app.js');

const {
  obtenerProveedores,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  deshabilitarProveedor
} = await import('../services/proveedores.service.js');

// =====================================================
// 3. DATOS DE PRUEBA
// =====================================================

const proveedorEjemplo = {
  prov_id: 'PRVabc123def4567',
  prov_nombre: 'Distribuidora Textil SA',
  prov_telefono: '1234567890',
  prov_correo: 'contacto@distribuidora.com',
  prov_direccion: 'Av. Industrial 456',
  prov_suministro: ['tela', 'hilo'],
  pro_estado: 'ACTIVO'
};

const proveedorArrayEjemplo = [proveedorEjemplo];

// =====================================================
// 4. TESTS: GET /proveedores
// =====================================================

describe('GET /proveedores', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe retornar lista paginada de proveedores con código 200', async () => {
    obtenerProveedores.mockResolvedValue({
      meta: { paginas_totales: 1, pagina_actual: 1, total: 1, limite: 15 },
      data: proveedorArrayEjemplo
    });

    const response = await request(app).get('/proveedores');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('meta');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveLength(1);
    expect(obtenerProveedores).toHaveBeenCalledTimes(1);
  });

  test('debe aceptar parámetros de paginación', async () => {
    obtenerProveedores.mockResolvedValue({
      meta: { paginas_totales: 3, pagina_actual: 2, total: 30, limite: 10 },
      data: []
    });

    const response = await request(app).get('/proveedores?pagina=2&limite=10');

    expect(response.status).toBe(200);
    expect(obtenerProveedores).toHaveBeenCalledWith('2', '10', null, null, null);
  });

  test('debe filtrar por nombre de proveedor', async () => {
    obtenerProveedores.mockResolvedValue({
      meta: { paginas_totales: 1, pagina_actual: 1, total: 1, limite: 15 },
      data: [proveedorEjemplo]
    });

    const response = await request(app).get('/proveedores?prov_nombre=Distribuidora');

    expect(response.status).toBe(200);
    expect(obtenerProveedores).toHaveBeenCalledWith(undefined, undefined, 'Distribuidora', null, null);
  });

  test('debe filtrar por tipo de suministro', async () => {
    obtenerProveedores.mockResolvedValue({
      meta: { paginas_totales: 1, pagina_actual: 1, total: 1, limite: 15 },
      data: [proveedorEjemplo]
    });

    const response = await request(app).get('/proveedores?prov_tipo_suministro=tela');

    expect(response.status).toBe(200);
    expect(obtenerProveedores).toHaveBeenCalledWith(undefined, undefined, null, 'tela', null);
  });

  test('debe retornar 500 si el service falla', async () => {
    obtenerProveedores.mockRejectedValue(new Error('Error de BD'));

    const response = await request(app).get('/proveedores');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 5. TESTS: POST /proveedores
// =====================================================

describe('POST /proveedores', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const proveedorValido = {
    prov_nombre: 'Textiles del Norte EIRL',
    prov_telefono: '987654321',
    prov_correo: 'ventas@textilesnorte.com',
    prov_direccion: 'Calle Los Tejedores 321',
    prov_suministro: ['tela', 'hilo', 'botones']
  };

  test('debe crear un proveedor y retornar 201', async () => {
    crearProveedor.mockResolvedValue({
      ...proveedorEjemplo,
      prov_nombre: 'Textiles del Norte EIRL',
      prov_telefono: '987654321',
      prov_correo: 'ventas@textilesnorte.com'
    });

    const response = await request(app)
      .post('/proveedores')
      .send(proveedorValido);

    expect(response.status).toBe(201);
    expect(crearProveedor).toHaveBeenCalledTimes(1);
  });

  test('debe retornar 400 si falta el nombre', async () => {
    const response = await request(app)
      .post('/proveedores')
      .send({
        prov_telefono: '987654321',
        prov_correo: 'ventas@textilesnorte.com'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toHaveProperty('prov_nombre');
  });

  test('debe retornar 400 si el correo es inválido', async () => {
    const response = await request(app)
      .post('/proveedores')
      .send({
        ...proveedorValido,
        prov_correo: 'correo-invalido'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('prov_correo');
  });

  test('debe retornar 400 si prov_suministro no es un arreglo', async () => {
    const response = await request(app)
      .post('/proveedores')
      .send({
        ...proveedorValido,
        prov_suministro: 'no-soy-array'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('prov_suministro');
  });

  test('debe retornar 500 si el service lanza error', async () => {
    crearProveedor.mockRejectedValue(new Error('Error interno'));

    const response = await request(app)
      .post('/proveedores')
      .send(proveedorValido);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 6. TESTS: GET /proveedores/:id
// =====================================================

describe('GET /proveedores/:id', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe retornar un proveedor por ID con código 200', async () => {
    obtenerProveedorPorId.mockResolvedValue(proveedorEjemplo);

    const response = await request(app).get('/proveedores/PRVabc123def4567');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(proveedorEjemplo);
    expect(obtenerProveedorPorId).toHaveBeenCalledWith('PRVabc123def4567', undefined, undefined);
  });

  test('debe retornar 404 si el proveedor no existe', async () => {
    obtenerProveedorPorId.mockResolvedValue(null);

    const response = await request(app).get('/proveedores/IDINEXISTENTE');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ status: false, error: 'Proveedor no encontrado' });
  });

  test('debe retornar 500 si el service falla', async () => {
    obtenerProveedorPorId.mockRejectedValue(new Error('Error de consulta'));

    const response = await request(app).get('/proveedores/PRV999');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 7. TESTS: PUT /proveedores/:id
// =====================================================

describe('PUT /proveedores/:id', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const datosActualizacion = {
    prov_nombre: 'Distribuidora Textil del Sur SA',
    prov_telefono: '555123456',
    prov_correo: 'info@delsur.com',
    prov_direccion: 'Av. Nueva 789',
    prov_suministro: ['tela', 'jean', 'cierres']
  };

  test('debe actualizar un proveedor y retornar 200', async () => {
    actualizarProveedor.mockResolvedValue({
      status: true,
      msg: 'Proveedor actualizado con éxito'
    });

    const response = await request(app)
      .put('/proveedores/PRVabc123def4567')
      .send(datosActualizacion);

    expect(response.status).toBe(200);
    expect(actualizarProveedor).toHaveBeenCalledWith(
      'PRVabc123def4567',
      expect.objectContaining({ prov_nombre: 'Distribuidora Textil del Sur SA' })
    );
  });

  test('debe retornar 400 si falta el nombre', async () => {
    const response = await request(app)
      .put('/proveedores/PRVabc123def4567')
      .send({
        prov_telefono: '555123456',
        prov_correo: 'info@delsur.com'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('prov_nombre');
  });

  test('debe retornar 404 si el proveedor a actualizar no existe', async () => {
    actualizarProveedor.mockRejectedValue(new Error('Proveedor no encontrado'));

    const response = await request(app)
      .put('/proveedores/PRV999')
      .send(datosActualizacion);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ status: false, error: 'Proveedor no encontrado' });
  });

  test('debe retornar 500 si el service falla', async () => {
    actualizarProveedor.mockRejectedValue(new Error('Error inesperado'));

    const response = await request(app)
      .put('/proveedores/PRVabc123def4567')
      .send(datosActualizacion);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 8. TESTS: DELETE /proveedores/:id
// =====================================================

describe('DELETE /proveedores/:id', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe deshabilitar un proveedor y retornar 200', async () => {
    deshabilitarProveedor.mockResolvedValue({
      status: true,
      msg: 'Proveedor deshabilitado con éxito'
    });

    const response = await request(app)
      .delete('/proveedores/PRVabc123def4567');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: true,
      msg: 'Proveedor deshabilitado con éxito'
    });
    expect(deshabilitarProveedor).toHaveBeenCalledWith('PRVabc123def4567');
  });

  test('debe retornar 404 si el proveedor no existe', async () => {
    deshabilitarProveedor.mockRejectedValue(new Error('Proveedor no encontrado'));

    const response = await request(app)
      .delete('/proveedores/PRV999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ status: false, error: 'Proveedor no encontrado' });
  });

  test('debe retornar 400 si el proveedor ya está deshabilitado', async () => {
    deshabilitarProveedor.mockRejectedValue(
      new Error('El proveedor ya se encuentra deshabilitado')
    );

    const response = await request(app)
      .delete('/proveedores/PRVabc123def4567');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: false,
      error: 'El proveedor ya se encuentra deshabilitado'
    });
  });

  test('debe retornar 500 si el service falla', async () => {
    deshabilitarProveedor.mockRejectedValue(new Error('Error inesperado'));

    const response = await request(app)
      .delete('/proveedores/PRVabc123def4567');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});
