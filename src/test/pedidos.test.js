import { jest } from '@jest/globals';
import request from 'supertest';

// =====================================================
// Silenciar console.error / console.log en tests esperados
// para que no aparezcan en la salida cuando probamos
// errores controlados
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

jest.unstable_mockModule('../services/pedidos.service.js', () => ({
  getAllPedidosService: jest.fn(),
  createNewPedido: jest.fn(),
  getPedidoByIdService: jest.fn(),
  updatePedidoService: jest.fn(),
  cancelPedidoService: jest.fn()
}));

jest.unstable_mockModule('../services/dt_pedido.service.js', () => ({
  crearDetalle: jest.fn(),
  eliminarDetalle: jest.fn(),
  actualizarDetalleService: jest.fn()
}));

jest.unstable_mockModule('../services/produccion.service.js', () => ({
  createNewProduction: jest.fn(),
  updateProduction: jest.fn(),
  deleteProduction: jest.fn()
}));

// =====================================================
// 2. IMPORTS (después de los mocks)
// =====================================================

const { default: app } = await import('../app.js');

const pedidosService = await import('../services/pedidos.service.js');
const dtPedidoService = await import('../services/dt_pedido.service.js');
const produccionService = await import('../services/produccion.service.js');

// =====================================================
// 3. DATOS DE PRUEBA
// =====================================================

const mañana = new Date();
mañana.setDate(mañana.getDate() + 1);
const fechaFutura = mañana.toISOString().split('T')[0];

// ID de cliente con 7 caracteres (mínimo exigido por el validador)
const CLIENTE_ID = 'CLI0001';

// =====================================================
// 4. TESTS: GET /pedidos
// =====================================================

describe('GET /pedidos', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe retornar lista paginada con código 200', async () => {
    pedidosService.getAllPedidosService.mockResolvedValue({
      maxPag: 2,
      pagAct: 1,
      data: [
        {
          id: 'PD001',
          descripcion: 'Pedido de prueba',
          cliente_nombres: 'Juan Pérez',
          fecha_entrega_estimada: '15/6/2026',
          estado: 'pendiente',
          dias_faltantes: 30
        }
      ]
    });

    const res = await request(app).get('/pedidos');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveLength(1);
  });

  test('debe pasar los filtros al servicio', async () => {
    pedidosService.getAllPedidosService.mockResolvedValue({ maxPag: 1, pagAct: 1, data: [] });

    await request(app).get('/pedidos?estado=pendiente&cliente=Juan&tipo_pedido=personalizado');

    expect(pedidosService.getAllPedidosService).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        estado: 'pendiente',
        cliente: 'Juan',
        fecha_desde: undefined,
        fecha_hasta: undefined,
        tipo_pedido: 'personalizado'
      })
    );
  });

  test('debe rechazar estado inválido con 400', async () => {
    const res = await request(app).get('/pedidos?estado=invalido');

    expect(res.status).toBe(400);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    pedidosService.getAllPedidosService.mockRejectedValue(new Error('Error BD'));

    const res = await request(app).get('/pedidos');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 5. TESTS: POST /pedidos
// =====================================================

describe('POST /pedidos', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  const pedidoValido = {
    cliente_id: CLIENTE_ID,
    fecha_estimada: fechaFutura,
    observaciones: 'Sin observaciones',
    tipo_pedido: 'personalizado',
    descripcion: 'Traje a medida'
  };

  test('debe crear un pedido y retornar 201', async () => {
    pedidosService.createNewPedido.mockResolvedValue({
      data: {
        pedido_id: 'PD001'
      }
    });

    const res = await request(app)
      .post('/pedidos')
      .send(pedidoValido);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe(true);
    expect(res.body.data).toBe('PD001');
  });

  test('debe retornar 400 si falta cliente_id', async () => {
    const res = await request(app)
      .post('/pedidos')
      .send({ descripcion: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('debe retornar 400 si cliente_id es muy corto', async () => {
    const res = await request(app)
      .post('/pedidos')
      .send({ cliente_id: 'C1' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('debe retornar 400 si tipo_pedido es inválido', async () => {
    const res = await request(app)
      .post('/pedidos')
      .send({
        cliente_id: 'CLI001',
        tipo_pedido: 'inexistente'
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('tipo_pedido');
  });

  test('debe retornar el error del servicio (cliente no encontrado)', async () => {
    pedidosService.createNewPedido.mockResolvedValue({
      err: 'Cliente no encontrado',
      errorCode: 404
    });

    const res = await request(app)
      .post('/pedidos')
      .send(pedidoValido);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: false, error: 'Cliente no encontrado' });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    pedidosService.createNewPedido.mockRejectedValue(new Error('Error crítico'));

    const res = await request(app)
      .post('/pedidos')
      .send(pedidoValido);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 6. TESTS: GET /pedidos/:id
// =====================================================

describe('GET /pedidos/:id', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe retornar un pedido por ID con 200', async () => {
    pedidosService.getPedidoByIdService.mockResolvedValue({
      pedido_id: 'PD001',
      cliente: { cliente_id: 'CLI001', cliente_nombres: 'Juan Pérez' },
      usuario_creador: { user_id: 'US001', user_nombres: 'Admin Test' },
      descripcion: 'Traje a medida',
      estado: 'pendiente',
      observacion: null,
      fecha_estimada_entrega: fechaFutura,
      fecha_entrega: null,
      fecha_ingreso: '2025-01-15',
      fotos_pedido: [],
      detalles_pedido: [],
      pagos: []
    });

    const res = await request(app).get('/pedidos/PD001');

    expect(res.status).toBe(200);
    expect(res.body.pedido_id).toBe('PD001');
  });

  test('debe retornar 404 si el pedido no existe', async () => {
    pedidosService.getPedidoByIdService.mockResolvedValue({
      err: 'Pedido no encontrado',
      errorCode: 404
    });

    const res = await request(app).get('/pedidos/INEXISTENTE');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: false, error: 'Pedido no encontrado' });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    pedidosService.getPedidoByIdService.mockRejectedValue(new Error('Error consulta'));

    const res = await request(app).get('/pedidos/PD001');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 7. TESTS: PUT /pedidos/:id
// =====================================================

describe('PUT /pedidos/:id', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  const datosActualizacion = {
    cliente_id: CLIENTE_ID,
    descripcion: 'Pedido actualizado'
  };

  test('debe actualizar y retornar 200', async () => {
    pedidosService.updatePedidoService.mockResolvedValue({ status: true });

    const res = await request(app)
      .put('/pedidos/PD001')
      .send(datosActualizacion);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: true,
      msg: 'Se actualizó con éxito el pedido'
    });
  });

  test('debe retornar el error del servicio (pedido no encontrado)', async () => {
    pedidosService.updatePedidoService.mockResolvedValue({
      err: 'Pedido no encontrado',
      errorCode: 404
    });

    const res = await request(app)
      .put('/pedidos/INEXISTENTE')
      .send(datosActualizacion);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: false, error: 'Pedido no encontrado' });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    pedidosService.updatePedidoService.mockRejectedValue(new Error('Error'));

    const res = await request(app)
      .put('/pedidos/PD001')
      .send(datosActualizacion);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 8. TESTS: PATCH /pedidos/:id/cancelar
// =====================================================

describe('PATCH /pedidos/:id/cancelar', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe cancelar y retornar 200', async () => {
    pedidosService.cancelPedidoService.mockResolvedValue({ status: true });

    const res = await request(app)
      .patch('/pedidos/PD001/cancelar')
      .send({ motivo: 'Cliente solicitó cancelación' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: true,
      msg: 'Se ha cancelado el pedido con el código #PD001'
    });
  });

  test('debe retornar 400 si falta el motivo', async () => {
    const res = await request(app)
      .patch('/pedidos/PD001/cancelar')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('motivo');
  });

  test('debe retornar el error del servicio (pedido ya cancelado)', async () => {
    pedidosService.cancelPedidoService.mockResolvedValue({
      err: 'El pedido ya está cancelado',
      errorCode: 400
    });

    const res = await request(app)
      .patch('/pedidos/PD001/cancelar')
      .send({ motivo: 'Ya estaba cancelado' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: false, error: 'El pedido ya está cancelado' });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    pedidosService.cancelPedidoService.mockRejectedValue(new Error('Error'));

    const res = await request(app)
      .patch('/pedidos/PD001/cancelar')
      .send({ motivo: 'Prueba' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 9. TESTS: POST /pedidos/:id/detalles
// =====================================================

describe('POST /pedidos/:id/detalles', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  const detalleValido = {
    producto_id: 'PR001',
    cantidad: 2,
    medidas: [{ medida_id: 1, medida_valor: 42.5 }]
  };

  test('debe crear detalle y retornar 201', async () => {
    dtPedidoService.crearDetalle.mockResolvedValue({ detalleId: 'DT001' });

    const res = await request(app)
      .post('/pedidos/PD001/detalles')
      .send(detalleValido);

    expect(res.status).toBe(201);
    expect(res.body.data.detalle_id).toBe('DT001');
  });

  test('debe retornar 400 si falta cantidad', async () => {
    const res = await request(app)
      .post('/pedidos/PD001/detalles')
      .send({
        producto_id: 'PR001',
        medidas: [{ medida_id: 1, medida_valor: 42.5 }]
      });

    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si no se envía producto_id ni producto', async () => {
    const res = await request(app)
      .post('/pedidos/PD001/detalles')
      .send({
        cantidad: 1,
        medidas: [{ medida_id: 1, medida_valor: 42.5 }]
      });

    expect(res.status).toBe(400);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    dtPedidoService.crearDetalle.mockRejectedValue(new Error('Error interno'));

    const res = await request(app)
      .post('/pedidos/PD001/detalles')
      .send(detalleValido);

    expect(res.status).toBe(500);
  });
});

// =====================================================
// 10. TESTS: DELETE /pedidos/:id/detalles/:id_detalle
// =====================================================

describe('DELETE /pedidos/:id/detalles/:id_detalle', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe eliminar detalle y retornar 200', async () => {
    dtPedidoService.eliminarDetalle.mockResolvedValue(undefined);

    const res = await request(app).delete('/pedidos/PD001/detalles/DT001');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: true,
      msg: 'Detalle de pedido eliminado exitosamente'
    });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    dtPedidoService.eliminarDetalle.mockRejectedValue(new Error('Error'));

    const res = await request(app).delete('/pedidos/PD001/detalles/DT001');

    expect(res.status).toBe(500);
  });
});

// =====================================================
// 11. TESTS: PATCH /pedidos/:id/detalles/:id_detalle
// =====================================================

describe('PATCH /pedidos/:id/detalles/:id_detalle', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe actualizar detalle y retornar 200', async () => {
    dtPedidoService.actualizarDetalleService.mockResolvedValue({ status: true });

    const res = await request(app)
      .patch('/pedidos/PD001/detalles/DT001')
      .send({ cantidad: 3, observacion: 'Aumentar cantidad' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    dtPedidoService.actualizarDetalleService.mockRejectedValue(new Error('Error'));

    const res = await request(app)
      .patch('/pedidos/PD001/detalles/DT001')
      .send({ cantidad: 3 });

    expect(res.status).toBe(500);
  });
});

// =====================================================
// 12. TESTS: POST /pedidos/:id/detalles/:id_detalle/produccion
// =====================================================

describe('POST /pedidos/:id/detalles/:id_detalle/produccion', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  const produccionValida = {
    producto_id: 'PR001',
    detalle_id: 'DT001',
    cantidad: 5
  };

  test('debe registrar producción y retornar 201', async () => {
    produccionService.createNewProduction.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/pedidos/PD001/detalles/DT001/produccion')
      .send(produccionValida);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      status: true,
      msg: 'El detalle del pedido fue agregado a producción.'
    });
  });

  test('debe retornar 400 si falta producto_id', async () => {
    const res = await request(app)
      .post('/pedidos/PD001/detalles/DT001/produccion')
      .send({ cantidad: 5, detalle_id: 'DT001' });

    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si la cantidad es 0', async () => {
    const res = await request(app)
      .post('/pedidos/PD001/detalles/DT001/produccion')
      .send({
        producto_id: 'PR001',
        detalle_id: 'DT001',
        cantidad: 0
      });

    expect(res.status).toBe(400);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    produccionService.createNewProduction.mockRejectedValue(new Error('Error'));

    const res = await request(app)
      .post('/pedidos/PD001/detalles/DT001/produccion')
      .send(produccionValida);

    expect(res.status).toBe(500);
  });
});

// =====================================================
// 13. TESTS: PATCH /pedidos/:id/detalles/:id_detalle/produccion/:id_produccion
// =====================================================

describe('PATCH /pedidos/:id/detalles/:id_detalle/produccion/:id_produccion', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe actualizar producción y retornar 201', async () => {
    produccionService.updateProduction.mockResolvedValue(undefined);

    const res = await request(app)
      .patch('/pedidos/PD001/detalles/DT001/produccion/PRD001')
      .send({ estado: 'EN PROCESO' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      status: true,
      msg: 'Estado de producción actualizado correctamente.'
    });
  });

  test('debe retornar 400 si el estado no es válido', async () => {
    const res = await request(app)
      .patch('/pedidos/PD001/detalles/DT001/produccion/PRD001')
      .send({ estado: 'INEXISTENTE' });

    expect(res.status).toBe(400);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    produccionService.updateProduction.mockRejectedValue(new Error('Error'));

    const res = await request(app)
      .patch('/pedidos/PD001/detalles/DT001/produccion/PRD001')
      .send({ estado: 'TERMINADO' });

    expect(res.status).toBe(500);
  });
});

// =====================================================
// 14. TESTS: DELETE /pedidos/:id/detalles/:id_detalle/produccion/:id_produccion
// =====================================================

describe('DELETE /pedidos/:id/detalles/:id_detalle/produccion/:id_produccion', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe eliminar producción y retornar 200', async () => {
    produccionService.deleteProduction.mockResolvedValue(undefined);

    const res = await request(app)
      .delete('/pedidos/PD001/detalles/DT001/produccion/PRD001');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: true,
      msg: 'Producción cancelada correctamente.'
    });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    produccionService.deleteProduction.mockRejectedValue(new Error('Error'));

    const res = await request(app)
      .delete('/pedidos/PD001/detalles/DT001/produccion/PRD001');

    expect(res.status).toBe(500);
  });
});
