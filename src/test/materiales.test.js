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

jest.unstable_mockModule('../services/materiales.service.js', () => ({
  getAllMaterialesService: jest.fn(),
  getMaterialByIdService: jest.fn(),
  createMaterialService: jest.fn(),
  updateMaterialService: jest.fn(),
  changeMaterialEstadoService: jest.fn()
}));

// =====================================================
// 2. IMPORTS
// =====================================================

const { default: app } = await import('../app.js');

const materialesService = await import('../services/materiales.service.js');

// =====================================================
// 3. DATOS DE PRUEBA
// =====================================================

const MATERIAL_VALIDO = {
  nombre: 'Tela Algodón Premium',
  descripcion: 'Tela de algodón 100% peinada',
  umbralMinimo: 10,
  unidadMedida: 'Metros',
  tipoMaterial: 'TELA'
};

// =====================================================
// 4. TESTS: GET /materiales
// =====================================================

describe('GET /materiales', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe retornar lista paginada con código 200', async () => {
    materialesService.getAllMaterialesService.mockResolvedValue({
      data: [
        { id: 1, nombre: 'Tela Algodón', tipoMaterial: 'TELA', cantidadDisponible: 50, estado: 'DISPONIBLE' }
      ],
      meta: { pagina_actual: 1, paginas_totales: 1, total: 1, limite: 15 }
    });

    const res = await request(app).get('/materiales');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toBeDefined();
  });

  test('debe pasar filtros opcionales al servicio', async () => {
    materialesService.getAllMaterialesService.mockResolvedValue({ data: [], meta: { pagina_actual: 1, paginas_totales: 1, total: 0, limite: 15 } });

    await request(app).get('/materiales?nombre=Tela&estado=DISPONIBLE&tipoMaterial=TELA');

    expect(materialesService.getAllMaterialesService).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Tela',
        estado: 'DISPONIBLE',
        tipoMaterial: 'TELA'
      })
    );
  });

  test('debe rechazar pagina no numérica con 400', async () => {
    const res = await request(app).get('/materiales?pagina=abc');

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('debe rechazar limite mayor a 100 con 400', async () => {
    const res = await request(app).get('/materiales?limite=500');

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('limite');
  });

  test('debe rechazar estado inválido con 400', async () => {
    const res = await request(app).get('/materiales?estado=INEXISTENTE');

    expect(res.status).toBe(400);
  });

  test('debe rechazar tipoMaterial inválido con 400', async () => {
    const res = await request(app).get('/materiales?tipoMaterial=PLASTICO');

    expect(res.status).toBe(400);
  });

  test('debe normalizar mayúsculas en tipoMaterial', async () => {
    materialesService.getAllMaterialesService.mockResolvedValue({ data: [], meta: { pagina_actual: 1, paginas_totales: 1, total: 0, limite: 15 } });

    const res = await request(app).get('/materiales?tipoMaterial=tela');

    expect(res.status).toBe(200);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    materialesService.getAllMaterialesService.mockRejectedValue(new Error('Error BD'));

    const res = await request(app).get('/materiales');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 5. TESTS: GET /materiales/:id
// =====================================================

describe('GET /materiales/:id', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe retornar un material por ID con 200', async () => {
    materialesService.getMaterialByIdService.mockResolvedValue({
      data: { id: 1, nombre: 'Tela Algodón', tipoMaterial: 'TELA', cantidadDisponible: 50, estado: 'DISPONIBLE' }
    });

    const res = await request(app).get('/materiales/1');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.id).toBe(1);
  });

  test('debe retornar 404 si el material no existe', async () => {
    materialesService.getMaterialByIdService.mockResolvedValue({
      err: 'Material no encontrado',
      errorCode: 404
    });

    const res = await request(app).get('/materiales/9999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: false, error: 'Material no encontrado' });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    materialesService.getMaterialByIdService.mockRejectedValue(new Error('Error consulta'));

    const res = await request(app).get('/materiales/1');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 6. TESTS: POST /materiales
// =====================================================

describe('POST /materiales', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe crear un material y retornar 201', async () => {
    materialesService.createMaterialService.mockResolvedValue({
      msg: 'Material creado correctamente',
      id: 1
    });

    const res = await request(app)
      .post('/materiales')
      .send(MATERIAL_VALIDO);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe(true);
    expect(res.body.id).toBe(1);
  });

  test('debe retornar 400 si falta nombre', async () => {
    const { nombre, ...sinNombre } = MATERIAL_VALIDO;
    const res = await request(app)
      .post('/materiales')
      .send(sinNombre);

    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si nombre supera 50 caracteres', async () => {
    const res = await request(app)
      .post('/materiales')
      .send({ ...MATERIAL_VALIDO, nombre: 'A'.repeat(51) });

    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si falta umbralMinimo', async () => {
    const { umbralMinimo, ...sinUmbral } = MATERIAL_VALIDO;
    const res = await request(app)
      .post('/materiales')
      .send(sinUmbral);

    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si umbralMinimo es negativo', async () => {
    const res = await request(app)
      .post('/materiales')
      .send({ ...MATERIAL_VALIDO, umbralMinimo: -5 });

    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si tipoMaterial es inválido', async () => {
    const res = await request(app)
      .post('/materiales')
      .send({ ...MATERIAL_VALIDO, tipoMaterial: 'PLASTICO' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('tipoMaterial');
  });

  test('debe normalizar mayúsculas en tipoMaterial', async () => {
    materialesService.createMaterialService.mockResolvedValue({
      msg: 'Material creado correctamente',
      id: 1
    });

    const res = await request(app)
      .post('/materiales')
      .send({ ...MATERIAL_VALIDO, tipoMaterial: 'tela' });

    expect(res.status).toBe(201);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    materialesService.createMaterialService.mockRejectedValue(new Error('Error crítico'));

    const res = await request(app)
      .post('/materiales')
      .send(MATERIAL_VALIDO);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 7. TESTS: PUT /materiales/:id
// =====================================================

describe('PUT /materiales/:id', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  const datosActualizacion = {
    nombre: 'Tela actualizada',
    descripcion: 'Nueva descripción',
    umbralMinimo: 15,
    unidadMedida: 'Kilogramos',
    tipoMaterial: 'HERRAMIENTA'
  };

  test('debe actualizar y retornar 200', async () => {
    materialesService.updateMaterialService.mockResolvedValue({
      msg: 'Material actualizado correctamente'
    });

    const res = await request(app)
      .put('/materiales/1')
      .send(datosActualizacion);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: true, msg: 'Material actualizado correctamente' });
  });

  test('debe retornar 400 si falta nombre', async () => {
    const { nombre, ...sinNombre } = datosActualizacion;
    const res = await request(app)
      .put('/materiales/1')
      .send(sinNombre);

    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si tipoMaterial es inválido', async () => {
    const res = await request(app)
      .put('/materiales/1')
      .send({ ...datosActualizacion, tipoMaterial: 'INEXISTENTE' });

    expect(res.status).toBe(400);
  });

  test('debe retornar 404 si el material no existe', async () => {
    materialesService.updateMaterialService.mockResolvedValue({
      err: 'Material no encontrado',
      errorCode: 404
    });

    const res = await request(app)
      .put('/materiales/9999')
      .send(datosActualizacion);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: false, error: 'Material no encontrado' });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    materialesService.updateMaterialService.mockRejectedValue(new Error('Error'));

    const res = await request(app)
      .put('/materiales/1')
      .send(datosActualizacion);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 8. TESTS: PATCH /materiales/:id/estado
// =====================================================

describe('PATCH /materiales/:id/estado', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe cambiar estado a AGOTADO y retornar 200', async () => {
    materialesService.changeMaterialEstadoService.mockResolvedValue({
      msg: 'Material marcado como agotado'
    });

    const res = await request(app)
      .patch('/materiales/1/estado')
      .send({ estado: 'AGOTADO' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
  });

  test('debe cambiar estado a DISPONIBLE y retornar 200', async () => {
    materialesService.changeMaterialEstadoService.mockResolvedValue({
      msg: 'Material marcado como disponible'
    });

    const res = await request(app)
      .patch('/materiales/1/estado')
      .send({ estado: 'DISPONIBLE' });

    expect(res.status).toBe(200);
  });

  test('debe normalizar minúsculas a mayúsculas en estado', async () => {
    materialesService.changeMaterialEstadoService.mockResolvedValue({
      msg: 'Material marcado como agotado'
    });

    const res = await request(app)
      .patch('/materiales/1/estado')
      .send({ estado: 'agotado' });

    expect(res.status).toBe(200);
  });

  test('debe retornar 400 si el estado es inválido', async () => {
    const res = await request(app)
      .patch('/materiales/1/estado')
      .send({ estado: 'INEXISTENTE' });

    expect(res.status).toBe(400);
  });

  test('debe retornar 404 si el material no existe', async () => {
    materialesService.changeMaterialEstadoService.mockResolvedValue({
      err: 'Material no encontrado',
      errorCode: 404
    });

    const res = await request(app)
      .patch('/materiales/9999/estado')
      .send({ estado: 'ELIMINADO' });

    expect(res.status).toBe(404);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    materialesService.changeMaterialEstadoService.mockRejectedValue(new Error('Error'));

    const res = await request(app)
      .patch('/materiales/1/estado')
      .send({ estado: 'DISPONIBLE' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});
