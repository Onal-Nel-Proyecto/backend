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
  isAdmin: (req, _res, next) => next()
}));

jest.unstable_mockModule('../services/ventas.service.js', () => ({
  getVentasService: jest.fn(),
  getVentaByIdService: jest.fn(),
  createVentaService: jest.fn(),
  updateVentaService: jest.fn(),
  anularVentaService: jest.fn()
}));

jest.unstable_mockModule('../services/dt_venta.service.js', () => ({
  createDetalleService: jest.fn(),
  deleteDetalleService: jest.fn()
}));

jest.unstable_mockModule('../services/factura.service.js', () => ({
  getFacturaService: jest.fn(),
  createFacturaService: jest.fn(),
  anularFacturaService: jest.fn(),
  generarPdfFacturaService: jest.fn()
}));

// =====================================================
// 2. IMPORTS (después de los mocks)
// =====================================================

const { default: app } = await import('../app.js');
const { AppError } = await import('../utils/appError.js');

const ventasService = await import('../services/ventas.service.js');
const dtVentaService = await import('../services/dt_venta.service.js');

// =====================================================
// 3. DATOS DE PRUEBA
// =====================================================

const ventaEjemplo = {
  venta_id: 'VT001',
  fecha_registro: '2026-05-24',
  estado: 'PENDIENTE',
  total: '85000.00',
  descuento: 0,
  cliente: {
    cliente_id: 'CLI001',
    cliente_nombres: 'Juan',
    cliente_apellidos: 'Pérez'
  },
  fecha_limite_pago: null,
  pagos: {
    total_pagado: 0.00,
    total_pendiente: 85000.00
  },
  pedido_id: null
};

const detalleEjemplo = {
  detalle_id: 'DT001',
  producto: {
    producto_id: 'PR001',
    producto_nombre: 'Tela Algodón'
  },
  cantidad: 2,
  precio: 25000.00,
  subtotal: 50000.00
};

const ventaCompletaEjemplo = {
  venta_id: 'VT001',
  fecha_registro: '2026-05-24',
  estado: 'PENDIENTE',
  total: '85000.00',
  descuento: 0,
  cliente: {
    cliente_id: 'CLI001',
    cliente_nombres: 'Juan',
    cliente_apellidos: 'Pérez'
  },
  usuario: {
    user_id: 'US001',
    user_nombres: 'Admin',
    user_apellidos: 'Test'
  },
  fecha_limite_pago: null,
  pedido_id: null,
  detalles: {
    meta: { paginas_totales: 1, pagina_actual: 1, total: 1, limite: 15 },
    data: [detalleEjemplo]
  }
};

const metaEjemplo = {
  paginas_totales: 1,
  pagina_actual: 1,
  total: 1,
  limite: 15
};

// =====================================================
// 4. TESTS: GET /ventas
// =====================================================

describe('GET /ventas', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe retornar lista paginada con código 200', async () => {
    ventasService.getVentasService.mockResolvedValue({
      meta: metaEjemplo,
      data: [ventaEjemplo]
    });

    const res = await request(app).get('/ventas');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('paginas_totales', 1);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toHaveProperty('venta_id', 'VT001');
    expect(res.body.data[0]).toHaveProperty('cliente');
    expect(res.body.data[0]).toHaveProperty('pagos');
  });

  test('debe pasar filtros al servicio', async () => {
    ventasService.getVentasService.mockResolvedValue({
      meta: metaEjemplo,
      data: [ventaEjemplo]
    });

    await request(app).get(
      '/ventas?fecha_registro=2026-05-24&cliente=Juan&pagina=1&limite=15'
    );

    expect(ventasService.getVentasService).toHaveBeenCalledWith(
      '1', '15',
      expect.objectContaining({
        fecha_registro: '2026-05-24',
        cliente: 'Juan'
      })
    );
  });

  test('debe retornar lista vacía cuando no hay ventas', async () => {
    ventasService.getVentasService.mockResolvedValue({
      meta: { paginas_totales: 0, pagina_actual: 1, total: 0, limite: 15 },
      data: []
    });

    const res = await request(app).get('/ventas');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  test('debe rechazar fecha_registro inválida con 400', async () => {
    const res = await request(app).get('/ventas?fecha_registro=no-es-fecha');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveProperty('fecha_registro');
  });

  test('debe retornar 500 si el servicio falla', async () => {
    ventasService.getVentasService.mockRejectedValue(new Error('Error BD'));

    const res = await request(app).get('/ventas');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: false,
      error: 'Error interno del servidor'
    });
  });
});

// =====================================================
// 5. TESTS: POST /ventas
// =====================================================

describe('POST /ventas', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  const ventaValida = {
    cliente_id: 'CLI001',
    fecha_limite_pago: null,
    descuento: 0,
    detalles: [
      { producto_id: 'PR001', cantidad: 2, precio: 25000 },
      { producto_id: 'PR002', cantidad: 1, precio: 35000 }
    ],
    pagos: [
      { monto: 50000, metodo_pago: 'EFECTIVO' }
    ]
  };

  test('debe crear una venta y retornar 201', async () => {
    ventasService.createVentaService.mockResolvedValue({
      status: true,
      msg: 'Se registró con éxito la venta con el ID #VT001'
    });

    const res = await request(app)
      .post('/ventas')
      .send(ventaValida);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', true);
    expect(res.body.msg).toContain('VT001');
  });

  test('debe crear una venta sin pagos', async () => {
    ventasService.createVentaService.mockResolvedValue({
      status: true,
      msg: 'Se registró con éxito la venta con el ID #VT002'
    });

    const res = await request(app)
      .post('/ventas')
      .send({
        cliente_id: 'CLI001',
        descuento: null,
        detalles: [
          { producto_id: 'PR001', cantidad: 1, precio: 50000 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe(true);
  });

  test('debe retornar 400 si falta cliente_id', async () => {
    const res = await request(app)
      .post('/ventas')
      .send({
        detalles: [{ producto_id: 'PR001', cantidad: 1, precio: 50000 }]
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveProperty('cliente_id');
  });

  test('debe retornar 400 si detalles está vacío', async () => {
    const res = await request(app)
      .post('/ventas')
      .send({
        cliente_id: 'CLI001',
        detalles: []
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('detalles');
  });

  test('debe retornar 400 si falta producto_id en un detalle', async () => {
    const res = await request(app)
      .post('/ventas')
      .send({
        cliente_id: 'CLI001',
        detalles: [
          { cantidad: 1, precio: 50000 }
        ]
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty(['detalles[0].producto_id']);
  });

  test('debe retornar 400 si cantidad en detalle es 0', async () => {
    const res = await request(app)
      .post('/ventas')
      .send({
        cliente_id: 'CLI001',
        detalles: [
          { producto_id: 'PR001', cantidad: 0, precio: 50000 }
        ]
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty(['detalles[0].cantidad']);
  });

  test('debe retornar 400 si precio en detalle es 0', async () => {
    const res = await request(app)
      .post('/ventas')
      .send({
        cliente_id: 'CLI001',
        detalles: [
          { producto_id: 'PR001', cantidad: 1, precio: 0 }
        ]
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty(['detalles[0].precio']);
  });

  test('debe retornar 400 si se envía pago sin monto', async () => {
    const res = await request(app)
      .post('/ventas')
      .send({
        cliente_id: 'CLI001',
        detalles: [{ producto_id: 'PR001', cantidad: 1, precio: 50000 }],
        pagos: [{ metodo_pago: 'EFECTIVO' }]
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty(['pagos[0].monto']);
  });

  test('debe retornar 400 si se envía pago sin metodo_pago', async () => {
    const res = await request(app)
      .post('/ventas')
      .send({
        cliente_id: 'CLI001',
        detalles: [{ producto_id: 'PR001', cantidad: 1, precio: 50000 }],
        pagos: [{ monto: 50000 }]
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty(['pagos[0].metodo_pago']);
  });

  test('debe retornar 400 si metodo_pago es inválido', async () => {
    const res = await request(app)
      .post('/ventas')
      .send({
        cliente_id: 'CLI001',
        detalles: [{ producto_id: 'PR001', cantidad: 1, precio: 50000 }],
        pagos: [{ monto: 50000, metodo_pago: 'CRIPTO' }]
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty(['pagos[0].metodo_pago']);
  });

  test('debe retornar el error del servicio (cliente no existe)', async () => {
    ventasService.createVentaService.mockRejectedValue(
      new AppError('El cliente especificado no existe', 400)
    );

    const res = await request(app)
      .post('/ventas')
      .send(ventaValida);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      status: false,
      error: 'El cliente especificado no existe'
    });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    ventasService.createVentaService.mockRejectedValue(new Error('Error BD'));

    const res = await request(app)
      .post('/ventas')
      .send(ventaValida);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: false,
      error: 'Error interno del servidor'
    });
  });
});

// =====================================================
// 6. TESTS: GET /ventas/:id
// =====================================================

describe('GET /ventas/:id', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe retornar una venta por ID con 200', async () => {
    ventasService.getVentaByIdService.mockResolvedValue(ventaCompletaEjemplo);

    const res = await request(app).get('/ventas/VT001');

    expect(res.status).toBe(200);
    expect(res.body.venta_id).toBe('VT001');
    expect(res.body).toHaveProperty('cliente');
    expect(res.body).toHaveProperty('usuario');
    expect(res.body).toHaveProperty('detalles');
    expect(res.body.detalles).toHaveProperty('meta');
    expect(res.body.detalles).toHaveProperty('data');
    expect(res.body.detalles.data).toHaveLength(1);
  });

  test('debe retornar 404 si la venta no existe', async () => {
    ventasService.getVentaByIdService.mockRejectedValue(
      new AppError('Venta no encontrada', 404)
    );

    const res = await request(app).get('/ventas/INEXISTENTE');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      status: false,
      error: 'Venta no encontrada'
    });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    ventasService.getVentaByIdService.mockRejectedValue(new Error('Error consulta'));

    const res = await request(app).get('/ventas/VT001');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: false,
      error: 'Error interno del servidor'
    });
  });
});

// =====================================================
// 7. TESTS: PATCH /ventas/:id
// =====================================================

describe('PATCH /ventas/:id', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe actualizar descuento y retornar 200', async () => {
    ventasService.updateVentaService.mockResolvedValue({
      status: true,
      msg: 'Se ha actualizado la venta'
    });

    const res = await request(app)
      .patch('/ventas/VT001')
      .send({ descuento: 5000 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: true,
      msg: 'Se ha actualizado la venta'
    });
  });

  test('debe actualizar fecha_limite_pago y retornar 200', async () => {
    ventasService.updateVentaService.mockResolvedValue({
      status: true,
      msg: 'Se ha actualizado la venta'
    });

    const res = await request(app)
      .patch('/ventas/VT001')
      .send({ fecha_limite_pago: '2026-06-30' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
  });

  test('debe retornar 400 si el descuento es negativo', async () => {
    const res = await request(app)
      .patch('/ventas/VT001')
      .send({ descuento: -100 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('debe retornar 400 si fecha_limite_pago no es ISO', async () => {
    const res = await request(app)
      .patch('/ventas/VT001')
      .send({ fecha_limite_pago: '30-06-2026' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('fecha_limite_pago');
  });

  test('debe retornar 404 si la venta no existe', async () => {
    ventasService.updateVentaService.mockRejectedValue(
      new AppError('Venta no encontrada', 404)
    );

    const res = await request(app)
      .patch('/ventas/INEXISTENTE')
      .send({ descuento: 5000 });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      status: false,
      error: 'Venta no encontrada'
    });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    ventasService.updateVentaService.mockRejectedValue(new Error('Error'));

    const res = await request(app)
      .patch('/ventas/VT001')
      .send({ descuento: 5000 });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: false,
      error: 'Error interno del servidor'
    });
  });
});

// =====================================================
// 8. TESTS: DELETE /ventas/:id
// =====================================================

describe('DELETE /ventas/:id', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe anular la venta y retornar 200', async () => {
    ventasService.anularVentaService.mockResolvedValue({
      status: true,
      msg: 'Se ha anulado la venta correctamente'
    });

    const res = await request(app).delete('/ventas/VT001');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', true);
    expect(res.body.msg).toContain('anulado');
  });

  test('debe retornar 404 si la venta no existe', async () => {
    ventasService.anularVentaService.mockRejectedValue(
      new AppError('Venta no encontrada', 404)
    );

    const res = await request(app).delete('/ventas/INEXISTENTE');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      status: false,
      error: 'Venta no encontrada'
    });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    ventasService.anularVentaService.mockRejectedValue(new Error('Error'));

    const res = await request(app).delete('/ventas/VT001');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: false,
      error: 'Error interno del servidor'
    });
  });
});

// =====================================================
// 9. TESTS: POST /ventas/:id/detalles
// =====================================================

describe('POST /ventas/:id/detalles', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  const detalleValido = {
    producto_id: 'PR001',
    cantidad: 2,
    precio: 25000.00
  };

  test('debe crear detalle y retornar 201', async () => {
    dtVentaService.createDetalleService.mockResolvedValue({
      status: true,
      msg: 'Se registró con éxito el detalle de la venta con el ID #DT001'
    });

    const res = await request(app)
      .post('/ventas/VT001/detalles')
      .send(detalleValido);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', true);
    expect(res.body.msg).toContain('DT001');
  });

  test('debe retornar 400 si falta producto_id', async () => {
    const res = await request(app)
      .post('/ventas/VT001/detalles')
      .send({ cantidad: 2, precio: 25000 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('producto_id');
  });

  test('debe retornar 400 si falta cantidad', async () => {
    const res = await request(app)
      .post('/ventas/VT001/detalles')
      .send({ producto_id: 'PR001', precio: 25000 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('cantidad');
  });

  test('debe retornar 400 si falta precio', async () => {
    const res = await request(app)
      .post('/ventas/VT001/detalles')
      .send({ producto_id: 'PR001', cantidad: 2 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('precio');
  });

  test('debe retornar 400 si cantidad es 0', async () => {
    const res = await request(app)
      .post('/ventas/VT001/detalles')
      .send({ producto_id: 'PR001', cantidad: 0, precio: 25000 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('cantidad');
  });

  test('debe retornar 400 si precio es 0', async () => {
    const res = await request(app)
      .post('/ventas/VT001/detalles')
      .send({ producto_id: 'PR001', cantidad: 1, precio: 0 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('precio');
  });

  test('debe retornar el error del servicio (venta no encontrada)', async () => {
    dtVentaService.createDetalleService.mockRejectedValue(
      new AppError('Venta no encontrada', 404)
    );

    const res = await request(app)
      .post('/ventas/INEXISTENTE/detalles')
      .send(detalleValido);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      status: false,
      error: 'Venta no encontrada'
    });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    dtVentaService.createDetalleService.mockRejectedValue(new Error('Error'));

    const res = await request(app)
      .post('/ventas/VT001/detalles')
      .send(detalleValido);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: false,
      error: 'Error interno del servidor'
    });
  });
});

// =====================================================
// 10. TESTS: DELETE /ventas/:id/detalles/:id_detalle
// =====================================================

describe('DELETE /ventas/:id/detalles/:id_detalle', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe eliminar detalle y retornar 200', async () => {
    dtVentaService.deleteDetalleService.mockResolvedValue({
      status: true,
      msg: 'Detalle eliminado correctamente'
    });

    const res = await request(app).delete('/ventas/VT001/detalles/DT001');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: true,
      msg: 'Detalle eliminado correctamente'
    });
  });

  test('debe pasar el usuario de sesión al servicio', async () => {
    dtVentaService.deleteDetalleService.mockResolvedValue({
      status: true,
      msg: 'Detalle eliminado correctamente'
    });

    await request(app).delete('/ventas/VT001/detalles/DT001');

    expect(dtVentaService.deleteDetalleService).toHaveBeenCalledWith(
      'VT001', 'DT001', 'US001'
    );
  });

  test('debe retornar 404 si el detalle no pertenece a la venta', async () => {
    dtVentaService.deleteDetalleService.mockRejectedValue(
      new AppError('El detalle no pertenece a la venta especificada', 400)
    );

    const res = await request(app).delete('/ventas/VT001/detalles/DT999');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      status: false,
      error: 'El detalle no pertenece a la venta especificada'
    });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    dtVentaService.deleteDetalleService.mockRejectedValue(new Error('Error'));

    const res = await request(app).delete('/ventas/VT001/detalles/DT001');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: false,
      error: 'Error interno del servidor'
    });
  });
});
