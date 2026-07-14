export const ventasPaths = {
  '/ventas': {
    get: {
      tags: ['Ventas'],
      summary: 'Listar ventas',
      description: 'Obtiene todas las ventas con paginación y filtros.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'pag', schema: { type: 'integer' }, description: 'Número de página' },
        { in: 'query', name: 'cliente', schema: { type: 'string' }, description: 'Filtrar por cliente' },
        { in: 'query', name: 'fecha_desde', schema: { type: 'string', format: 'date' }, description: 'Fecha inicial' },
        { in: 'query', name: 'fecha_hasta', schema: { type: 'string', format: 'date' }, description: 'Fecha final' },
      ],
      responses: {
        200: { description: 'Lista de ventas' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
    post: {
      tags: ['Ventas'],
      summary: 'Crear venta',
      description: 'Registra una nueva venta con sus detalles.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CrearVenta' } } },
      },
      responses: {
        201: { description: 'Venta creada exitosamente' },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
  },
  '/ventas/{id}': {
    get: {
      tags: ['Ventas'],
      summary: 'Obtener venta por ID',
      description: 'Obtiene los datos completos de una venta.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID de la venta' },
      ],
      responses: {
        200: { description: 'Datos de la venta' },
        401: { description: 'No autorizado' },
        404: { description: 'Venta no encontrada' },
      },
    },
    patch: {
      tags: ['Ventas'],
      summary: 'Actualizar venta',
      description: 'Actualiza datos de la venta (descuento, fecha límite de pago).',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID de la venta' },
      ],
      requestBody: {
        content: { 'application/json': { schema: { type: 'object', properties: { descuento: { type: 'number', example: 5000 }, fecha_limite_pago: { type: 'string', format: 'date', example: '2026-07-15' } } } } },
      },
      responses: {
        200: { description: 'Venta actualizada exitosamente' },
        400: { description: 'Datos inválidos' },
        401: { description: 'No autorizado' },
        404: { description: 'Venta no encontrada' },
      },
    },
    delete: {
      tags: ['Ventas'],
      summary: 'Anular venta',
      description: 'Anula una venta. El SP revierte el stock.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID de la venta' },
      ],
      responses: {
        200: { description: 'Venta anulada exitosamente' },
        401: { description: 'No autorizado' },
        404: { description: 'Venta no encontrada' },
      },
    },
  },
  '/ventas/{id}/detalles': {
    post: {
      tags: ['Ventas'],
      summary: 'Agregar detalle a venta',
      description: 'Agrega un producto como detalle a una venta existente.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID de la venta' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CrearDetalleVenta' } } },
      },
      responses: {
        201: { description: 'Detalle agregado exitosamente' },
        400: { description: 'Datos inválidos' },
        401: { description: 'No autorizado' },
        404: { description: 'Venta no encontrada' },
      },
    },
  },
  '/ventas/{id}/detalles/{id_detalle}': {
    delete: {
      tags: ['Ventas'],
      summary: 'Eliminar detalle de venta',
      description: 'Elimina un detalle de una venta.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID de la venta' },
        { in: 'path', name: 'id_detalle', schema: { type: 'integer' }, required: true, description: 'ID del detalle' },
      ],
      responses: {
        200: { description: 'Detalle eliminado exitosamente' },
        401: { description: 'No autorizado' },
        404: { description: 'Detalle no encontrado' },
      },
    },
  },
  '/ventas/{id}/factura': {
    get: {
      tags: ['Ventas - Factura'],
      summary: 'Obtener factura',
      description: 'Obtiene los datos de la factura asociada a una venta.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID de la venta' },
      ],
      responses: {
        200: { description: 'Datos de la factura' },
        401: { description: 'No autorizado' },
        404: { description: 'Factura no encontrada' },
      },
    },
    post: {
      tags: ['Ventas - Factura'],
      summary: 'Crear factura',
      description: 'Genera una factura para una venta.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID de la venta' },
      ],
      responses: {
        201: { description: 'Factura creada exitosamente' },
        400: { description: 'Datos inválidos' },
        401: { description: 'No autorizado' },
      },
    },
  },
  '/ventas/{id}/factura/pdf': {
    get: {
      tags: ['Ventas - Factura'],
      summary: 'Descargar factura PDF',
      description: 'Genera y descarga el PDF de la factura.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID de la venta' },
      ],
      responses: {
        200: { description: 'PDF de la factura', content: { 'application/pdf': {} } },
        401: { description: 'No autorizado' },
        404: { description: 'Factura no encontrada' },
      },
    },
  },
  '/ventas/{id}/factura/{id_factura}/anular': {
    patch: {
      tags: ['Ventas - Factura'],
      summary: 'Anular factura',
      description: 'Anula una factura existente.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID de la venta' },
        { in: 'path', name: 'id_factura', schema: { type: 'integer' }, required: true, description: 'ID de la factura' },
      ],
      responses: {
        200: { description: 'Factura anulada exitosamente' },
        401: { description: 'No autorizado' },
        404: { description: 'Factura no encontrada' },
      },
    },
  },
  '/ventas/reportes/mensual': {
    get: {
      tags: ['Ventas - Reportes'],
      summary: 'Reporte mensual de ventas',
      description: 'Obtiene el reporte de ventas agrupado por mes.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'anio', schema: { type: 'integer' }, description: 'Año del reporte' },
        { in: 'query', name: 'mes', schema: { type: 'integer' }, description: 'Mes del reporte' },
      ],
      responses: {
        200: { description: 'Reporte mensual de ventas' },
        401: { description: 'No autorizado' },
      },
    },
  },
  '/ventas/reportes/periodo': {
    get: {
      tags: ['Ventas - Reportes'],
      summary: 'Reporte de ventas por periodo',
      description: 'Obtiene el reporte de ventas en un rango de fechas.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'fecha_desde', schema: { type: 'string', format: 'date' }, description: 'Fecha inicial' },
        { in: 'query', name: 'fecha_hasta', schema: { type: 'string', format: 'date' }, description: 'Fecha final' },
      ],
      responses: {
        200: { description: 'Reporte por periodo' },
        401: { description: 'No autorizado' },
      },
    },
  },
  '/ventas/reportes/mensual/pdf': {
    get: {
      tags: ['Ventas - Reportes'],
      summary: 'Exportar reporte mensual PDF',
      description: 'Exporta a PDF el reporte mensual de ventas.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'anio', schema: { type: 'integer' }, description: 'Año' },
        { in: 'query', name: 'mes', schema: { type: 'integer' }, description: 'Mes' },
      ],
      responses: {
        200: { description: 'PDF del reporte', content: { 'application/pdf': {} } },
        401: { description: 'No autorizado' },
      },
    },
  },
  '/ventas/reportes/periodo/pdf': {
    get: {
      tags: ['Ventas - Reportes'],
      summary: 'Exportar reporte por periodo PDF',
      description: 'Exporta a PDF el reporte de ventas por periodo.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'fecha_desde', schema: { type: 'string', format: 'date' }, description: 'Fecha inicial' },
        { in: 'query', name: 'fecha_hasta', schema: { type: 'string', format: 'date' }, description: 'Fecha final' },
      ],
      responses: {
        200: { description: 'PDF del reporte', content: { 'application/pdf': {} } },
        401: { description: 'No autorizado' },
      },
    },
  },
  '/ventas/reportes/mensual/excel': {
    get: {
      tags: ['Ventas - Reportes'],
      summary: 'Exportar reporte mensual Excel',
      description: 'Exporta a Excel el reporte mensual de ventas.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'anio', schema: { type: 'integer' }, description: 'Año' },
        { in: 'query', name: 'mes', schema: { type: 'integer' }, description: 'Mes' },
      ],
      responses: {
        200: { description: 'Archivo Excel', content: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {} } },
        401: { description: 'No autorizado' },
      },
    },
  },
  '/ventas/reportes/periodo/excel': {
    get: {
      tags: ['Ventas - Reportes'],
      summary: 'Exportar reporte por periodo Excel',
      description: 'Exporta a Excel el reporte de ventas por periodo.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'fecha_desde', schema: { type: 'string', format: 'date' }, description: 'Fecha inicial' },
        { in: 'query', name: 'fecha_hasta', schema: { type: 'string', format: 'date' }, description: 'Fecha final' },
      ],
      responses: {
        200: { description: 'Archivo Excel', content: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {} } },
        401: { description: 'No autorizado' },
      },
    },
  },
};

export const ventasSchemas = {
  CrearVenta: {
    type: 'object',
    required: ['cliente_id', 'detalles'],
    properties: {
      cliente_id: { type: 'string', example: 'CLI-001' },
      descuento: { type: 'number', example: 0 },
      fecha_limite_pago: { type: 'string', format: 'date', example: '2026-07-15' },
      detalles: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            producto_id: { type: 'string', example: 'PRO-001' },
            cantidad: { type: 'integer', example: 2 },
            precio_unitario: { type: 'number', example: 45000 },
          },
        },
      },
    },
  },
  CrearDetalleVenta: {
    type: 'object',
    required: ['producto_id', 'cantidad', 'precio_unitario'],
    properties: {
      producto_id: { type: 'string', example: 'PRO-001' },
      cantidad: { type: 'integer', example: 1 },
      precio_unitario: { type: 'number', example: 45000 },
    },
  },
};
