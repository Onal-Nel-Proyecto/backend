import { generarPDF } from './pdfGenerator.js';

/**
 * Formatear número a moneda: $ 1.000,00
 */
const formatearMoneda = (valor) => {
  const num = Number(valor || 0);
  const entero = Math.floor(Math.abs(num));
  const decimales = Math.round((Math.abs(num) - entero) * 100)
    .toString()
    .padStart(2, '0');
  const miles = entero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const signo = num < 0 ? '-' : '';
  return `${signo}$ ${miles},${decimales}`;
};

/**
 * Generar HTML para el reporte de ventas
 */
const generarHTMLReporte = (data, titulo, periodo) => {
  const summary = data.resumen || {};
  const topProductos = data.topProductos || [];
  const ventasPorDia = data.ventasPorDia || [];

  const filasProductos = topProductos
    .map(
      (p, i) => `
    <tr>
      <td class="text-center">${i + 1}</td>
      <td>${p.producto || p.Producto || '-'}</td>
      <td class="text-right">${Number(p.cantidadVendida || 0).toLocaleString('es-CL')}</td>
      <td class="text-right">${formatearMoneda(p.totalGenerado || p.totalGenerado || 0)}</td>
    </tr>`
    )
    .join('');

  const filasVentasDia = ventasPorDia
    .map(
      (d, i) => `
    <tr>
      <td class="text-center">${i + 1}</td>
      <td>${d.fecha || d.Fecha || d.dia || '-'}</td>
      <td class="text-right">${Number(d.cantidadVentas || d.CantidadVentas || 0).toLocaleString('es-CL')}</td>
      <td class="text-right">${formatearMoneda(d.totalDia || d.TotalDia || 0)}</td>
    </tr>`
    )
    .join('');

  const numVentas = Number(summary.numeroVentas ?? summary.total_ventas ?? summary.NumVentas ?? 0);
  const totalVendido = Number(summary.total_vendido ?? summary.total_venta ?? summary.totalVendido ?? 0);
  const ticketPromedio = numVentas > 0 ? totalVendido / numVentas : 0;

  const fechaGeneracion = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 11px;
      color: #1a1a1a;
      line-height: 1.5;
    }
    .container { padding: 10px 0; }

    /* Header */
    .header {
      text-align: center;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header h1 { font-size: 22px; font-weight: 700; text-transform: uppercase; }
    .header h2 { font-size: 16px; font-weight: 600; color: #444; margin-top: 4px; }
    .header .periodo { font-size: 11px; color: #666; margin-top: 6px; }
    .header .generacion { font-size: 10px; color: #999; margin-top: 2px; }

    /* Section */
    .section { margin-bottom: 24px; }
    .section h3 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #fff;
      background: #1a1a1a;
      padding: 6px 10px;
      margin-bottom: 10px;
    }

    /* Summary cards */
    .summary-grid {
      display: flex;
      gap: 16px;
      margin-bottom: 10px;
    }
    .summary-card {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 12px;
      text-align: center;
    }
    .summary-card .label {
      font-size: 9px;
      text-transform: uppercase;
      color: #888;
      letter-spacing: 0.5px;
    }
    .summary-card .value {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      margin-top: 4px;
    }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    thead th {
      background: #1a1a1a;
      color: #fff;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 7px 6px;
      text-align: right;
    }
    thead th:first-child { text-align: center; width: 30px; }
    thead th:nth-child(2) { text-align: left; }
    tbody td {
      padding: 6px;
      border-bottom: 1px solid #eee;
      font-size: 10px;
    }
    tbody tr:last-child td { border-bottom: none; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }

    /* Footer */
    .footer {
      text-align: center;
      font-size: 9px;
      color: #999;
      border-top: 1px solid #eee;
      padding-top: 12px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Confecciones ONA &amp; NEL</h1>
      <h2>Reporte de Ventas</h2>
      <p class="periodo">${periodo}</p>
      <p class="generacion">Generado: ${fechaGeneracion}</p>
    </div>

    <!-- Resumen -->
    <div class="section">
      <h3>Resumen</h3>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="label">Número de Ventas</div>
          <div class="value">${numVentas.toLocaleString('es-CL')}</div>
        </div>
        <div class="summary-card">
          <div class="label">Total Vendido</div>
          <div class="value">${formatearMoneda(totalVendido)}</div>
        </div>
        <div class="summary-card">
          <div class="label">Ticket Promedio</div>
          <div class="value">${formatearMoneda(ticketPromedio)}</div>
        </div>
      </div>
    </div>

    <!-- Productos más vendidos -->
    <div class="section">
      <h3>Productos Más Vendidos</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th>Cantidad Vendida</th>
            <th>Total Generado</th>
          </tr>
        </thead>
        <tbody>
          ${filasProductos || '<tr><td colspan="4" class="text-center" style="color:#999; padding:12px;">Sin datos de productos</td></tr>'}
        </tbody>
      </table>
    </div>

    <!-- Ventas por día -->
    <div class="section">
      <h3>Ventas por Día</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Cantidad Ventas</th>
            <th>Total del Día</th>
          </tr>
        </thead>
        <tbody>
          ${filasVentasDia || '<tr><td colspan="4" class="text-center" style="color:#999; padding:12px;">Sin datos de ventas diarias</td></tr>'}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p>Confecciones ONA &amp; NEL — Documento generado electrónicamente</p>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Generar PDF de reporte de ventas
 * @param {object}  data      Datos del reporte (summary, topProductos, ventasPorDia)
 * @param {string}  titulo    Título del reporte
 * @param {string}  periodo   Texto del periodo consultado
 * @returns {Promise<Buffer>}
 */
export const generarReportePDF = async (data, titulo, periodo) => {
  const html = generarHTMLReporte(data, titulo, periodo);
  const pdfBuffer = await generarPDF(html);
  return pdfBuffer;
};
