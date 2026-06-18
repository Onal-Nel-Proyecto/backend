import { ProveedorModel } from "../models/proveedor.models.js";
import { AbastecimientoModel } from "../models/abastecimiento.models.js";
import { calculateTotalPages } from "../utils/paginacion.js";


const estados = ['ACTIVO', 'INACTIVO'];

/**
 * Convierte el campo proTipMatSum (string separado por comas) a un array
 */
const parseSuministros = (proTipMatSum) => {
  if (!proTipMatSum) return [];
  return proTipMatSum
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
};

/**
 * Convierte un array de suministros a string separado por comas para la BD
 */
const stringifySuministros = (suministros = []) => {
  if (!Array.isArray(suministros) || suministros.length === 0) return null;
  return suministros.join(', ');
};

/**
 * Mapea una fila de proveedor al formato de respuesta JSON
 */
const mapearProveedor = (row) => ({
  prov_id: String(row.provId),
  prov_nombre: row.provNom,
  prov_telefono: row.provTel || null,
  prov_correo: row.provCorr || null,
  prov_direccion: row.provDir || null,
  prov_suministro: parseSuministros(row.proTipMatSum),
  pro_estado: row.provEst || 'SIN ESTADO'
});

// ============================================================
// GET /proveedores — listar con paginación y filtros
// ============================================================
export const obtenerProveedores = async (pagina = 1, limite = 15, filtro = null, filtroSuministro = null, filtroEstado = null) => {
  const paginaActual = parseInt(pagina, 10) || 1;
  const limitePagina = parseInt(limite, 10) || 15;
  const offset = (paginaActual - 1) * limitePagina;

  // Normalizar estado: si viene como texto (ACTIVO/INACTIVO), convertir a número
  let estadoNum = null;
  if (filtroEstado) {
    const estadoMap = { 'ACTIVO': 1, 'INACTIVO': 2 };
    estadoNum = estadoMap[filtroEstado.toUpperCase()] ?? parseInt(filtroEstado, 10);
    if (![1, 2].includes(estadoNum)) estadoNum = null;
  }

  let filas, total;

  if (filtro) {
    [filas, total] = await Promise.all([
      ProveedorModel.search(filtro, limitePagina, offset),
      ProveedorModel.getTotalSearch(filtro)
    ]);
  } else if (filtroSuministro) {
    [filas, total] = await Promise.all([
      ProveedorModel.searchBySuministro(filtroSuministro, limitePagina, offset),
      ProveedorModel.getTotalSearchBySuministro(filtroSuministro)
    ]);
  } else if (estadoNum) {
    [filas, total] = await Promise.all([
      ProveedorModel.searchByEstado(estadoNum, limitePagina, offset),
      ProveedorModel.getTotalSearchByEstado(estadoNum)
    ]);
  } else {
    [filas, total] = await Promise.all([
      ProveedorModel.getAll(limitePagina, offset),
      ProveedorModel.getTotal()
    ]);
  }

  const data = filas.map(mapearProveedor);

  return {
    meta: {
      paginas_totales: calculateTotalPages(total, limitePagina),
      pagina_actual: paginaActual,
      total,
      limite: limitePagina
    },
    data
  };
};

// ============================================================
// GET /proveedores/:id — proveedor individual + historial
// ============================================================
export const obtenerProveedorPorId = async (id, pagina = 1, limite = 15) => {
  const resultado = await ProveedorModel.getById(id);
  if (!resultado || !resultado.status) return null;

  const proveedor = resultado.data;

  const paginaActual = parseInt(pagina, 10) || 1;
  const limitePagina = parseInt(limite, 10) || 15;
  const offset = (paginaActual - 1) * limitePagina;

  // Obtener abastecimientos del proveedor
  const [abastecimientos, totalAbastecimientos] = await Promise.all([
    AbastecimientoModel.getByProveedorId(id, limitePagina, offset),
    AbastecimientoModel.getTotalByProveedorId(id)
  ]);

  // Para cada abastecimiento, obtener sus detalles
  const dataAbastecimiento = await Promise.all(
    abastecimientos.map(async (abs) => {
      const detalles = await AbastecimientoModel.getDetallesByAbsId(abs.id_abastecimiento);
      const detalle = detalles.map(d => ({
        tipo_suministro: d.tipo_suministro,
        suministro: {
          sum_id: String(d.id_referencia),
          sum_nombre: d.nombre_suministro || ''
        },
        cantidad: String(d.cantidad),
        costo: Number(d.costo_de_compra)
      }));

      return {
        id_abastecimiento: String(abs.id_abastecimiento),
        fecha_abastecimiento: abs.fecha_abastecimiento,
        detalle
      };
    })
  );

  return {
    prov_nombre: proveedor.provNom,
    prov_telefono: proveedor.provTel || null,
    prov_correo: proveedor.provCorr || null,
    prov_direccion: proveedor.provDir || null,
    prov_suministro: parseSuministros(proveedor.proTipMatSum),
    historial_de_abastecimiento: {
      meta: {
        paginas_totales: calculateTotalPages(totalAbastecimientos, limitePagina),
        pagina_actual: paginaActual,
        total: totalAbastecimientos,
        limite: limitePagina
      },
      data: dataAbastecimiento
    }
  };
};

// ============================================================
// POST /proveedores — crear proveedor
// ============================================================
export const crearProveedor = async (body) => {
  const {
    prov_nombre,
    prov_telefono,
    prov_correo,
    prov_direccion,
    prov_suministro = []
  } = body;

  const prov_id = await ProveedorModel.generateNextId();

  const nuevoProveedor = {
    provId: prov_id,
    provNom: prov_nombre,
    provTel: prov_telefono || null,
    provCorr: prov_correo || null,
    provDir: prov_direccion || null,
    proTipMatSum: stringifySuministros(prov_suministro)
  };

  await ProveedorModel.create(nuevoProveedor);

  // Retornar los datos completos del proveedor creado
  const creado = await ProveedorModel.getById(prov_id);
  if (creado && creado.status) {
    return mapearProveedor(creado.data);
  }
  return { prov_id };
};

// ============================================================
// PUT /proveedores/:id — actualizar proveedor
// ============================================================
export const actualizarProveedor = async (id, body) => {
  const existe = await ProveedorModel.getById(id);
  if (!existe || !existe.status) {
    throw new Error('Proveedor no encontrado');
  }

  const {
    prov_nombre,
    prov_telefono,
    prov_correo,
    prov_direccion,
    prov_suministro = []
  } = body;

  const actualizado = await ProveedorModel.update(id, {
    provNom: prov_nombre,
    provTel: prov_telefono || null,
    provCorr: prov_correo || null,
    provDir: prov_direccion || null,
    proTipMatSum: stringifySuministros(prov_suministro)
  });

  if (!actualizado) {
    throw new Error('No se pudo actualizar el proveedor');
  }

  return {
    status: true,
    msg: 'Proveedor actualizado con éxito'
  };
};

// ============================================================
// DELETE /proveedores/:id — deshabilitar proveedor (INACTIVO)
// ============================================================
export const deshabilitarProveedor = async (id) => {
  const existe = await ProveedorModel.getById(id);
  if (!existe || !existe.status) {
    throw new Error('Proveedor no encontrado');
  }

  if (existe.data.provEst == 2) {
    throw new Error('El proveedor ya se encuentra deshabilitado');
  }

  await ProveedorModel.changeStatus(id, 2); // 2 = INACTIVO

  return {
    status: true,
    msg: 'Proveedor deshabilitado con éxito'
  };
};
