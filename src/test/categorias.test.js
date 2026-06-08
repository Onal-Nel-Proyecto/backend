import { jest } from '@jest/globals';
import request from 'supertest';

// =====================================================
// Silenciar console.error en tests esperados
// =====================================================
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});

// =====================================================
// 1. MOCKS (antes de los imports reales)
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

jest.unstable_mockModule('../services/categorias.service.js', () => ({
  getAllCategoriasService: jest.fn(),
  getCategoriaByIdService: jest.fn(),
  createCategoriaService: jest.fn(),
  updateCategoriaService: jest.fn(),
  changeCategoriaEstadoService: jest.fn()
}));

// =====================================================
// 2. IMPORTS
// =====================================================

const { default: app } = await import('../app.js');

const categoriasService = await import('../services/categorias.service.js');

// =====================================================
// 3. DATOS DE PRUEBA
// =====================================================

const CATEGORIA_ID = 1;
const CATEGORIA_VALIDA = {
  catNom: 'Uniformes',
  catDesc: 'Categoría de uniformes ejecutivos',
  catEst: 'ACTIVO'
};

// =====================================================
// 4. TESTS: GET /categorias
// =====================================================

describe('GET /categorias', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('debe retornar lista de categorías con código 200', async () => {
    categoriasService.getAllCategoriasService.mockResolvedValue({
      data: [
        { id: 1, nombre: 'Uniformes', descripcion: 'Uniformes ejecutivos', estado: 'ACTIVO' },
        { id: 2, nombre: 'Deportivo', descripcion: 'Ropa deportiva', estado: 'ACTIVO' },
      ]
    });

    const res = await request(app).get('/categorias');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  test('debe pasar filtros al servicio', async () => {
    categoriasService.getAllCategoriasService.mockResolvedValue({ data: [] });

    await request(app).get('/categorias?nombre=Uniformes&estado=ACTIVO');

    expect(categoriasService.getAllCategoriasService).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Uniformes', estado: 'ACTIVO' })
    );
  });

  test('debe rechazar estado inválido con 400', async () => {
    const res = await request(app).get('/categorias?estado=INEXISTENTE');
    expect(res.status).toBe(400);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    categoriasService.getAllCategoriasService.mockRejectedValue(new Error('Error BD'));
    const res = await request(app).get('/categorias');
    expect(res.status).toBe(500);
  });
});

// =====================================================
// 5. TESTS: GET /categorias/:id
// =====================================================

describe('GET /categorias/:id', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('debe retornar una categoría por ID con 200', async () => {
    categoriasService.getCategoriaByIdService.mockResolvedValue({
      data: { id: CATEGORIA_ID, nombre: 'Uniformes', descripcion: 'Uniformes ejecutivos', estado: 'ACTIVO' }
    });

    const res = await request(app).get(`/categorias/${CATEGORIA_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.id).toBe(CATEGORIA_ID);
  });

  test('debe retornar 404 si la categoría no existe', async () => {
    categoriasService.getCategoriaByIdService.mockResolvedValue({
      err: 'Categoría no encontrada', errorCode: 404
    });

    const res = await request(app).get('/categorias/999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: false, error: 'Categoría no encontrada' });
  });

  test('debe retornar 400 si el ID no es numérico', async () => {
    const res = await request(app).get('/categorias/abc');
    expect(res.status).toBe(400);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    categoriasService.getCategoriaByIdService.mockRejectedValue(new Error('Error'));
    const res = await request(app).get(`/categorias/${CATEGORIA_ID}`);
    expect(res.status).toBe(500);
  });
});

// =====================================================
// 6. TESTS: POST /categorias
// =====================================================

describe('POST /categorias', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('debe crear una categoría y retornar 201', async () => {
    categoriasService.createCategoriaService.mockResolvedValue({
      msg: 'Categoría creada correctamente', id: CATEGORIA_ID
    });

    const res = await request(app)
      .post('/categorias')
      .send(CATEGORIA_VALIDA);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe(true);
    expect(res.body.id).toBe(CATEGORIA_ID);
  });

  test('debe retornar 400 si falta catNom', async () => {
    const { catNom, ...sinNombre } = CATEGORIA_VALIDA;
    const res = await request(app).post('/categorias').send(sinNombre);
    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si catNom tiene menos de 3 caracteres', async () => {
    const res = await request(app).post('/categorias').send({ ...CATEGORIA_VALIDA, catNom: 'AB' });
    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si catNom excede 50 caracteres', async () => {
    const res = await request(app).post('/categorias').send({ ...CATEGORIA_VALIDA, catNom: 'A'.repeat(51) });
    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si catDesc excede 120 caracteres', async () => {
    const res = await request(app).post('/categorias').send({ ...CATEGORIA_VALIDA, catDesc: 'A'.repeat(121) });
    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si el servicio reporta duplicado', async () => {
    categoriasService.createCategoriaService.mockResolvedValue({
      err: 'Ya existe una categoría con ese nombre', errorCode: 400
    });

    const res = await request(app).post('/categorias').send(CATEGORIA_VALIDA);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: false, error: 'Ya existe una categoría con ese nombre' });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    categoriasService.createCategoriaService.mockRejectedValue(new Error('Error'));
    const res = await request(app).post('/categorias').send(CATEGORIA_VALIDA);
    expect(res.status).toBe(500);
  });
});

// =====================================================
// 7. TESTS: PUT /categorias/:id
// =====================================================

describe('PUT /categorias/:id', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  const datosActualizacion = {
    catNom: 'Uniformes Ejecutivos',
    catDesc: 'Actualizado',
    catEst: 'ACTIVO'
  };

  test('debe actualizar y retornar 200', async () => {
    categoriasService.updateCategoriaService.mockResolvedValue({
      msg: 'Categoría actualizada correctamente'
    });

    const res = await request(app)
      .put(`/categorias/${CATEGORIA_ID}`)
      .send(datosActualizacion);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: true, msg: 'Categoría actualizada correctamente' });
  });

  test('debe retornar 400 si falta catNom', async () => {
    const { catNom, ...sinNombre } = datosActualizacion;
    const res = await request(app).put(`/categorias/${CATEGORIA_ID}`).send(sinNombre);
    expect(res.status).toBe(400);
  });

  test('debe retornar 404 si la categoría no existe', async () => {
    categoriasService.updateCategoriaService.mockResolvedValue({
      err: 'Categoría no encontrada', errorCode: 404
    });

    const res = await request(app).put('/categorias/999').send(datosActualizacion);
    expect(res.status).toBe(404);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    categoriasService.updateCategoriaService.mockRejectedValue(new Error('Error'));
    const res = await request(app).put(`/categorias/${CATEGORIA_ID}`).send(datosActualizacion);
    expect(res.status).toBe(500);
  });
});

// =====================================================
// 8. TESTS: PATCH /categorias/:id/estado
// =====================================================

describe('PATCH /categorias/:id/estado', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('debe desactivar y retornar 200', async () => {
    categoriasService.changeCategoriaEstadoService.mockResolvedValue({
      msg: 'Categoría desactivada correctamente'
    });

    const res = await request(app)
      .patch(`/categorias/${CATEGORIA_ID}/estado`)
      .send({ estado: 'INACTIVO' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: true, msg: 'Categoría desactivada correctamente' });
  });

  test('debe retornar 400 si el estado es inválido', async () => {
    const res = await request(app)
      .patch(`/categorias/${CATEGORIA_ID}/estado`)
      .send({ estado: 'INEXISTENTE' });
    expect(res.status).toBe(400);
  });

  test('debe retornar 404 si la categoría no existe', async () => {
    categoriasService.changeCategoriaEstadoService.mockResolvedValue({
      err: 'Categoría no encontrada', errorCode: 404
    });

    const res = await request(app)
      .patch('/categorias/999/estado')
      .send({ estado: 'INACTIVO' });
    expect(res.status).toBe(404);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    categoriasService.changeCategoriaEstadoService.mockRejectedValue(new Error('Error'));
    const res = await request(app)
      .patch(`/categorias/${CATEGORIA_ID}/estado`)
      .send({ estado: 'INACTIVO' });
    expect(res.status).toBe(500);
  });
});
