import ExcelJS from 'exceljs';

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
 * Estilo para el encabezado de sección
 */
const sectionHeaderStyle = {
  font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A1A' } },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: {
    top: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
    right: { style: 'thin' },
  },
};

/**
 * Estilo para encabezados de columna
 */
const columnHeaderStyle = {
  font: { bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF333333' } },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: {
    top: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
    right: { style: 'thin' },
  },
};

/**
 * Estilo para celdas de datos
 */
const dataCellStyle = {
  alignment: { vertical: 'middle' },
  border: {
    top: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
    right: { style: 'thin' },
  },
};

/**
 * Escribir una fila con estilo en una hoja
 */
const addStyledRow = (worksheet, values, style = {}) => {
  const row = worksheet.addRow(values);
  row.eachCell((cell) => {
    cell.font = style.font || { size: 10 };
    cell.alignment = style.alignment || { vertical: 'middle' };
    if (style.fill) cell.fill = style.fill;
    if (style.border) cell.border = style.border;
    if (style.numFmt) cell.numFmt = style.numFmt;
  });
  return row;
};

/**
 * Generar libro Excel con reporte de ventas
 * @param {object} data       Datos del reporte (summary, topProductos, ventasPorDia)
 * @param {string} periodo    Texto del periodo consultado
 * @returns {Promise<Buffer>}
 */
export const generarReporteExcel = async (data, periodo) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Confecciones ONA & NEL';
  workbook.created = new Date();

  const summary = data.resumen || {};
  const topProductos = data.topProductos || [];
  const ventasPorDia = data.ventasPorDia || [];

  const numVentas = Number(summary.num_ventas ?? summary.total_ventas ?? summary.numeroVentas ?? 0);
  const totalVendido = Number(summary.total_vendido ?? summary.total_venta ?? summary.totalVendido ?? 0);
  const ticketPromedio = numVentas > 0 ? totalVendido / numVentas : 0;

  // ============================================================
  // HOJA 1: Resumen
  // ============================================================
  const wsResumen = workbook.addWorksheet('Resumen');

  wsResumen.getColumn(1).width = 25;
  wsResumen.getColumn(2).width = 25;
  wsResumen.getColumn(3).width = 25;

  // Título
  wsResumen.mergeCells('A1:C1');
  const titleCell = wsResumen.getCell('A1');
  titleCell.value = `Reporte de Ventas — ${periodo}`;
  titleCell.font = { bold: true, size: 14, color: { argb: 'FF1A1A1A' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  wsResumen.getRow(1).height = 30;

  // Subtitle
  wsResumen.mergeCells('A2:C2');
  const subCell = wsResumen.getCell('A2');
  subCell.value = `Confecciones ONA & NEL — Generado: ${new Date().toLocaleDateString('es-PE')}`;
  subCell.font = { size: 10, color: { argb: 'FF666666' } };
  subCell.alignment = { horizontal: 'center' };
  wsResumen.getRow(2).height = 20;

  wsResumen.addRow([]);

  // Encabezado de sección
  addStyledRow(wsResumen, ['Indicador', 'Valor', ''], sectionHeaderStyle);

  // Datos
  addStyledRow(wsResumen, ['Número de Ventas', numVentas, ''], dataCellStyle);
  addStyledRow(wsResumen, ['Total Vendido', formatearMoneda(totalVendido), ''], dataCellStyle);
  addStyledRow(wsResumen, ['Ticket Promedio', formatearMoneda(ticketPromedio), ''], dataCellStyle);

  // ============================================================
  // HOJA 2: Productos Más Vendidos
  // ============================================================
  const wsProductos = workbook.addWorksheet('Productos Más Vendidos');

  wsProductos.getColumn(1).width = 6;
  wsProductos.getColumn(2).width = 40;
  wsProductos.getColumn(3).width = 20;
  wsProductos.getColumn(4).width = 25;

  // Título
  wsProductos.mergeCells('A1:D1');
  const prodTitle = wsProductos.getCell('A1');
  prodTitle.value = `Productos Más Vendidos — ${periodo}`;
  prodTitle.font = { bold: true, size: 14, color: { argb: 'FF1A1A1A' } };
  prodTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  wsProductos.getRow(1).height = 30;

  wsProductos.addRow([]);

  // Encabezados
  addStyledRow(wsProductos, ['#', 'Producto', 'Cantidad Vendida', 'Total Generado'], columnHeaderStyle);

  // Datos
  if (topProductos.length === 0) {
    addStyledRow(wsProductos, ['', 'Sin datos de productos', '', ''], dataCellStyle);
  } else {
    topProductos.forEach((p, i) => {
      addStyledRow(
        wsProductos,
        [
          i + 1,
          p.producto || p.Producto || '-',
          Number(p.cantidad || p.Cantidad || p.cantidadVendida || 0),
          formatearMoneda(p.total || p.totalGenerado || 0),
        ],
        dataCellStyle
      );
    });
  }

  // ============================================================
  // HOJA 3: Ventas por Día
  // ============================================================
  const wsVentasDia = workbook.addWorksheet('Ventas por Día');

  wsVentasDia.getColumn(1).width = 6;
  wsVentasDia.getColumn(2).width = 20;
  wsVentasDia.getColumn(3).width = 20;
  wsVentasDia.getColumn(4).width = 25;

  // Título
  wsVentasDia.mergeCells('A1:D1');
  const diaTitle = wsVentasDia.getCell('A1');
  diaTitle.value = `Ventas por Día — ${periodo}`;
  diaTitle.font = { bold: true, size: 14, color: { argb: 'FF1A1A1A' } };
  diaTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  wsVentasDia.getRow(1).height = 30;

  wsVentasDia.addRow([]);

  // Encabezados
  addStyledRow(wsVentasDia, ['#', 'Fecha', 'Cantidad Ventas', 'Total Día'], columnHeaderStyle);

  // Datos
  if (ventasPorDia.length === 0) {
    addStyledRow(wsVentasDia, ['', 'Sin datos de ventas diarias', '', ''], dataCellStyle);
  } else {
    ventasPorDia.forEach((d, i) => {
      addStyledRow(
        wsVentasDia,
        [
          i + 1,
          d.fecha || d.Fecha || d.dia || '-',
          Number(d.cantidad || d.Cantidad || d.cantidadVentas || 0),
          formatearMoneda(d.total || d.Total || d.totalDia || 0),
        ],
        dataCellStyle
      );
    });
  }

  // Generar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};
