import { CategoriaModel } from '../models/categoria.models.js';

// Normalizar texto: minúsculas, sin tildes, sin espacios extra
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
};

// Helper para parsear arrays desde la DB (JSON string o formato con comillas simples)
const safeParseArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;

  // Intentar JSON.parse primero (formato con comillas dobles)
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Si falla, probar con formato de comillas simples: "['A', 'B']"
  }

  // Extraer manualmente los elementos entre corchetes
  const match = val.match(/\[(.*?)\]/s);
  if (!match) return [];

  return match[1]
    .split(/',\s*'/)
    .map(item => item.replace(/^\[?'?|'?\]?$/g, '').trim())
    .filter(item => item.length > 0);
};

// Servicio para listar todas las categorías
export const getAllCategoriasService = async ({ nombre, estado }) => {
  try {
    const rows = await CategoriaModel.getAll({ nombre, estado });

    const data = rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion || null,
      estado: row.estado,
      categoria_tipo_prenda: safeParseArray(row.catTipsPrendas),
      categoria_talla_referencia: safeParseArray(row.catTallaRef),
      restricciones_medidas: safeParseArray(row.catRestMed)
    }));

    return { data };
  } catch (error) {
    return { err: 'Error al listar categorías', errorCode: 500 };
  }
};

// Servicio para obtener una categoría por ID
export const getCategoriaByIdService = async ({ id }) => {
  try {
    const categoria = await CategoriaModel.getById(id);
    if (!categoria) return { err: 'Categoría no encontrada', errorCode: 404 };

    return {
      data: {
        id: categoria.id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || null,
        estado: categoria.estado,
        categoria_tipo_prenda: safeParseArray(categoria.catTipsPrendas),
        categoria_talla_referencia: safeParseArray(categoria.catTallaRef),
        restricciones_medidas: safeParseArray(categoria.catRestMed)
      }
    };
  } catch (error) {
    return { err: 'Error al obtener categoría', errorCode: 500 };
  }
};

// Servicio para crear una categoría
export const createCategoriaService = async ({ catNom, catDesc, catEst, catTipsPrendas, catTallaRef, catRestMed }) => {
  try {
    const normalizedInput = normalizeText(catNom);
    const todas = await CategoriaModel.getAll({});
    const duplicado = todas.find(c => normalizeText(c.nombre) === normalizedInput);
    if (duplicado) {
      return { err: `Ya existe una categoría con el nombre "${duplicado.nombre}"`, errorCode: 400 };
    }

    const id = await CategoriaModel.create({ catNom, catDesc, catEst, catTipsPrendas, catTallaRef, catRestMed });

    return { msg: 'Categoría creada correctamente', id };
  } catch (error) {
    return { err: 'Error al crear categoría', errorCode: 500 };
  }
};

// Servicio para actualizar una categoría
export const updateCategoriaService = async ({ id, catNom, catDesc, catEst, catTipsPrendas, catTallaRef, catRestMed }) => {
  try {
    const categoria = await CategoriaModel.getById(id);
    if (!categoria) return { err: 'Categoría no encontrada', errorCode: 404 };

    const normalizedInput = normalizeText(catNom);
    const todas = await CategoriaModel.getAll({});
    const duplicado = todas.find(c => Number(c.id) !== Number(id) && normalizeText(c.nombre) === normalizedInput);
    if (duplicado) {
      return { err: `Ya existe otra categoría con el nombre "${duplicado.nombre}"`, errorCode: 400 };
    }

    await CategoriaModel.update(id, { catNom, catDesc, catEst, catTipsPrendas, catTallaRef, catRestMed });

    return { msg: 'Categoría actualizada correctamente' };
  } catch (error) {
    return { err: 'Error al actualizar categoría', errorCode: 500 };
  }
};

// Servicio para cambiar estado de una categoría
export const changeCategoriaEstadoService = async ({ id, estado }) => {
  try {
    const categoria = await CategoriaModel.getById(id);
    if (!categoria) return { err: 'Categoría no encontrada', errorCode: 404 };

    if (categoria.estado === estado) {
      return { err: `La categoría ya se encuentra ${estado.toLowerCase()}`, errorCode: 400 };
    }

    await CategoriaModel.changeStatus(id, estado);

    const mensaje = estado === 'ACTIVO' ? 'Categoría activada correctamente' : 'Categoría desactivada correctamente';
    return { msg: mensaje };
  } catch (error) {
    return { err: 'Error al cambiar estado de la categoría', errorCode: 500 };
  }
};
