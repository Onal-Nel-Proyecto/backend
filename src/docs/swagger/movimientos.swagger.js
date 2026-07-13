export const movimientosPaths = {
  '/movimientos': {
    get: {
      tags: ['Movimientos'],
      summary: 'Listar movimientos de inventario',
      description: 'Obtiene todos los movimientos de inventario con paginación y filtros.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'pag', schema: { type: 'integer' }, description: 'Número de página' },
        { in: 'query', name: 'usuario', schema: { type: 'string' }, description: 'Filtrar por usuario (nombre, apellido o ID)' },
        { in: 'query', name: 'fecha_desde', schema: { type: 'string', format: 'date' }, description: 'Fecha inicial (YYYY-MM-DD)' },
        { in: 'query', name: 'fecha_hasta', schema: { type: 'string', format: 'date' }, description: 'Fecha final (YYYY-MM-DD)' },
        { in: 'query', name: 'tipo_suministro', schema: { type: 'string', enum: ['PRODUCTO', 'MATERIAL'] }, description: 'Tipo de suministro' },
        { in: 'query', name: 'tipo_mov', schema: { type: 'string', enum: ['COMPRA', 'VENTA', 'PRODUCCION', 'AJUSTE'] }, description: 'Tipo de movimiento' },
      ],
      responses: {
        200: { description: 'Lista de movimientos' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
  },
};

export const movimientosSchemas = {};
