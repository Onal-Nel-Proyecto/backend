import { jest } from '@jest/globals';
import request from 'supertest';
import db from '../config/db.js';

jest.unstable_mockModule(
  '../middleware/auth.middleware.js',
  () => ({

    authValidator: (req, res, next) => {

      req.user = {
        id: 'US001',
        rol: 'ADMINISTRADOR'
      };

      next();

    },

    isAdmin: (req, res, next) => next()

  })
);

const { default: app } = await import('../app.js');

describe('GET /pedidos', () => {

  afterAll(async () => {

    await db.end();

  });

  test('Debe retornar pedidos', async () => {

    const response = await request(app)
      .get('/pedidos');

    expect(response.status).toBe(200);

  });

});