import { jest } from '@jest/globals';
import request from 'supertest';

// =====================================================
// Silenciar console.error y console.log en tests
// =====================================================
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});

// =====================================================
// 1. MOCKS (antes de los imports reales)
// =====================================================

// Mock del middleware de autenticación
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

// Mock del servicio de pagos
jest.unstable_mockModule('../services/pagos.service.js', () => ({
  getPagosService: jest.fn(),
  createPagoService: jest.fn(),
  rechazarPagoService: jest.fn()
}));

// =====================================================
// 2. IMPORTS (después de los mocks)
// =====================================================

const { default: app } = await import('../app.js');
const { AppError } = await import('../utils/appError.js');

const {
  getPagosService,
  createPagoService,
  rechazarPagoService
} = await import('../services/pagos.service.js');

// =====================================================
// 3. DATOS DE PRUEBA
// =====================================================

const pagoEjemplo = {
  pago_id: 'PAG001',
  venta_id: 'VT001',
  pedido_id: null,
  monto: 125.00,
  metodo_pago: 'EFECTIVO',
  fecha_registro: '2025-04-10T10:30:00.000Z',
  estado: 'COMPLETADO'
};

const listaPagos = [pagoEjemplo];

const pagoEjemploConPedido = {
  ...pagoEjemplo,
  pago_id: 'PAG002',
  venta_id: null,
  pedido_id: 'PED001',
  metodo_pago: 'TARJETA',
  monto: 50.00
};

const resumenEjemplo = {
  total: 125.00,
  total_pagado: 125.00,
  faltante: 0
};

// =====================================================
// 4. TESTS: GET /pagos
// =====================================================

describe('GET /pagos', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe retornar lista paginada con código 200', async () => {
    getPagosService.mockResolvedValue({
      meta: { paginas_totales: 1, pagina_actual: 1, total: 1, limite: 5 },
      resumen: resumenEjemplo,
      data: listaPagos
    });

    const response = await request(app).get('/pagos');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('meta');
    expect(response.body.meta).toHaveProperty('paginas_totales', 1);
    expect(response.body).toHaveProperty('resumen');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveLength(1);
  });

  test('debe filtrar por venta_id usando query param', async () => {
    getPagosService.mockImplementation(async ({ venta_id }) => {
      if (venta_id === 'VT001') {
        return {
          meta: { paginas_totales: 1, pagina_actual: 1, total: 1, limite: 5 },
          resumen: resumenEjemplo,
          data: listaPagos
        };
      }
      return {
        meta: { paginas_totales: 0, pagina_actual: 1, total: 0, limite: 5 },
        resumen: { total: 0, total_pagado: 0, faltante: 0 },
        data: []
      };
    });

    const response = await request(app).get('/pagos?venta_id=VT001');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta.total).toBe(1);
    expect(getPagosService).toHaveBeenCalledWith(
      expect.objectContaining({ venta_id: 'VT001' })
    );
  });

  test('debe retornar lista vacía cuando no hay pagos', async () => {
    getPagosService.mockResolvedValue({
      meta: { paginas_totales: 0, pagina_actual: 1, total: 0, limite: 5 },
      resumen: { total: 0, total_pagado: 0, faltante: 0 },
      data: []
    });

    const response = await request(app).get('/pagos?venta_id=VT999');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.meta.total).toBe(0);
  });

  test('debe retornar 500 si el service falla inesperadamente', async () => {
    getPagosService.mockRejectedValue(new Error('Error de base de datos'));

    const response = await request(app).get('/pagos');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', false);
    expect(response.body).toHaveProperty('error', 'Error interno del servidor');
  });
});

// =====================================================
// 5. TESTS: POST /pagos
// =====================================================

describe('POST /pagos', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const pagoValido = {
    venta_id: 'VT001',
    monto: 125.00,
    metodo_pago: 'EFECTIVO'
  };

  test('debe crear un pago y retornar 201', async () => {
    createPagoService.mockResolvedValue({
      status: true,
      msg: 'Se registró un nuevo pago a venta con el ID #VT001',
      data: { pago_id: 'PAG001' }
    });

    const response = await request(app)
      .post('/pagos')
      .send(pagoValido);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', true);
    expect(response.body).toHaveProperty('msg');
    expect(response.body.data).toHaveProperty('pago_id', 'PAG001');
  });

  test('debe retornar 400 si falta el monto', async () => {
    const response = await request(app)
      .post('/pagos')
      .send({
        venta_id: 'VT001',
        metodo_pago: 'EFECTIVO'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', false);
    expect(response.body).toHaveProperty('msg', 'Errores de validación');
    expect(response.body.errors).toHaveProperty('monto');
  });

  test('debe retornar 400 si el monto no es positivo', async () => {
    const response = await request(app)
      .post('/pagos')
      .send({
        venta_id: 'VT001',
        monto: -10,
        metodo_pago: 'EFECTIVO'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toHaveProperty('monto');
  });

  test('debe retornar 400 si falta el metodo_pago', async () => {
    const response = await request(app)
      .post('/pagos')
      .send({
        venta_id: 'VT001',
        monto: 125.00
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('metodo_pago');
  });

  test('debe retornar 400 si metodo_pago es inválido', async () => {
    const response = await request(app)
      .post('/pagos')
      .send({
        venta_id: 'VT001',
        monto: 125.00,
        metodo_pago: 'CRIPTO'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('metodo_pago');
  });

  test('debe retornar 400 si no envía pedido_id ni venta_id', async () => {
    const response = await request(app)
      .post('/pagos')
      .send({
        monto: 125.00,
        metodo_pago: 'EFECTIVO'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('');
  });

  test('debe retornar 404 si la venta no existe', async () => {
    createPagoService.mockRejectedValue(
      new AppError('La venta no existe', 404)
    );

    const response = await request(app)
      .post('/pagos')
      .send(pagoValido);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', false);
  });

  test('debe retornar 400 si el monto supera el saldo pendiente', async () => {
    createPagoService.mockRejectedValue(
      new AppError('El monto supera el saldo pendiente de la venta', 400)
    );

    const response = await request(app)
      .post('/pagos')
      .send({
        venta_id: 'VT001',
        monto: 999999,
        metodo_pago: 'EFECTIVO'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', false);
  });

  test('debe retornar 400 si el pedido está cancelado', async () => {
    createPagoService.mockRejectedValue(
      new AppError('No se pueden registrar pagos en un pedido cancelado', 400)
    );

    const response = await request(app)
      .post('/pagos')
      .send({
        pedido_id: 'PED999',
        monto: 50.00,
        metodo_pago: 'TARJETA'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', false);
  });

  test('debe retornar 500 si el service falla inesperadamente', async () => {
    createPagoService.mockRejectedValue(new Error('Error de conexión'));

    const response = await request(app)
      .post('/pagos')
      .send(pagoValido);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', false);
    expect(response.body).toHaveProperty('error', 'Error interno del servidor');
  });
});

// =====================================================
// 6. TESTS: PATCH /pagos/:id/rechazar
// =====================================================

describe('PATCH /pagos/:id/rechazar', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe rechazar el pago y retornar 200', async () => {
    rechazarPagoService.mockResolvedValue({
      status: true,
      msg: 'Pago #PAG001 rechazado correctamente'
    });

    const response = await request(app).patch('/pagos/PAG001/rechazar');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', true);
    expect(response.body.msg).toContain('PAG001');
  });

  test('debe retornar 404 si el pago no existe', async () => {
    rechazarPagoService.mockRejectedValue(
      new AppError('Pago no encontrado o ya fue rechazado', 404)
    );

    const response = await request(app).patch('/pagos/PAG999/rechazar');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', false);
  });

  test('debe retornar 500 si el service falla inesperadamente', async () => {
    rechazarPagoService.mockRejectedValue(new Error('Error de base de datos'));

    const response = await request(app).patch('/pagos/PAG001/rechazar');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', false);
    expect(response.body).toHaveProperty('error', 'Error interno del servidor');
  });
});
