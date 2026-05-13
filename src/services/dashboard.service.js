import { DashboardModel } from '../models/dashboard.models.js';

export const getResumenService = async () => {
  const [resumen, pedidosPorEstado, topClientes, recientes] = await Promise.all([
    DashboardModel.getResumen(),
    DashboardModel.getPedidosPorEstado(),
    DashboardModel.getTopClientes(10),
    DashboardModel.getPedidosRecientes(5),
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
    top_clientes: topClientes,
    pedidos_recientes: recientes,
  };
};
