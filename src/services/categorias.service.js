import { CategoriaModel } from '../models/categoria.models.js';

// Servicio para listar todas las categorías
export const getAllCategoriasService = async ({ nombre, estado }) => {
  try {
    const rows = await CategoriaModel.getAll({ nombre, estado });

    const data = rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion || null,
      estado: row.estado
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
        estado: categoria.estado
      }
    };
  } catch (error) {
    return { err: 'Error al obtener categoría', errorCode: 500 };
  }
};

// Servicio para crear una categoría
export const createCategoriaService = async ({ catNom, catDesc, catEst }) => {
  try {
    const existe = await CategoriaModel.existsByName(catNom);
    if (existe) return { err: 'Ya existe una categoría con ese nombre', errorCode: 400 };

    const id = await CategoriaModel.create({ catNom, catDesc, catEst });

    return { msg: 'Categoría creada correctamente', id };
  } catch (error) {
    return { err: 'Error al crear categoría', errorCode: 500 };
  }
};

// Servicio para actualizar una categoría
export const updateCategoriaService = async ({ id, catNom, catDesc, catEst }) => {
  try {
    const categoria = await CategoriaModel.getById(id);
    if (!categoria) return { err: 'Categoría no encontrada', errorCode: 404 };

    const existe = await CategoriaModel.existsByName(catNom, id);
    if (existe) return { err: 'Ya existe otra categoría con ese nombre', errorCode: 400 };

    await CategoriaModel.update(id, { catNom, catDesc, catEst });

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
