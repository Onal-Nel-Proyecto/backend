import { normalizeEmptyStrings } from '../utils/normalizacion_datos.js';
import {
  getVentasService,
  getVentaByIdService,
  createVentaService,
  updateVentaService,
  anularVentaService,
  getReporteVentasMensualService,
  getReporteVentasPeriodoService
} from '../services/ventas.service.js';
import { generarReportePDF } from '../utils/reportesPdf.js';
import { generarReporteExcel } from '../utils/reportesExcel.js';

export const getVentasController = async (req, res, next) => {
  try {
    const {
      pagina = 1,
      limite = 15,
      fecha_registro,
      fecha_limite_pago,
      cliente,
      estado
    } = req.query;

    const filtros = {
      fecha_registro,
      fecha_limite_pago,
      cliente,
      estado
    };

    const result = await getVentasService(pagina, limite, filtros);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en getVentasController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};

export const getVentaByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await getVentaByIdService(id);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en getVentaByIdController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};

export const createVentaController = async (req, res, next) => {
  try {
    req.body = normalizeEmptyStrings(req.body);

    const userId = req.user.user_id;

    const result = await createVentaService(req.body, userId);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error en createVentaController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};

export const updateVentaController = async (req, res, next) => {
  try {
    req.body = normalizeEmptyStrings(req.body);

    const { id } = req.params;

    const result = await updateVentaService(id, req.body);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en updateVentaController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};

export const anularVentaController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await anularVentaService(id);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en anularVentaController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};

// ─────────────────────────────────────────────
//  Reportes de ventas
// ─────────────────────────────────────────────

export const getReporteVentasMensualController = async (req, res, next) => {
  try {
    const { mes, anio } = req.query;
    const result = await getReporteVentasMensualService(mes, anio);
    res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error('Error en getReporteVentasMensualController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};

export const getReporteVentasPeriodoController = async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const result = await getReporteVentasPeriodoService(fechaInicio, fechaFin);
    res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error('Error en getReporteVentasPeriodoController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};

// ─────────────────────────────────────────────
//  Exportación PDF
// ─────────────────────────────────────────────

export const exportarReporteMensualPDFController = async (req, res, next) => {
  try {
    const { mes, anio } = req.query;
    const data = await getReporteVentasMensualService(mes, anio);
    const periodo = `Mes ${mes} / ${anio}`;
    const pdfBuffer = await generarReportePDF(data, 'Reporte de Ventas Mensual', periodo);

    const filename = `reporte_ventas_mensual_${String(mes).padStart(2, '0')}_${anio}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error en exportarReporteMensualPDFController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};

export const exportarReportePeriodoPDFController = async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const data = await getReporteVentasPeriodoService(fechaInicio, fechaFin);
    const periodo = `Del ${fechaInicio} al ${fechaFin}`;
    const pdfBuffer = await generarReportePDF(data, 'Reporte de Ventas por Periodo', periodo);

    const filename = `reporte_ventas_periodo_${fechaInicio}_${fechaFin}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error en exportarReportePeriodoPDFController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};

// ─────────────────────────────────────────────
//  Exportación Excel
// ─────────────────────────────────────────────

export const exportarReporteMensualExcelController = async (req, res, next) => {
  try {
    const { mes, anio } = req.query;
    const data = await getReporteVentasMensualService(mes, anio);
    const periodo = `Mes ${mes} / ${anio}`;
    const excelBuffer = await generarReporteExcel(data, periodo);

    const filename = `reporte_ventas_mensual_${String(mes).padStart(2, '0')}_${anio}.xlsx`;
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': excelBuffer.length,
    });
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error en exportarReporteMensualExcelController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};

export const exportarReportePeriodoExcelController = async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const data = await getReporteVentasPeriodoService(fechaInicio, fechaFin);
    const periodo = `Del ${fechaInicio} al ${fechaFin}`;
    const excelBuffer = await generarReporteExcel(data, periodo);

    const filename = `reporte_ventas_periodo_${fechaInicio}_${fechaFin}.xlsx`;
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': excelBuffer.length,
    });
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error en exportarReportePeriodoExcelController:', error);
    const status = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error interno del servidor';
    res.status(status).json({ status: false, error: message });
  }
};


