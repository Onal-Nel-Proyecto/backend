import { DashboardModel } from '../models/dashboard.models.js';

export const getResumenService = async () => {
  const [resumen, pedidosPorEstado, actividadSistema, stock] = await Promise.all([
    DashboardModel.getResumen(),
    DashboardModel.getPedidosPorEstado(),
    DashboardModel.getActividadSitema(),
    DashboardModel.getStockCritico()
  ]);

  return {
    resumen: {
      total_pedidos: resumen.total,
      pendientes: resumen.pendientes,
      en_proceso: resumen.en_proceso,
      terminados: resumen.terminados,
      cancelados: resumen.cancelados,
    },
    pedidos_por_estado: pedidosPorEstado,
    stock_critico: stock,
    actividad_sistema: actividadSistema
  };
};

// ─────────────────────────────────────────────
//  Dashboard de Pedidos — Orquestador
// ─────────────────────────────────────────────
export const getPedidosDashboardService = async () => {
  const [
    summary,
    produccionLoad,
    calendarEvents,
    activeProduction,
    ultimosPedidos
  ] = await Promise.all([
    DashboardModel.getPedidosDashboardSummary(),
    DashboardModel.getProduccionLoad(),
    DashboardModel.getCalendarEvents(),
    DashboardModel.getActiveProduction(),
    DashboardModel.getUltimosPedidos()
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const estadosNoPendientes = ['terminado', 'entregado', 'cancelado'];

  const calendarEventsWithFlags = calendarEvents.map(event => {
    const fechaEntrega = new Date(event.fechaEntrega);
    const estado = (event.estado || '').toLowerCase();
    // console.log(event.fechaEntrega  < today)
    
    return {
      id: event.id,
      descripcion: event.descripcion,
      cliente: event.cliente,
      fechaEntrega: event.fechaEntrega,
      estado: event.estado,
      total: Number(event.total ?? 0),
      esProximoVencer: !estadosNoPendientes.includes(estado) &&
        fechaEntrega >= today && fechaEntrega <= threeDaysFromNow,
      esRetrasado: !estadosNoPendientes.includes(estado) &&
        fechaEntrega < today,
    };
  });

  return {
    summary: {
      pendientes: Number(summary.pendientes ?? 0),
      enProceso: Number(summary.enProceso ?? 0),
      entregasSemana: Number(summary.entregasSemana ?? 0),
      retrasados: Number(summary.retrasados ?? 0),
      cargaProduccion: {
        actual: Number(produccionLoad.actual ?? 0),
        capacidad: Number(produccionLoad.capacidad ?? 0),
      },
    },
    calendarEvents: calendarEventsWithFlags,
    produccionActiva: activeProduction.map(p => ({
      id: p.id,
      cliente: p.cliente,
      producto: p.producto,
      categoria: p.categoria ?? null,
      cantidad: Number(p.cantidad ?? 0),
    })),
    ultimosPedidos: ultimosPedidos.map(p => ({
      id: p.id,
      cliente: p.cliente,
      fechaRegistro: p.fechaRegistro,
      fechaEntrega: p.fechaEntrega,
      estado: p.estado,
      total: Number(p.total ?? 0),
    })),
  };
};
