import { jest } from '@jest/globals';
import request from 'supertest';

// =====================================================
// Silenciar console en tests
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

jest.unstable_mockModule('../services/alertas.service.js', () => ({
  getAlertasService: jest.fn()
}));

// =====================================================
// 2. IMPORTS (después de los mocks)
// =====================================================

const { default: app } = await import('../app.js');

const alertasService = await import('../services/alertas.service.js');

// =====================================================
// 3. DATOS DE PRUEBA
// =====================================================

const alertaEjemplo = {
  id_alerta: 1,
  titulo: 'Pago pendiente - Venta #VT001',
  mensaje: 'La venta #VT001 tiene un monto pendiente de S/150.00 con fecha límite 20/03/2025',
  tipo_alerta: 'WARNING',
  categoria: 'PAGO_PENDIENTE_VENTAS',
  modulo: 'PAGOS',
  fecha: '2025-03-20T12:00:00.000Z',
  estado: 'ACTIVO',
  referencia_id: 'VT001',
  info_extra: {
    id_cliente: 'CLI001',
    nombre_cliente: 'Juan Pérez',
    monto_pendiente: 150.00,
    fecha_limite: '2025-03-20',
    tipo_origen: 'VENTA'
  },
  accion: {
    url: '/ventas/VT001',
    texto: 'Ir a venta'
  }
};

const alertaPedidoEjemplo = {
  id_alerta: 2,
  titulo: 'Pago pendiente - Pedido #PD001',
  mensaje: 'El pedido #PD001 tiene un monto pendiente de S/200.00 con fecha límite 18/03/2025',
  tipo_alerta: 'WARNING',
  categoria: 'PAGO_PENDIENTE_PEDIDO',
  modulo: 'PAGOS',
  fecha: '2025-03-18T10:30:00.000Z',
  estado: 'ACTIVO',
  referencia_id: 'PD001',
  info_extra: {
    id_cliente: 'CLI002',
    nombre_cliente: 'María López',
    monto_pendiente: 200.00,
    fecha_limite: '2025-03-18',
    tipo_origen: 'PEDIDO'
  },
  accion: {
    url: '/pedidos/PD001',
    texto: 'Ir a pedido'
  }
};

const alertaResueltaEjemplo = {
  ...alertaEjemplo,
  id_alerta: 3,
  estado: 'RESUELTO',
  info_extra: { ...alertaEjemplo.info_extra, monto_pendiente: 0 }
};

const metaEjemplo = {
  paginas_totales: 1,
  pagina_actual: 1,
  total: 3,
  limite: 15
};

// =====================================================
// 4. TESTS
// =====================================================

describe('GET /alertas', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  // ─── 200: lista paginada ─────────────────────────

  test('debe retornar lista paginada con código 200', async () => {
    alertasService.getAlertasService.mockResolvedValue({
      meta: metaEjemplo,
      data: [alertaEjemplo, alertaPedidoEjemplo, alertaResueltaEjemplo]
    });

    const res = await request(app).get('/alertas');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('paginas_totales', 1);
    expect(res.body.meta).toHaveProperty('pagina_actual', 1);
    expect(res.body.meta).toHaveProperty('total', 3);
    expect(res.body.meta).toHaveProperty('limite', 15);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveLength(3);
  });

  test('cada alerta debe tener la estructura esperada', async () => {
    alertasService.getAlertasService.mockResolvedValue({
      meta: metaEjemplo,
      data: [alertaEjemplo]
    });

    const res = await request(app).get('/alertas');

    expect(res.status).toBe(200);
    const item = res.body.data[0];
    expect(item).toHaveProperty('id_alerta');
    expect(item).toHaveProperty('titulo');
    expect(item).toHaveProperty('mensaje');
    expect(item).toHaveProperty('tipo_alerta', 'WARNING');
    expect(item).toHaveProperty('categoria');
    expect(item).toHaveProperty('modulo', 'PAGOS');
    expect(item).toHaveProperty('fecha');
    expect(item).toHaveProperty('estado');
    expect(item).toHaveProperty('referencia_id');
    expect(item).toHaveProperty('info_extra');
    expect(item.info_extra).toHaveProperty('id_cliente');
    expect(item.info_extra).toHaveProperty('nombre_cliente');
    expect(item.info_extra).toHaveProperty('monto_pendiente');
    expect(item.info_extra).toHaveProperty('fecha_limite');
    expect(item.info_extra).toHaveProperty('tipo_origen');
    expect(item).toHaveProperty('accion');
    expect(item.accion).toHaveProperty('url');
    expect(item.accion).toHaveProperty('texto');
  });

  // ─── 200: accion según tipo_origen ───────────────

  test('alerta de venta debe tener accion.url /ventas/:id y texto "Ir a venta"', async () => {
    alertasService.getAlertasService.mockResolvedValue({
      meta: metaEjemplo,
      data: [alertaEjemplo]
    });

    const res = await request(app).get('/alertas');
    const alerta = res.body.data[0];

    expect(alerta.accion.url).toBe('/ventas/VT001');
    expect(alerta.accion.texto).toBe('Ir a venta');
  });

  test('alerta de pedido debe tener accion.url /pedidos/:id y texto "Ir a pedido"', async () => {
    alertasService.getAlertasService.mockResolvedValue({
      meta: metaEjemplo,
      data: [alertaPedidoEjemplo]
    });

    const res = await request(app).get('/alertas');
    const alerta = res.body.data[0];

    expect(alerta.accion.url).toBe('/pedidos/PD001');
    expect(alerta.accion.texto).toBe('Ir a pedido');
  });

  // ─── 200: lista vacía ────────────────────────────

  test('debe retornar lista vacía cuando no hay alertas', async () => {
    alertasService.getAlertasService.mockResolvedValue({
      meta: { paginas_totales: 0, pagina_actual: 1, total: 0, limite: 15 },
      data: []
    });

    const res = await request(app).get('/alertas');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  // ─── 200: filtro por estado ──────────────────────

  test('debe filtrar por estado=ACTIVO', async () => {
    alertasService.getAlertasService.mockResolvedValue({
      meta: { ...metaEjemplo, total: 2 },
      data: [alertaEjemplo, alertaPedidoEjemplo]
    });

    await request(app).get('/alertas?estado=ACTIVO');

    expect(alertasService.getAlertasService).toHaveBeenCalledWith(
      1, 15,
      expect.objectContaining({ estado: 'ACTIVO' })
    );
  });

  test('debe filtrar por estado=RESUELTO', async () => {
    alertasService.getAlertasService.mockResolvedValue({
      meta: { ...metaEjemplo, total: 1 },
      data: [alertaResueltaEjemplo]
    });

    await request(app).get('/alertas?estado=RESUELTO');

    expect(alertasService.getAlertasService).toHaveBeenCalledWith(
      1, 15,
      expect.objectContaining({ estado: 'RESUELTO' })
    );
  });

  // ─── 200: filtro por tipo ────────────────────────

  test('debe filtrar por tipo=WARNING', async () => {
    alertasService.getAlertasService.mockResolvedValue({
      meta: metaEjemplo,
      data: [alertaEjemplo]
    });

    await request(app).get('/alertas?tipo=WARNING');

    expect(alertasService.getAlertasService).toHaveBeenCalledWith(
      1, 15,
      expect.objectContaining({ tipo: 'WARNING' })
    );
  });

  // ─── 200: filtro por categoría ───────────────────

  test('debe filtrar por categoria=PAGO_PENDIENTE_VENTAS', async () => {
    alertasService.getAlertasService.mockResolvedValue({
      meta: { ...metaEjemplo, total: 1 },
      data: [alertaEjemplo]
    });

    await request(app).get('/alertas?categoria=PAGO_PENDIENTE_VENTAS');

    expect(alertasService.getAlertasService).toHaveBeenCalledWith(
      1, 15,
      expect.objectContaining({ categoria: 'PAGO_PENDIENTE_VENTAS' })
    );
  });

  test('debe filtrar por categoria=PAGO_PENDIENTE_PEDIDO', async () => {
    alertasService.getAlertasService.mockResolvedValue({
      meta: { ...metaEjemplo, total: 1 },
      data: [alertaPedidoEjemplo]
    });

    await request(app).get('/alertas?categoria=PAGO_PENDIENTE_PEDIDO');

    expect(alertasService.getAlertasService).toHaveBeenCalledWith(
      1, 15,
      expect.objectContaining({ categoria: 'PAGO_PENDIENTE_PEDIDO' })
    );
  });

  // ─── 200: filtros combinados ─────────────────────

  test('debe soportar filtros combinados (pagina + estado + tipo)', async () => {
    alertasService.getAlertasService.mockResolvedValue({
      meta: { ...metaEjemplo, pagina_actual: 2, total: 10 },
      data: [alertaEjemplo]
    });

    await request(app).get('/alertas?pagina=2&limite=5&estado=ACTIVO&tipo=WARNING');

    expect(alertasService.getAlertasService).toHaveBeenCalledWith(
      '2', '5',
      expect.objectContaining({ estado: 'ACTIVO', tipo: 'WARNING' })
    );
  });

  // ─── 200: pagina y limite por defecto ────────────

  test('debe usar pagina=1 y limite=15 por defecto', async () => {
    alertasService.getAlertasService.mockResolvedValue({
      meta: metaEjemplo,
      data: []
    });

    await request(app).get('/alertas');

    expect(alertasService.getAlertasService).toHaveBeenCalledWith(
      1, 15,
      expect.any(Object)
    );
  });

  // ─── 200: pagina y limite personalizados ─────────

  test('debe aceptar pagina y limite personalizados', async () => {
    alertasService.getAlertasService.mockResolvedValue({
      meta: { paginas_totales: 3, pagina_actual: 2, total: 25, limite: 10 },
      data: []
    });

    const res = await request(app).get('/alertas?pagina=2&limite=10');

    expect(res.body.meta.pagina_actual).toBe(2);
    expect(res.body.meta.limite).toBe(10);
    expect(res.body.meta.paginas_totales).toBe(3);
  });

  // ─── 500: error del servicio ─────────────────────

  test('debe retornar 500 si el servicio falla', async () => {
    alertasService.getAlertasService.mockRejectedValue(new Error('Error de conexión a BD'));

    const res = await request(app).get('/alertas');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: false,
      error: 'Error interno del servidor'
    });
  });

  // ─── 500: AppError con statusCode específico ─────

  test('debe retornar el statusCode del AppError lanzado por el servicio', async () => {
    const { AppError } = await import('../utils/appError.js');
    alertasService.getAlertasService.mockRejectedValue(
      new AppError('Error personalizado', 422)
    );

    const res = await request(app).get('/alertas');

    expect(res.status).toBe(422);
    expect(res.body).toEqual({
      status: false,
      error: 'Error personalizado'
    });
  });
});
