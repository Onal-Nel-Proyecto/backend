import { jest } from '@jest/globals';
import request from 'supertest';

// =====================================================
// Silenciar console.error / console.log en tests
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
  isAdmin: (req, _res, next) => next(),
  isAdminOrSelf: (req, _res, next) => next()
}));

jest.unstable_mockModule('../services/movimientos.service.js', () => ({
  getAllMovimientosService: jest.fn(),
  createMovimientoService: jest.fn()
}));

// =====================================================
// 2. IMPORTS
// =====================================================

const { default: app } = await import('../app.js');

const movimientosService = await import('../services/movimientos.service.js');

// =====================================================
// 3. DATOS DE PRUEBA
// =====================================================

const MOVIMIENTO_EJEMPLO = {
  id_mov: 115,
  tipo_mov: 'COMPRA',
  tipo_suministro: 'MATERIAL',
  suministro: {
    nombre: 'Tela Algodón Premium',
    referencia_id: 'MAT-001'
  },
  cantidad: 50,
  fecha: '2026-06-13 14:24:26',
  usuario: {
    user_id: 'U001',
    user_nombres: 'Carlos',
    user_apellidos: 'Mendoza'
  }
};

const PAGINACION_DEFAULT = {
  maxPag: 1,
  pagAct: 1,
  data: [MOVIMIENTO_EJEMPLO]
};

// =====================================================
// 4. TESTS: GET /movimientos
// =====================================================

describe('GET /movimientos', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  // ─── Happy path ─────────────────────────────────

  test('debe retornar lista paginada con código 200', async () => {
    movimientosService.getAllMovimientosService.mockResolvedValue(PAGINACION_DEFAULT);

    const res = await request(app).get('/movimientos');

    expect(res.status).toBe(200);
    expect(res.body.maxPag).toBe(1);
    expect(res.body.pagAct).toBe(1);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id_mov).toBe(115);
    expect(res.body.data[0].suministro.nombre).toBe('Tela Algodón Premium');
    expect(res.body.data[0].usuario.user_nombres).toBe('Carlos');
  });

  test('debe pasar pag=2 al servicio', async () => {
    movimientosService.getAllMovimientosService.mockResolvedValue({
      maxPag: 3,
      pagAct: 2,
      data: []
    });

    await request(app).get('/movimientos?pag=2');

    expect(movimientosService.getAllMovimientosService).toHaveBeenCalledWith(
      '2',
      expect.objectContaining({})
    );
  });

  // ─── Filtros ────────────────────────────────────

  test('debe pasar filtro usuario al servicio', async () => {
    movimientosService.getAllMovimientosService.mockResolvedValue(PAGINACION_DEFAULT);

    await request(app).get('/movimientos?usuario=Carlos');

    expect(movimientosService.getAllMovimientosService).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ usuario: 'Carlos' })
    );
  });

  test('debe pasar filtro fecha_desde al servicio', async () => {
    movimientosService.getAllMovimientosService.mockResolvedValue(PAGINACION_DEFAULT);

    await request(app).get('/movimientos?fecha_desde=2026-01-01');

    expect(movimientosService.getAllMovimientosService).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ fecha_desde: '2026-01-01' })
    );
  });

  test('debe pasar filtro fecha_hasta al servicio', async () => {
    movimientosService.getAllMovimientosService.mockResolvedValue(PAGINACION_DEFAULT);

    await request(app).get('/movimientos?fecha_hasta=2026-12-31');

    expect(movimientosService.getAllMovimientosService).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ fecha_hasta: '2026-12-31' })
    );
  });

  test('debe pasar filtro tipo_suministro al servicio', async () => {
    movimientosService.getAllMovimientosService.mockResolvedValue(PAGINACION_DEFAULT);

    await request(app).get('/movimientos?tipo_suministro=PRODUCTO');

    expect(movimientosService.getAllMovimientosService).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ tipo_suministro: 'PRODUCTO' })
    );
  });

  test('debe pasar filtro tipo_mov al servicio', async () => {
    movimientosService.getAllMovimientosService.mockResolvedValue(PAGINACION_DEFAULT);

    await request(app).get('/movimientos?tipo_mov=VENTA');

    expect(movimientosService.getAllMovimientosService).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ tipo_mov: 'VENTA' })
    );
  });

  test('debe pasar todos los filtros combinados al servicio', async () => {
    movimientosService.getAllMovimientosService.mockResolvedValue(PAGINACION_DEFAULT);

    await request(app).get(
      '/movimientos?pag=2&usuario=Admin&fecha_desde=2026-01-01&fecha_hasta=2026-06-30&tipo_suministro=MATERIAL&tipo_mov=AJUSTE'
    );

    expect(movimientosService.getAllMovimientosService).toHaveBeenCalledWith(
      '2',
      expect.objectContaining({
        usuario: 'Admin',
        fecha_desde: '2026-01-01',
        fecha_hasta: '2026-06-30',
        tipo_suministro: 'MATERIAL',
        tipo_mov: 'AJUSTE'
      })
    );
  });

  // ─── Validaciones (400) ─────────────────────────

  test('debe rechazar pag no numérico con 400', async () => {
    const res = await request(app).get('/movimientos?pag=abc');

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.pag).toBeDefined();
  });

  test('debe rechazar pag menor a 1 con 400', async () => {
    const res = await request(app).get('/movimientos?pag=0');

    expect(res.status).toBe(400);
    expect(res.body.errors.pag).toBeDefined();
  });

  test('debe rechazar fecha_desde inválida con 400', async () => {
    const res = await request(app).get('/movimientos?fecha_desde=no-es-fecha');

    expect(res.status).toBe(400);
    expect(res.body.errors.fecha_desde).toBeDefined();
  });

  test('debe rechazar fecha_hasta inválida con 400', async () => {
    const res = await request(app).get('/movimientos?fecha_hasta=ayer');

    expect(res.status).toBe(400);
    expect(res.body.errors.fecha_hasta).toBeDefined();
  });

  test('debe rechazar tipo_suministro inválido con 400', async () => {
    const res = await request(app).get('/movimientos?tipo_suministro=INSUMO');

    expect(res.status).toBe(400);
    expect(res.body.errors.tipo_suministro).toBeDefined();
  });

  test('debe rechazar tipo_mov inválido con 400', async () => {
    const res = await request(app).get('/movimientos?tipo_mov=DEVOLUCION');

    expect(res.status).toBe(400);
    expect(res.body.errors.tipo_mov).toBeDefined();
  });

  // ─── Error 500 ──────────────────────────────────

  test('debe retornar 500 si el servicio falla', async () => {
    movimientosService.getAllMovimientosService.mockRejectedValue(
      new Error('Error de base de datos')
    );

    const res = await request(app).get('/movimientos');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});
