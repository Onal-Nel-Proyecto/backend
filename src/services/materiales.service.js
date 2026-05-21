import { MaterialesModel } from '../models/materiales.models.js';

// Listar todos los materiales
export const getAllMaterialesService = async () => {
  try {
    const materiales = await MaterialesModel.getAllMateriales();
    return { data: materiales };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};

// Obtener un material por ID
export const getMaterialByIdService = async ({ id }) => {
  try {
    const material = await MaterialesModel.getMaterialById({ id });
    if (!material) return { err: 'Material no encontrado', errorCode: 404 };
    return { data: material };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};

// Servicio para crear un material — siempre pasa por abastecimiento
export const createMaterialService = async ({ nombre, descripcion, umbralMinimo, cantidadInicial, unidadMedida, tipoMaterial, proveedorId, costo, usuarioId }) => {
  try {
    // Verificar que el proveedor exista
    const provValido = await MaterialesModel.proveedorExists({ proveedorId });
    if (!provValido) return { err: 'El proveedor especificado no existe', errorCode: 400 };

    // Crear el material y obtener su ID generado
    const materialId = await MaterialesModel.createMaterial({ nombre, descripcion, umbralMinimo, cantidadInicial, unidadMedida, tipoMaterial });

    // Registrar el abastecimiento inicial
    await MaterialesModel.registrarAbastecimiento({ proveedorId, usuarioId, materialId, cantidad: cantidadInicial, costo });

    return { msg: 'Material creado correctamente' };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};

// Actualizar un material
export const updateMaterialService = async ({ id, nombre, descripcion, umbralMinimo, unidadMedida, tipoMaterial }) => {
  try {
    const material = await MaterialesModel.getMaterialById({ id });
    if (!material) return { err: 'Material no encontrado', errorCode: 404 };

    await MaterialesModel.updateMaterial({ id, nombre, descripcion, umbralMinimo, unidadMedida, tipoMaterial });
    return { msg: 'Material actualizado correctamente' };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};

// Cambiar estado de un material
export const changeMaterialEstadoService = async ({ id, estado }) => {
  try {
    const material = await MaterialesModel.getMaterialById({ id });
    if (!material) return { err: 'Material no encontrado', errorCode: 404 };

    await MaterialesModel.changeEstado({ id, estado });
    return { msg: `Material marcado como ${estado.toLowerCase()}` };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};
