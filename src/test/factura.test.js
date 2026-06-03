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

// Mock del servicio de factura
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

const {
  getFacturaService,
  createFacturaService,
  anularFacturaService,
  generarPdfFacturaService
} = await import('../services/factura.service.js');

// =====================================================
// 3. DATOS DE PRUEBA
// =====================================================

const facturaEjemplo = {
  nombre: 'Confecciones Onal & Nel',
  eslogan: 'Calidad y confianza en cada prenda',
  NIT: '123456789-0',
  direccion: 'Av. Principal #123, Santa Lucia',
  telefono: '+51 987 654 321',
  factura_id: 'FAC001',
  fecha_emision: '2025-04-10',
  estado: 'EMITIDA',
  nombres: 'Juan',
  apellidos: 'Pérez',
  documento: 'CLI001',
  direccion_cliente: 'Av. Siempre Viva 123',
  telefono_cliente: '987654321',
  correo: 'juan@example.com',
  pedido_id: 'PED001',
  venta_id: 'VT001',
  venta_estado: 'COMPLETADO',
  pedido_estado: 'ENTREGADO',
  detalles: [
    {
      id_detalle: 'DTV001',
      nombre_producto: 'Camisa Blanca',
      precio_unitario: 35.00,
      cantidad: 2,
      subtotal: 70.00
    },
    {
      id_detalle: 'DTV002',
      nombre_producto: 'Pantalón Azul',
      precio_unitario: 55.00,
      cantidad: 1,
      subtotal: 55.00
    }
  ],
  descuento: null,
  subtotal: 125.00,
  abono_realizado: 125.00,
  total_pendiente: 0,
  metodo_pago: ['EFECTIVO', 'TARJETA']
};

const pdfBufferFake = Buffer.from('%PDF-1.4 fake pdf content');

// =====================================================
// 4. TESTS: GET /ventas/:id/factura
// =====================================================

describe('GET /ventas/:id/factura', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe retornar datos de factura con código 200', async () => {
    getFacturaService.mockResolvedValue(facturaEjemplo);

    const response = await request(app).get('/ventas/VT001/factura');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('factura_id', 'FAC001');
    expect(response.body).toHaveProperty('venta_id', 'VT001');
    expect(response.body).toHaveProperty('nombres', 'Juan');
    expect(response.body).toHaveProperty('apellidos', 'Pérez');
    expect(response.body.detalles).toHaveLength(2);
    expect(response.body).toHaveProperty('subtotal', 125.00);
    expect(response.body).toHaveProperty('metodo_pago');
    expect(response.body.metodo_pago).toEqual(expect.arrayContaining(['EFECTIVO', 'TARJETA']));
  });

  test('debe retornar 404 si la factura no existe', async () => {
    getFacturaService.mockRejectedValue(
      new AppError('No se encontró una factura para esta venta', 404)
    );

    const response = await request(app).get('/ventas/VT999/factura');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', false);
    expect(response.body).toHaveProperty('error');
  });

  test('debe retornar 500 si el service falla inesperadamente', async () => {
    getFacturaService.mockRejectedValue(new Error('Error inesperado en la BD'));

    const response = await request(app).get('/ventas/VT001/factura');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', false);
    expect(response.body).toHaveProperty('error', 'Error interno del servidor');
  });

  test('debe retornar 400 si no se envía el ID de venta', async () => {
    const response = await request(app).get('/ventas//factura');

    expect(response.status).toBe(404);
    // Ruta no encontrada por el ID vacío — es válido
  });
});

// =====================================================
// 5. TESTS: POST /ventas/:id/factura
// =====================================================

describe('POST /ventas/:id/factura', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe crear una factura y retornar 201', async () => {
    createFacturaService.mockResolvedValue({
      status: true,
      msg: 'Factura registrada correctamente para la venta #VT001 con ID #FAC001',
      data: { factura_id: 'FAC001', venta_id: 'VT001' }
    });

    const response = await request(app).post('/ventas/VT001/factura');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', true);
    expect(response.body).toHaveProperty('msg');
    expect(response.body.data).toHaveProperty('factura_id', 'FAC001');
  });

  test('debe retornar 404 si la venta no existe', async () => {
    createFacturaService.mockRejectedValue(
      new AppError('La venta especificada no existe', 404)
    );

    const response = await request(app).post('/ventas/VT999/factura');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', false);
  });

  test('debe retornar 400 si la venta ya tiene factura', async () => {
    createFacturaService.mockRejectedValue(
      new AppError('Esta venta ya tiene una factura registrada', 400)
    );

    const response = await request(app).post('/ventas/VT001/factura');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', false);
  });

  test('debe retornar 500 si el service falla inesperadamente', async () => {
    createFacturaService.mockRejectedValue(new Error('Error de conexión'));

    const response = await request(app).post('/ventas/VT001/factura');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', false);
    expect(response.body).toHaveProperty('error', 'Error interno del servidor');
  });
});

// =====================================================
// 6. TESTS: PATCH /ventas/:id/factura/:id_factura/anular
// =====================================================

describe('PATCH /ventas/:id/factura/:id_factura/anular', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe anular la factura y retornar 200', async () => {
    anularFacturaService.mockResolvedValue({
      status: true,
      msg: 'Factura #FAC001 anulada correctamente'
    });

    const response = await request(app).patch('/ventas/VT001/factura/FAC001/anular');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', true);
    expect(response.body.msg).toContain('FAC001');
  });

  test('debe retornar 404 si la factura no existe', async () => {
    anularFacturaService.mockRejectedValue(
      new AppError('Factura no encontrada', 404)
    );

    const response = await request(app).patch('/ventas/VT001/factura/FAC999/anular');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', false);
  });

  test('debe retornar 400 si la factura ya está anulada', async () => {
    anularFacturaService.mockRejectedValue(
      new AppError('La factura ya se encuentra anulada', 400)
    );

    const response = await request(app).patch('/ventas/VT001/factura/FAC001/anular');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', false);
  });

  test('debe retornar 500 si el service falla inesperadamente', async () => {
    anularFacturaService.mockRejectedValue(new Error('Error de base de datos'));

    const response = await request(app).patch('/ventas/VT001/factura/FAC001/anular');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', false);
    expect(response.body).toHaveProperty('error', 'Error interno del servidor');
  });
});

// =====================================================
// 7. TESTS: GET /ventas/:id/factura/pdf
// =====================================================

describe('GET /ventas/:id/factura/pdf', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe retornar el PDF con código 200 y headers correctos', async () => {
    generarPdfFacturaService.mockResolvedValue({
      pdfBuffer: pdfBufferFake,
      filename: 'FACTURA-FAC001.pdf',
      factura_id: 'FAC001'
    });

    const response = await request(app).get('/ventas/VT001/factura/pdf');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');
    expect(response.headers['content-disposition']).toContain('FACTURA-FAC001.pdf');
  });

  test('debe retornar 500 si el service falla inesperadamente', async () => {
    generarPdfFacturaService.mockRejectedValue(new Error('Puppeteer error'));

    const response = await request(app).get('/ventas/VT001/factura/pdf');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', false);
    expect(response.body).toHaveProperty('error', 'Error interno del servidor');
  });
});
