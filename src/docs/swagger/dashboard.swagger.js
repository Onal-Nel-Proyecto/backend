export const dashboardPaths = {
  '/dashboard/resumen': {
    get: {
      tags: ['Dashboard'],
      summary: 'Resumen del dashboard',
      description: 'Obtiene indicadores generales del sistema.',
      security: [{ cookieAuth: [] }],
      responses: {
        200: { description: 'Resumen del dashboard' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
  },
  '/dashboard/pedidos': {
    get: {
      tags: ['Dashboard'],
      summary: 'Pedidos del dashboard',
      description: 'Obtiene los pedidos recientes para el dashboard.',
      security: [{ cookieAuth: [] }],
      responses: {
        200: { description: 'Lista de pedidos del dashboard' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
  },
};

export const dashboardSchemas = {};
