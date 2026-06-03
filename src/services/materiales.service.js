import { MaterialesModel } from '../models/materiales.models.js';
import { calculateTotalPages } from '../utils/paginacion.js';

// Servicio para listar todos los materiales con paginación y filtros
export const getAllMaterialesService = async ({ pagina, limite, nombre, estado, tipoMaterial }) => {
  try {
    const { rows, total } = await MaterialesModel.getAllMateriales({ pagina, limite, nombre, estado, tipoMaterial });

    return {
      data: rows,
      meta: {
        pagina_actual: pagina,
        paginas_totales: calculateTotalPages(total, limite),
        total,
        limite
      }
    };
  } catch (error) {
    return { err: 'Error al listar materiales', errorCode: 500 };
  }
};

// Servicio para obtener un material por ID
export const getMaterialByIdService = async ({ id }) => {
  try {
    const material = await MaterialesModel.getMaterialById({ id });
    if (!material) return { err: 'Material no encontrado', errorCode: 404 };
    return { data: material };
  } catch (error) {
    return { err: 'Error al obtener material', errorCode: 500 };
  }
};

// Servicio para crear un material
export const createMaterialService = async ({ nombre, descripcion, umbralMinimo, unidadMedida, tipoMaterial }) => {
  try {
    const id = await MaterialesModel.createMaterial({ nombre, descripcion, umbralMinimo, unidadMedida, tipoMaterial });
    return { msg: 'Material creado correctamente', id };
  } catch (error) {
    return { err: 'Error al crear material', errorCode: 500 };
  }
};

// Servicio para actualizar un material
export const updateMaterialService = async ({ id, nombre, descripcion, umbralMinimo, unidadMedida, tipoMaterial }) => {
  try {
    const material = await MaterialesModel.getMaterialById({ id });
    if (!material) return { err: 'Material no encontrado', errorCode: 404 };

    await MaterialesModel.updateMaterial({ id, nombre, descripcion, umbralMinimo, unidadMedida, tipoMaterial });
    return { msg: 'Material actualizado correctamente' };
  } catch (error) {
    return { err: 'Error al actualizar material', errorCode: 500 };
  }
};

// Servicio para cambiar estado de un material
export const changeMaterialEstadoService = async ({ id, estado }) => {
  try {
    const material = await MaterialesModel.getMaterialById({ id });
    if (!material) return { err: 'Material no encontrado', errorCode: 404 };

    await MaterialesModel.changeEstado({ id, estado });
    return { msg: `Material marcado como ${estado.toLowerCase()}` };
  } catch (error) {
    return { err: 'Error al cambiar estado del material', errorCode: 500 };
  }
};
