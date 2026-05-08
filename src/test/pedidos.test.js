import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock del servicio ANTES de importar las rutas
jest.unstable_mockModule('../services/dt_pedido.service.js', () => ({
  actualizarDetalle: jest.fn()
}));

// Ahora importamos dinámicamente las rutas (que internamente usan el servicio mockeado)
const pedidoDetalleRoutes = (await import('../routes/pedidos.route.js'));

const app = express();
app.use(express.json());
app.use('/pedidos', pedidoDetalleRoutes);

describe('PATCH /pedidos/:id/detalles/:id_detalle', () => {

  // Obtenemos una referencia al mock del servicio para controlar su comportamiento
  let mockActualizarDetalle;

  beforeAll(async () => {
    const module = await import('../services/dt_pedido.service.js');
    mockActualizarDetalle = module.actualizarDetalle;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería actualizar el detalle exitosamente', async () => {
    const mockData = {
      detalle_id: 'DP00001',
      pedido_id: 'PE001',
      cantidad: 3,
      observacion: 'Cambio de medidas'
    };
    mockActualizarDetalle.mockResolvedValue(mockData);

    const body = {
      cantidad: 3,
      observacion: 'Cambio de medidas',
      producto: {
        nombre: 'Camisa actualizada',
        precio: 42000
      },
      medidas: [
        { medida_id: 1, medida_valor: 32.0 },
        { medida_id: 2, medida_valor: 45.5 }
      ]
    };

    const res = await request(app)
      .patch('/pedidos/PE001/detalles/DP00001')
      .send(body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: true,
      msg: 'Detalle de pedido actualizado exitosamente',
      data: mockData
    });
    expect(mockActualizarDetalle).toHaveBeenCalledWith(
      'PE001',
      'DP00001',
      body
    );
  });

  it('debería retornar error si el pedido no existe', async () => {
    mockActualizarDetalle.mockRejectedValue(new Error('El pedido no existe'));

    const res = await request(app)
      .patch('/pedidos/PE999/detalles/DP00001')
      .send({ cantidad: 1 });

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      status: false,
      msg: 'El pedido no existe'
    });
  });

  it('debería fallar si no se envía ID de pedido o detalle', async () => {
    const res = await request(app).patch('/pedidos//detalles/').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe(false);
    expect(res.body.msg).toMatch(/requerido/);
  });

  it('debería fallar si cantidad no es un entero positivo', async () => {
    const res = await request(app)
      .patch('/pedidos/PE001/detalles/DP00001')
      .send({ cantidad: -1 });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe(false);
    expect(res.body.msg).toMatch(/cantidad/);
  });

  it('debería fallar si producto.precio no es positivo', async () => {
    const res = await request(app)
      .patch('/pedidos/PE001/detalles/DP00001')
      .send({ producto: { precio: 0 } });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe(false);
    expect(res.body.msg).toMatch(/precio/);
  });

  it('debería fallar si medidas no es un array', async () => {
    const res = await request(app)
      .patch('/pedidos/PE001/detalles/DP00001')
      .send({ medidas: 'incorrecto' });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe(false);
    expect(res.body.msg).toMatch(/medidas/);
  });

  it('debería manejar errores internos del servidor', async () => {
    mockActualizarDetalle.mockRejectedValue(new Error('Error interno'));

    const res = await request(app)
      .patch('/pedidos/PE001/detalles/DP00001')
      .send({ cantidad: 2 });

    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBe(false);
    expect(res.body.msg).toBe('Error interno');
  });
});