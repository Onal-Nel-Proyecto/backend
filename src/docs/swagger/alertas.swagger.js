export const alertasPaths = {
  '/alertas': {
    get: {
      tags: ['Alertas'],
      summary: 'Listar alertas',
      description: 'Obtiene las alertas del sistema (stock bajo, pedidos atrasados, etc.).',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'pagina', schema: { type: 'integer' }, description: 'Número de página' },
        { in: 'query', name: 'limite', schema: { type: 'integer' }, description: 'Registros por página' },
        { in: 'query', name: 'estado', schema: { type: 'string' }, description: 'Filtrar por estado' },
        { in: 'query', name: 'tipo', schema: { type: 'string' }, description: 'Filtrar por tipo' },
      ],
      responses: {
        200: { description: 'Lista de alertas' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
  },
};

export const alertasSchemas = {};
