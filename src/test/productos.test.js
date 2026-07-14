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
  isAdmin: (req, _res, next) => next(),
  isAdminOrSelf: (req, _res, next) => next()
}));

jest.unstable_mockModule('../services/productos.service.js', () => ({
  getAllProductosService: jest.fn(),
  getProductoByIdService: jest.fn(),
  createProductoService: jest.fn(),
  updateProductoService: jest.fn(),
  changeProductoEstadoService: jest.fn()
}));

// =====================================================
// 2. IMPORTS
// =====================================================

const { default: app } = await import('../app.js');

const productosService = await import('../services/productos.service.js');

// =====================================================
// 3. DATOS DE PRUEBA
// =====================================================

const PRODUCTO_ID = 'PR001';
const PRODUCTO_VALIDO = {
  nombre: 'Camisa Oxford',
  precioUnitario: 85000,
  descripcion: 'Camisa de vestir manga larga',
  genero: 'M',
  categoriaId: 1,
  tipoPrenda: 'CAMISA',
  tipoProducto: 'INVENTARIO',
  umbralMinimo: 5,
  talla: 'M'
};

// =====================================================
// 4. TESTS: GET /productos
// =====================================================

describe('GET /productos', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe retornar lista paginada con código 200', async () => {
    productosService.getAllProductosService.mockResolvedValue({
      data: [
        { id: PRODUCTO_ID, nombre: 'Camisa Oxford', precioUnitario: 85000, stock: 10, estado: 1 }
      ],
      meta: { pagina_actual: 1, paginas_totales: 1, total: 1, limite: 15 }
    });

    const res = await request(app).get('/productos');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toBeDefined();
  });

  test('debe pasar filtros opcionales al servicio', async () => {
    productosService.getAllProductosService.mockResolvedValue({ data: [], meta: { pagina_actual: 1, paginas_totales: 1, total: 0, limite: 15 } });

    await request(app).get('/productos?nombre=Camisa&estado=1&categoria=Camisería&tipoProducto=INVENTARIO');

    expect(productosService.getAllProductosService).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Camisa',
        estado: '1',
        categoria: 'Camisería',
        tipoProducto: 'INVENTARIO'
      })
    );
  });

  test('debe rechazar pagina no numérica con 400', async () => {
    const res = await request(app).get('/productos?pagina=abc');

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('debe rechazar limite mayor a 100 con 400', async () => {
    const res = await request(app).get('/productos?limite=500');

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('limite');
  });

  test('debe rechazar estado fuera de rango con 400', async () => {
    const res = await request(app).get('/productos?estado=5');

    expect(res.status).toBe(400);
  });

  test('debe rechazar tipoProducto inválido con 400', async () => {
    const res = await request(app).get('/productos?tipoProducto=OTRO');

    expect(res.status).toBe(400);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    productosService.getAllProductosService.mockRejectedValue(new Error('Error BD'));

    const res = await request(app).get('/productos');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 5. TESTS: GET /productos/:id
// =====================================================

describe('GET /productos/:id', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe retornar un producto por ID con 200', async () => {
    productosService.getProductoByIdService.mockResolvedValue({
      data: { id: PRODUCTO_ID, nombre: 'Camisa Oxford', precioUnitario: 85000, stock: 10, estado: 1 }
    });

    const res = await request(app).get(`/productos/${PRODUCTO_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.id).toBe(PRODUCTO_ID);
  });

  test('debe retornar 404 si el producto no existe', async () => {
    productosService.getProductoByIdService.mockResolvedValue({
      err: 'Producto no encontrado',
      errorCode: 404
    });

    const res = await request(app).get('/productos/INEXISTENTE');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: false, error: 'Producto no encontrado' });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    productosService.getProductoByIdService.mockRejectedValue(new Error('Error consulta'));

    const res = await request(app).get(`/productos/${PRODUCTO_ID}`);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 6. TESTS: POST /productos
// =====================================================

describe('POST /productos', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe crear un producto y retornar 201', async () => {
    productosService.createProductoService.mockResolvedValue({
      msg: 'Producto creado correctamente',
      id: PRODUCTO_ID
    });

    const res = await request(app)
      .post('/productos')
      .send(PRODUCTO_VALIDO);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe(true);
    expect(res.body.id).toBe(PRODUCTO_ID);
  });

  test('debe retornar 400 si falta nombre', async () => {
    const { nombre, ...sinNombre } = PRODUCTO_VALIDO;
    const res = await request(app)
      .post('/productos')
      .send(sinNombre);

    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si precioUnitario es negativo', async () => {
    const res = await request(app)
      .post('/productos')
      .send({ ...PRODUCTO_VALIDO, precioUnitario: -100 });

    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si precioUnitario es 0', async () => {
    const res = await request(app)
      .post('/productos')
      .send({ ...PRODUCTO_VALIDO, precioUnitario: 0 });

    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si tipoProducto es inválido', async () => {
    const res = await request(app)
      .post('/productos')
      .send({ ...PRODUCTO_VALIDO, tipoProducto: 'OTRO' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('tipoProducto');
  });

  test('debe retornar 400 si género es inválido', async () => {
    const res = await request(app)
      .post('/productos')
      .send({ ...PRODUCTO_VALIDO, genero: 'X' });

    expect(res.status).toBe(400);
  });

  test('debe retornar el error del servicio (categoría no existe)', async () => {
    productosService.createProductoService.mockResolvedValue({
      err: 'La categoría especificada no existe',
      errorCode: 400
    });

    const res = await request(app)
      .post('/productos')
      .send(PRODUCTO_VALIDO);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: false, error: 'La categoría especificada no existe' });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    productosService.createProductoService.mockRejectedValue(new Error('Error crítico'));

    const res = await request(app)
      .post('/productos')
      .send(PRODUCTO_VALIDO);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });

  test('debe aceptar mayúsculas/minúsculas en tipoProducto (normaliza a mayúsculas)', async () => {
    productosService.createProductoService.mockResolvedValue({
      msg: 'Producto creado correctamente',
      id: PRODUCTO_ID
    });

    const res = await request(app)
      .post('/productos')
      .send({ ...PRODUCTO_VALIDO, tipoProducto: 'inventario' });

    expect(res.status).toBe(201);
  });

  test('debe aceptar mayúsculas/minúsculas en género (normaliza a mayúsculas)', async () => {
    productosService.createProductoService.mockResolvedValue({
      msg: 'Producto creado correctamente',
      id: PRODUCTO_ID
    });

    const res = await request(app)
      .post('/productos')
      .send({ ...PRODUCTO_VALIDO, genero: 'm' });

    expect(res.status).toBe(201);
  });
});

// =====================================================
// 7. TESTS: PUT /productos/:id
// =====================================================

describe('PUT /productos/:id', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  const datosActualizacion = {
    nombre: 'Camisa actualizada',
    precioUnitario: 95000,
    descripcion: 'Descripción actualizada',
    genero: 'F',
    categoriaId: 2,
    tipoPrenda: 'CAMISA',
    umbralMinimo: 10,
    talla: 'L'
  };

  test('debe actualizar y retornar 200', async () => {
    productosService.updateProductoService.mockResolvedValue({
      msg: 'Producto actualizado correctamente'
    });

    const res = await request(app)
      .put(`/productos/${PRODUCTO_ID}`)
      .send(datosActualizacion);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: true, msg: 'Producto actualizado correctamente' });
  });

  test('debe retornar 400 si falta nombre', async () => {
    const { nombre, ...sinNombre } = datosActualizacion;
    const res = await request(app)
      .put(`/productos/${PRODUCTO_ID}`)
      .send(sinNombre);

    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si precioUnitario es negativo', async () => {
    const res = await request(app)
      .put(`/productos/${PRODUCTO_ID}`)
      .send({ ...datosActualizacion, precioUnitario: -1 });

    expect(res.status).toBe(400);
  });

  test('debe retornar 404 si el producto no existe', async () => {
    productosService.updateProductoService.mockResolvedValue({
      err: 'Producto no encontrado',
      errorCode: 404
    });

    const res = await request(app)
      .put('/productos/INEXISTENTE')
      .send(datosActualizacion);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: false, error: 'Producto no encontrado' });
  });

  test('debe retornar 500 si el servicio falla', async () => {
    productosService.updateProductoService.mockRejectedValue(new Error('Error'));

    const res = await request(app)
      .put(`/productos/${PRODUCTO_ID}`)
      .send(datosActualizacion);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});

// =====================================================
// 8. TESTS: PATCH /productos/:id/estado
// =====================================================

describe('PATCH /productos/:id/estado', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  test('debe cambiar estado a activo (1) y retornar 200', async () => {
    productosService.changeProductoEstadoService.mockResolvedValue({
      msg: 'Producto activado'
    });

    const res = await request(app)
      .patch(`/productos/${PRODUCTO_ID}/estado`)
      .send({ estado: 1 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: true, msg: 'Producto activado' });
  });

  test('debe cambiar estado a inactivo (3) y retornar 200', async () => {
    productosService.changeProductoEstadoService.mockResolvedValue({
      msg: 'Producto desactivado'
    });

    const res = await request(app)
      .patch(`/productos/${PRODUCTO_ID}/estado`)
      .send({ estado: 3 });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
  });

  test('debe retornar 400 si el estado es 0', async () => {
    const res = await request(app)
      .patch(`/productos/${PRODUCTO_ID}/estado`)
      .send({ estado: 0 });

    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si el estado es 4 (fuera de rango)', async () => {
    const res = await request(app)
      .patch(`/productos/${PRODUCTO_ID}/estado`)
      .send({ estado: 4 });

    expect(res.status).toBe(400);
  });

  test('debe retornar 400 si el estado no es numérico', async () => {
    const res = await request(app)
      .patch(`/productos/${PRODUCTO_ID}/estado`)
      .send({ estado: 'invalido' });

    expect(res.status).toBe(400);
  });

  test('debe retornar 404 si el producto no existe', async () => {
    productosService.changeProductoEstadoService.mockResolvedValue({
      err: 'Producto no encontrado',
      errorCode: 404
    });

    const res = await request(app)
      .patch('/productos/INEXISTENTE/estado')
      .send({ estado: 2 });

    expect(res.status).toBe(404);
  });

  test('debe retornar 500 si el servicio falla', async () => {
    productosService.changeProductoEstadoService.mockRejectedValue(new Error('Error'));

    const res = await request(app)
      .patch(`/productos/${PRODUCTO_ID}/estado`)
      .send({ estado: 1 });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: false, error: 'Error interno del servidor' });
  });
});
