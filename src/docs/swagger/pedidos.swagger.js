export const pedidosPaths = {
  '/pedidos': {
    get: {
      tags: ['Pedidos'],
      summary: 'Listar pedidos',
      description: 'Obtiene todos los pedidos con paginación y filtros.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'pag', schema: { type: 'integer' }, description: 'Número de página' },
        { in: 'query', name: 'estado', schema: { type: 'string' }, description: 'Filtrar por estado (PENDIENTE, EN PROCESO, TERMINADO, ENTREGADO, CANCELADO, completados)' },
        { in: 'query', name: 'cliente', schema: { type: 'string' }, description: 'Filtrar por nombre de cliente' },
        { in: 'query', name: 'fecha_desde', schema: { type: 'string', format: 'date' }, description: 'Fecha de ingreso inicial' },
        { in: 'query', name: 'fecha_hasta', schema: { type: 'string', format: 'date' }, description: 'Fecha de ingreso final' },
        { in: 'query', name: 'tipo_pedido', schema: { type: 'string' }, description: 'Filtrar por tipo de pedido' },
        { in: 'query', name: 'estado_pago', schema: { type: 'string', enum: ['PAGADO', 'ABONADO', 'SIN PAGAR'] }, description: 'Filtrar por estado de pago' },
        { in: 'query', name: 'tipo_origen', schema: { type: 'string', enum: ['CLIENTE', 'PRODUCCION'] }, description: 'Filtrar por tipo de origen' },
      ],
      responses: {
        200: { description: 'Lista de pedidos paginada' },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
    post: {
      tags: ['Pedidos'],
      summary: 'Crear pedido',
      description: 'Registra un nuevo pedido.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CrearPedido' } } },
      },
      responses: {
        201: { description: 'Pedido creado exitosamente' },
        400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta400' } } } },
        401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Respuesta401' } } } },
      },
    },
  },
  '/pedidos/entregas': {
    get: {
      tags: ['Pedidos'],
      summary: 'Listar entregas',
      description: 'Obtiene los pedidos completados (TERMINADO + ENTREGADO) con paginación.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'pag', schema: { type: 'integer' }, description: 'Número de página' },
        { in: 'query', name: 'cliente', schema: { type: 'string' }, description: 'Filtrar por cliente' },
        { in: 'query', name: 'fecha_desde', schema: { type: 'string', format: 'date' }, description: 'Fecha inicial' },
        { in: 'query', name: 'fecha_hasta', schema: { type: 'string', format: 'date' }, description: 'Fecha final' },
        { in: 'query', name: 'estado', schema: { type: 'string' }, description: 'Filtrar por estado (TERMINADO, ENTREGADO)' },
        { in: 'query', name: 'mes', schema: { type: 'integer' }, description: 'Filtrar por mes' },
      ],
      responses: {
        200: { description: 'Lista de entregas' },
        401: { description: 'No autorizado' },
      },
    },
  },
  '/pedidos/{id}': {
    get: {
      tags: ['Pedidos'],
      summary: 'Obtener pedido por ID',
      description: 'Obtiene los datos completos de un pedido, incluyendo detalles, fotos y producción.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del pedido' },
      ],
      responses: {
        200: { description: 'Datos completos del pedido' },
        401: { description: 'No autorizado' },
        404: { description: 'Pedido no encontrado' },
      },
    },
    put: {
      tags: ['Pedidos'],
      summary: 'Actualizar pedido',
      description: 'Actualiza los datos generales de un pedido.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del pedido' },
      ],
      requestBody: {
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ActualizarPedido' } } },
      },
      responses: {
        200: { description: 'Pedido actualizado exitosamente' },
        400: { description: 'Datos inválidos' },
        401: { description: 'No autorizado' },
        404: { description: 'Pedido no encontrado' },
      },
    },
  },
  '/pedidos/{id}/cancelar': {
    patch: {
      tags: ['Pedidos'],
      summary: 'Cancelar pedido',
      description: 'Cancela un pedido. Requiere motivo.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del pedido' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { motivo: { type: 'string', example: 'Cliente solicitó cancelación' } }, required: ['motivo'] } } },
      },
      responses: {
        200: { description: 'Pedido cancelado exitosamente' },
        400: { description: 'Datos inválidos' },
        401: { description: 'No autorizado' },
        404: { description: 'Pedido no encontrado' },
      },
    },
  },
  '/pedidos/{id}/entregar': {
    patch: {
      tags: ['Pedidos'],
      summary: 'Entregar pedido',
      description: 'Marca un pedido como ENTREGADO (debe estar en TERMINADO).',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del pedido' },
      ],
      responses: {
        200: { description: 'Pedido entregado exitosamente' },
        400: { description: 'El pedido no está en estado TERMINADO' },
        401: { description: 'No autorizado' },
        404: { description: 'Pedido no encontrado' },
      },
    },
  },
  '/pedidos/{id}/devolver': {
    patch: {
      tags: ['Pedidos'],
      summary: 'Devolver pedido',
      description: 'Devuelve un pedido ENTREGADO a TERMINADO, o un TERMINADO cambia origen a PRODUCCION. Puede anular venta.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del pedido' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/DevolverPedido' } } },
      },
      responses: {
        200: { description: 'Pedido devuelto exitosamente' },
        400: { description: 'El pedido no está en estado ENTREGADO o TERMINADO' },
        401: { description: 'No autorizado' },
        404: { description: 'Pedido no encontrado' },
      },
    },
  },
  '/pedidos/{id}/historial': {
    get: {
      tags: ['Pedidos - Historial'],
      summary: 'Historial de cambios de estado',
      description: 'Obtiene el historial de cambios de estado de un pedido. Solo administradores.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del pedido' },
        { in: 'query', name: 'pag', schema: { type: 'integer' }, description: 'Número de página' },
      ],
      responses: {
        200: { description: 'Historial del pedido' },
        401: { description: 'No autorizado' },
        403: { description: 'Acceso denegado' },
        404: { description: 'Pedido no encontrado' },
      },
    },
  },
  '/pedidos/{id}/detalles': {
    post: {
      tags: ['Pedidos - Detalles'],
      summary: 'Agregar detalle al pedido',
      description: 'Agrega un producto como detalle a un pedido.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del pedido' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CrearDetallePedido' } } },
      },
      responses: {
        201: { description: 'Detalle creado exitosamente' },
        400: { description: 'Datos inválidos' },
        401: { description: 'No autorizado' },
        404: { description: 'Pedido no encontrado' },
      },
    },
  },
  '/pedidos/{id}/detalles/{id_detalle}': {
    delete: {
      tags: ['Pedidos - Detalles'],
      summary: 'Eliminar detalle del pedido',
      description: 'Elimina un detalle de un pedido.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del pedido' },
        { in: 'path', name: 'id_detalle', schema: { type: 'string' }, required: true, description: 'ID del detalle' },
      ],
      responses: {
        200: { description: 'Detalle eliminado exitosamente' },
        401: { description: 'No autorizado' },
        404: { description: 'Detalle no encontrado' },
      },
    },
    patch: {
      tags: ['Pedidos - Detalles'],
      summary: 'Actualizar detalle del pedido',
      description: 'Actualiza cantidad, observaciones, producto o medidas de un detalle.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del pedido' },
        { in: 'path', name: 'id_detalle', schema: { type: 'string' }, required: true, description: 'ID del detalle' },
      ],
      requestBody: {
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ActualizarDetallePedido' } } },
      },
      responses: {
        200: { description: 'Detalle actualizado exitosamente' },
        400: { description: 'Datos inválidos' },
        401: { description: 'No autorizado' },
        404: { description: 'Detalle no encontrado' },
      },
    },
  },
  '/pedidos/{id}/detalles/{id_detalle}/produccion': {
    post: {
      tags: ['Pedidos - Producción'],
      summary: 'Iniciar producción',
      description: 'Registra una orden de producción para un detalle del pedido.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del pedido' },
        { in: 'path', name: 'id_detalle', schema: { type: 'string' }, required: true, description: 'ID del detalle' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CrearProduccion' } } },
      },
      responses: {
        201: { description: 'Producción registrada exitosamente' },
        400: { description: 'Datos inválidos' },
        401: { description: 'No autorizado' },
      },
    },
  },
  '/pedidos/{id}/detalles/{id_detalle}/produccion/{id_produccion}': {
    patch: {
      tags: ['Pedidos - Producción'],
      summary: 'Actualizar producción',
      description: 'Actualiza el estado de una orden de producción.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del pedido' },
        { in: 'path', name: 'id_detalle', schema: { type: 'string' }, required: true, description: 'ID del detalle' },
        { in: 'path', name: 'id_produccion', schema: { type: 'integer' }, required: true, description: 'ID de la producción' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { estado: { type: 'string', enum: ['EN PROCESO', 'TERMINADO'], example: 'TERMINADO' } }, required: ['estado'] } } },
      },
      responses: {
        200: { description: 'Producción actualizada exitosamente' },
        400: { description: 'Datos inválidos' },
        401: { description: 'No autorizado' },
        404: { description: 'Producción no encontrada' },
      },
    },
    delete: {
      tags: ['Pedidos - Producción'],
      summary: 'Eliminar producción',
      description: 'Elimina una orden de producción.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del pedido' },
        { in: 'path', name: 'id_detalle', schema: { type: 'string' }, required: true, description: 'ID del detalle' },
        { in: 'path', name: 'id_produccion', schema: { type: 'integer' }, required: true, description: 'ID de la producción' },
      ],
      responses: {
        200: { description: 'Producción eliminada exitosamente' },
        401: { description: 'No autorizado' },
        404: { description: 'Producción no encontrada' },
      },
    },
  },
  '/pedidos/{id}/fotos': {
    post: {
      tags: ['Pedidos - Fotos'],
      summary: 'Subir foto al pedido',
      description: 'Sube una imagen a un pedido (máx. 15 imágenes).',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del pedido' },
      ],
      requestBody: {
        required: true,
        content: { 'multipart/form-data': { schema: { type: 'object', properties: { foto: { type: 'string', format: 'binary' } } } } },
      },
      responses: {
        201: { description: 'Imagen subida correctamente' },
        400: { description: 'Límite de tamaño o formato inválido' },
        401: { description: 'No autorizado' },
      },
    },
  },
  '/pedidos/{id}/fotos/{fotoId}': {
    delete: {
      tags: ['Pedidos - Fotos'],
      summary: 'Eliminar foto del pedido',
      description: 'Elimina una imagen de un pedido (también de Cloudinary).',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID del pedido' },
        { in: 'path', name: 'fotoId', schema: { type: 'integer' }, required: true, description: 'ID de la foto' },
      ],
      responses: {
        200: { description: 'Imagen eliminada correctamente' },
        401: { description: 'No autorizado' },
        404: { description: 'Foto no encontrada' },
      },
    },
  },
};

export const pedidosSchemas = {
  CrearPedido: {
    type: 'object',
    required: ['fecha_estimada'],
    properties: {
      cliente_id: { type: 'string', example: 'CLI-001' },
      fecha_estimada: { type: 'string', format: 'date', example: '2026-07-15' },
      observaciones: { type: 'string', example: 'Urgente' },
      recordatorio: { type: 'boolean', example: false },
      descripcion: { type: 'string', example: 'Pedido de uniformes' },
      tipo_pedido: { type: 'string', example: 'normal' },
      tipo_de_origen: { type: 'string', enum: ['CLIENTE', 'PRODUCCION'], example: 'CLIENTE' },
    },
  },
  ActualizarPedido: {
    type: 'object',
    properties: {
      cliente_id: { type: 'string', example: 'CLI-001' },
      descripcion: { type: 'string', example: 'Pedido actualizado' },
      observacion: { type: 'string', example: 'Cambio de tela' },
      fecha_estimada_entrega: { type: 'string', format: 'date', example: '2026-08-01' },
      recordatorio: { type: 'boolean', example: true },
      tipo_pedido: { type: 'string', example: 'normal' },
    },
  },
  DevolverPedido: {
    type: 'object',
    required: ['tipo_devolucion', 'motivo'],
    properties: {
      tipo_devolucion: { type: 'string', enum: ['ANULACION', 'CORRECCION'], example: 'ANULACION' },
      motivo: { type: 'string', example: 'Cliente canceló el pedido' },
    },
  },
  CrearDetallePedido: {
    type: 'object',
    properties: {
      producto_id: { type: 'string', example: 'PRO-001' },
      cantidad: { type: 'integer', example: 2 },
      observacion: { type: 'string', example: 'Manga larga' },
      medidas: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            medida_id: { type: 'integer', example: 1 },
            medida_valor: { type: 'number', example: 42 },
          },
        },
      },
    },
  },
  ActualizarDetallePedido: {
    type: 'object',
    properties: {
      cantidad: { type: 'integer', example: 3 },
      observacion: { type: 'string', example: 'Actualizado' },
      producto: {
        type: 'object',
        properties: {
          nombre: { type: 'string', example: 'Camisa ejecutiva' },
          precio: { type: 'number', example: 55000 },
          genero: { type: 'string', example: 'MASCULINO' },
          talla: { type: 'string', example: 'L' },
        },
      },
      medidas: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            medida_id: { type: 'integer' },
            medida_valor: { type: 'number' },
          },
        },
      },
    },
  },
  CrearProduccion: {
    type: 'object',
    required: ['producto_id', 'cantidad'],
    properties: {
      producto_id: { type: 'string', example: 'PRO-001' },
      cantidad: { type: 'integer', example: 5 },
    },
  },
};
