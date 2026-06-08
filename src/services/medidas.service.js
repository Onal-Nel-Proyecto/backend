import { MedidaModel } from '../models/medidas.models.js';

// Servicio para listar todas las medidas
export const getAllMedidasService = async ({ nombre, estado }) => {
  try {
    const rows = await MedidaModel.getAll({ nombre, estado });

    const data = rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion || null,
      estado: row.estado
    }));

    return { data };
  } catch (error) {
    return { err: 'Error al listar medidas', errorCode: 500 };
  }
};

// Servicio para obtener una medida por ID
export const getMedidaByIdService = async ({ id }) => {
  try {
    const medida = await MedidaModel.getById(id);
    if (!medida) return { err: 'Medida no encontrada', errorCode: 404 };

    return {
      data: {
        id: medida.id,
        nombre: medida.nombre,
        descripcion: medida.descripcion || null,
        estado: medida.estado
      }
    };
  } catch (error) {
    return { err: 'Error al obtener medida', errorCode: 500 };
  }
};

// Servicio para crear una medida
export const createMedidaService = async ({ medNom, medDesc, medEst }) => {
  try {
    const existe = await MedidaModel.existsByName(medNom);
    if (existe) return { err: 'Ya existe una medida con ese nombre', errorCode: 400 };

    const id = await MedidaModel.create({ medNom, medDesc, medEst });

    return { msg: 'Medida creada correctamente', id };
  } catch (error) {
    return { err: 'Error al crear medida', errorCode: 500 };
  }
};

// Servicio para actualizar una medida
export const updateMedidaService = async ({ id, medNom, medDesc, medEst }) => {
  try {
    const medida = await MedidaModel.getById(id);
    if (!medida) return { err: 'Medida no encontrada', errorCode: 404 };

    const existe = await MedidaModel.existsByName(medNom, id);
    if (existe) return { err: 'Ya existe otra medida con ese nombre', errorCode: 400 };

    await MedidaModel.update(id, { medNom, medDesc, medEst });

    return { msg: 'Medida actualizada correctamente' };
  } catch (error) {
    return { err: 'Error al actualizar medida', errorCode: 500 };
  }
};

// Servicio para cambiar estado de una medida
export const changeMedidaEstadoService = async ({ id, estado }) => {
  try {
    const medida = await MedidaModel.getById(id);
    if (!medida) return { err: 'Medida no encontrada', errorCode: 404 };

    if (medida.estado === estado) {
      return { err: `La medida ya se encuentra ${estado.toLowerCase()}`, errorCode: 400 };
    }

    await MedidaModel.changeStatus(id, estado);

    const mensaje = estado === 'ACTIVO' ? 'Medida activada correctamente' : 'Medida desactivada correctamente';
    return { msg: mensaje };
  } catch (error) {
    return { err: 'Error al cambiar estado de la medida', errorCode: 500 };
  }
};
