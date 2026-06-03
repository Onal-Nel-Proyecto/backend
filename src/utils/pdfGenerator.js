import puppeteer from 'puppeteer';

/**
 * Generar un PDF a partir de un HTML
 * @param {string} html - Contenido HTML
 * @param {object} options - Opciones del PDF
 * @returns {Promise<Buffer>} Buffer del PDF
 */
export const generarPDF = async (html, options = {}) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new',
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      printBackground: true,
      ...options,
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

/**
 * Formatear un número al formato moneda local: $ 1.000,00
 * @param {number} valor - El valor a formatear
 * @returns {string} Ej: "$ 1.000,00"
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
 * Generar HTML de factura minimalista
 * @param {object} data - Datos de la factura (retorno de getFacturaService)
 * @returns {string} HTML string
 */
export const generarHTMLFactura = (data) => {
  const {
    nombre_empresa,
    eslogan,
    NIT,
    direccion_empresa,
    telefono_empresa,
    factura_id,
    fecha_emision,
    estado,
    nombres,
    apellidos,
    documento,
    direccion_cliente,
    telefono_cliente,
    correo,
    pedido_id,
    venta_id,
    detalles = [],
    descuento,
    subtotal,
    abono_realizado,
    total_pendiente,
    metodo_pago = [],
  } = data;

  const clienteNombre = `${nombres || ''} ${apellidos || ''}`.trim();
const fechaFormateada = fecha_emision
  ? new Date(fecha_emision).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  : '-';

  const filasDetalle = detalles
    .map(
      (d, i) => `
    <tr>
      <td class="text-left">${i + 1}</td>
      <td class="text-left">${d.nombre_producto || '-'}</td>
      <td class="text-right">${Number(d.cantidad || 0).toLocaleString('es-CL')}</td>
      <td class="text-right">${formatearMoneda(d.precio_unitario)}</td>
      <td class="text-right">${formatearMoneda(d.subtotal)}</td>
    </tr>`
    )
    .join('');

  const metodosPagoStr = metodo_pago.length > 0 ? metodo_pago.join(', ') : '-';

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
    .container {
      max-width: 100%;
      padding: 10px 0;
    }
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .header-left h1 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #1a1a1a;
    }
    .header-left .eslogan {
      font-size: 10px;
      color: #666;
      margin-top: 2px;
      font-style: italic;
    }
    .header-left .nit {
      font-size: 10px;
      color: #444;
      margin-top: 4px;
    }
    .header-right {
      text-align: right;
      font-size: 10px;
      color: #555;
    }
    .header-right .factura-label {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a1a;
      text-transform: uppercase;
    }
    .header-right .factura-id {
      font-size: 14px;
      font-weight: 600;
      margin-top: 2px;
    }
    /* Info sections */
    .info-grid {
      display: flex;
      gap: 30px;
      margin-bottom: 24px;
    }
    .info-box {
      flex: 1;
    }
    .info-box h3 {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
      border-bottom: 1px solid #ddd;
      padding-bottom: 4px;
      margin-bottom: 8px;
    }
    .info-box p {
      font-size: 10px;
      color: #333;
      margin-bottom: 2px;
    }
    .info-box p strong {
      color: #1a1a1a;
    }
    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    thead th {
      background: #1a1a1a;
      color: #fff;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 6px;
      text-align: right;
    }
    thead th:first-child { text-align: center; width: 30px; }
    thead th:nth-child(2) { text-align: left; }
    thead th:last-child { text-align: right; }
    tbody td {
      padding: 7px 6px;
      border-bottom: 1px solid #eee;
      font-size: 10px;
    }
    tbody tr:last-child td { border-bottom: none; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    /* Totals */
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }
    .totals-table {
      width: 280px;
    }
    .totals-table tr td {
      padding: 4px 8px;
      font-size: 10px;
    }
    .totals-table tr td:last-child {
      text-align: right;
      font-weight: 600;
    }
    .totals-table .total-row td {
      font-size: 13px;
      font-weight: 700;
      border-top: 2px solid #1a1a1a;
      padding-top: 6px;
    }
    .totals-table .pendiente-row td {
      color: #c0392b;
      font-weight: 700;
    }
    /* Payment methods */
    .payment-info {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #555;
      border-top: 1px solid #ddd;
      padding-top: 10px;
    }
    /* Status badge */
    .status-badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 10px;
      border-radius: 2px;
      margin-top: 4px;
    }
    .status-badge.emitida { background: #e8f5e9; color: #2e7d32; }
    .status-badge.anulado { background: #fbe9e7; color: #c62828; }
    /* Footer */
    .footer {
      text-align: center;
      font-size: 9px;
      color: #999;
      border-top: 1px solid #eee;
      padding-top: 12px;
      margin-top: 10px;
    }
    .empresa-info {
      font-size: 9px;
      color: #666;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <h1>${nombre_empresa|| 'Empresa'}</h1>
        ${eslogan ? `<p class="eslogan">${eslogan}</p>` : ''}
        <p class="nit">NIT: ${NIT || '-'}</p>
      </div>
      <div class="header-right">
        <div class="factura-label">Factura</div>
        <div class="factura-id">#${factura_id || '-'}</div>
        <span class="status-badge ${(estado || '').toLowerCase()}">${estado || '-'}</span>
      </div>
    </div>

    <!-- Info Grid -->
    <div class="info-grid">
      <div class="info-box">
        <h3>Empresa</h3>
        <p><strong>Dirección:</strong> ${direccion_empresa || '-'}</p>
        <p><strong>Teléfono:</strong> ${telefono_empresa || '-'}</p>
      </div>
      <div class="info-box">
        <h3>Cliente</h3>
        <p><strong>${clienteNombre || '-'}</strong></p>
        <p><strong>Doc:</strong> ${documento || '-'}</p>
        <p><strong>Dirección:</strong> ${direccion_cliente || '-'}</p>
        <p><strong>Tel:</strong> ${telefono_cliente || '-'}</p>
        <p><strong>Email:</strong> ${correo || '-'}</p>
      </div>
      <div class="info-box">
        <h3>Factura</h3>
        <p><strong>Emisión:</strong> ${fechaFormateada}</p>
        <p><strong>Venta:</strong> ${venta_id || '-'}</p>
        ${pedido_id ? `<p><strong>Pedido:</strong> ${pedido_id}</p>` : ''}
      </div>
    </div>

    <!-- Tabla de detalle -->
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Producto</th>
          <th>Cant.</th>
          <th>P. Unit.</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${filasDetalle || '<tr><td colspan="5" class="text-center" style="color:#999; padding:16px;">Sin detalles</td></tr>'}
      </tbody>
    </table>

    <!-- Totales -->
    <div class="totals">
      <table class="totals-table">
        <tr>
          <td>Subtotal</td>
          <td>${formatearMoneda(subtotal)}</td>
        </tr>
        <tr>
          <td>Descuento</td>
          <td>${descuento ?? 0} %</td>
        </tr>
        <tr class="total-row">
          <td>Total</td>
          <td>${formatearMoneda(subtotal)}</td>
        </tr>
        <tr>
          <td>Abono realizado</td>
          <td>${formatearMoneda(abono_realizado)}</td>
        </tr>
        ${total_pendiente ? `
        <tr class="pendiente-row">
          <td>Saldo pendiente</td>
          <td>${formatearMoneda(total_pendiente)}</td>
        </tr>` : ''}
      </table>
    </div>

    <!-- Métodos de pago -->
    <div class="payment-info">
      <span><strong>Método(s) de pago:</strong> ${metodosPagoStr}</span>
      <span><strong>Estado venta:</strong> ${data.venta_estado || '-'}</span>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Documento generado electrónicamente</p>
      <p class="empresa-info">${direccion_empresa || ''} | Tel: ${telefono_empresa || ''} | NIT: ${NIT || ''}</p>
    </div>
  </div>
</body>
</html>`;
};
