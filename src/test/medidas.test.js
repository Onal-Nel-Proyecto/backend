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

jest.unstable_mockModule('../services/medidas.service.js', () => ({
  getAllMedidasService: jest.fn(),
  getMedidaByIdService: jest.fn(),
  createMedidaService: jest.fn(),
  updateMedidaService: jest.fn(),
  changeMedidaEstadoService: jest.fn()
}));

// =====================================================
// 2. IMPORTS
// =====================================================

const { default: app } = await import('../app.js');

const medidasService = await import('../services/medidas.service.js');

// =====================================================
// 3. DATOS DE PRUEBA
// =====================================================

const MEDIDA_ID = 1;
const MEDIDA_VALIDA = {
  medNom: 'Pecho',
  medDesc: 'Medida del contorno del pecho',
  medEst: 'ACTIVO'
};

// =====================================================
// 4. TESTS: GET /medidas
// =====================================================

describe('GET /medidas', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('debe retornar lista de medidas con código 200', async () => {
    medidasService.getAllMedidasService.mockResolvedValue({
      data: [
        { id: 1, nombre: 'Pecho', descripcion: 'Contorno del pecho', estado: 'ACTIVO' },
        { id: 2, nombre: 'Cintura', descripcion: 'Contorno de cintura', estado: 'ACTIVO' },
      ]
    });

    const res = await request(app).get('/medidas');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  test('debe pasar filtros al servicio', async () => {
    medidasService.getAllMedidasService.mockResolvedValue({ data: [] });

    await request(app).get('/medidas?nombre=Pecho&estado=ACTIVO');

    expect(medidasService.getAllMedidasService).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Pecho', estado: 'ACTIVO' })
    );
  });

  test('debe rechazar estado inválido con 400', async () => {
    const res = await request(app).get('/medidas?estado=INEXISTENTE');
    expect(res.status).toBe(400);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    medidasService.getAllMedidasService.mockRejectedValue(new Error('Error BD'));
    const res = await request(app).get('/medidas');
    expect(res.status).toBe(500);
  });
});

// =====================================================
// 5. TESTS: GET /medidas/:id
// =====================================================

describe('GET /medidas/:id', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('debe retornar una medida por ID con 200', async () => {
    medidasService.getMedidaByIdService.mockResolvedValue({
      data: { id: MEDIDA_ID, nombre: 'Pecho', descripcion: 'Contorno del pecho', estado: 'ACTIVO' }
    });

    const res = await request(app).get(`/medidas/${MEDIDA_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.id).toBe(MEDIDA_ID);
  });

  test('debe retornar 404 si la medida no existe', async () => {
    medidasService.getMedidaByIdService.mockResolvedValue({
      err: 'Medida no encontrada', errorCode: 404
    });

    const res = await request(app).get('/medidas/999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: false, error: 'Medida no encontrada' });
  });

  test('debe retornar 400 si el ID no es numérico', async () => {
    const res = await request(app).get('/medidas/abc');
    expect(res.status).toBe(400);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    medidasService.getMedidaByIdService.mockRejectedValue(new Error('Error'));
    const res = await request(app).get(`/medidas/${MEDIDA_ID}`);
    expect(res.status).toBe(500);
  });
});

// =====================================================
// 6. TESTS: POST /medidas
// =====================================================

describe('POST /medidas', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('debe crear una medida y retornar 201', async () => {
    medidasService.createMedidaService.mockResolvedValue({
      msg: 'Medida creada correctamente', id: MEDIDA_ID
    });

    const res = await request(app)
      .post('/medidas')
      .send(MEDIDA_VALIDA);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe(true);
    expect(res.body.id).toBe(MEDIDA_ID);
  });

  test('debe retornar 400 si falta medNom', async () => {
    const { medNom, ...sinNombre } = MEDIDA_VALIDA;
    const res = await request(app).post('/medidas').send(sinNombre);
    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si medNom tiene menos de 3 caracteres', async () => {
    const res = await request(app).post('/medidas').send({ ...MEDIDA_VALIDA, medNom: 'AB' });
    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si medNom excede 50 caracteres', async () => {
    const res = await request(app).post('/medidas').send({ ...MEDIDA_VALIDA, medNom: 'A'.repeat(51) });
    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si medDesc excede 120 caracteres', async () => {
    const res = await request(app).post('/medidas').send({ ...MEDIDA_VALIDA, medDesc: 'A'.repeat(121) });
    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si el servicio reporta duplicado', async () => {
    medidasService.createMedidaService.mockResolvedValue({
      err: 'Ya existe una medida con ese nombre', errorCode: 400
    });

    const res = await request(app).post('/medidas').send(MEDIDA_VALIDA);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: false, error: 'Ya existe una medida con ese nombre' });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    medidasService.createMedidaService.mockRejectedValue(new Error('Error'));
    const res = await request(app).post('/medidas').send(MEDIDA_VALIDA);
    expect(res.status).toBe(500);
  });
});

// =====================================================
// 7. TESTS: PUT /medidas/:id
// =====================================================

describe('PUT /medidas/:id', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  const datosActualizacion = {
    medNom: 'Contorno de Pecho',
    medDesc: 'Medida actualizada',
    medEst: 'ACTIVO'
  };

  test('debe actualizar y retornar 200', async () => {
    medidasService.updateMedidaService.mockResolvedValue({
      msg: 'Medida actualizada correctamente'
    });

    const res = await request(app)
      .put(`/medidas/${MEDIDA_ID}`)
      .send(datosActualizacion);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: true, msg: 'Medida actualizada correctamente' });
  });

  test('debe retornar 400 si falta medNom', async () => {
    const { medNom, ...sinNombre } = datosActualizacion;
    const res = await request(app).put(`/medidas/${MEDIDA_ID}`).send(sinNombre);
    expect(res.status).toBe(400);
  });

  test('debe retornar 404 si la medida no existe', async () => {
    medidasService.updateMedidaService.mockResolvedValue({
      err: 'Medida no encontrada', errorCode: 404
    });

    const res = await request(app).put('/medidas/999').send(datosActualizacion);
    expect(res.status).toBe(404);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    medidasService.updateMedidaService.mockRejectedValue(new Error('Error'));
    const res = await request(app).put(`/medidas/${MEDIDA_ID}`).send(datosActualizacion);
    expect(res.status).toBe(500);
  });
});

// =====================================================
// 8. TESTS: PATCH /medidas/:id/estado
// =====================================================

describe('PATCH /medidas/:id/estado', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('debe desactivar y retornar 200', async () => {
    medidasService.changeMedidaEstadoService.mockResolvedValue({
      msg: 'Medida desactivada correctamente'
    });

    const res = await request(app)
      .patch(`/medidas/${MEDIDA_ID}/estado`)
      .send({ estado: 'INACTIVO' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: true, msg: 'Medida desactivada correctamente' });
  });

  test('debe retornar 400 si el estado es inválido', async () => {
    const res = await request(app)
      .patch(`/medidas/${MEDIDA_ID}/estado`)
      .send({ estado: 'INEXISTENTE' });
    expect(res.status).toBe(400);
  });

  test('debe retornar 404 si la medida no existe', async () => {
    medidasService.changeMedidaEstadoService.mockResolvedValue({
      err: 'Medida no encontrada', errorCode: 404
    });

    const res = await request(app)
      .patch('/medidas/999/estado')
      .send({ estado: 'INACTIVO' });
    expect(res.status).toBe(404);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    medidasService.changeMedidaEstadoService.mockRejectedValue(new Error('Error'));
    const res = await request(app)
      .patch(`/medidas/${MEDIDA_ID}/estado`)
      .send({ estado: 'INACTIVO' });
    expect(res.status).toBe(500);
  });
});
