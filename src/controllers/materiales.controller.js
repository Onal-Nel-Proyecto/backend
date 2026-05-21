import {
  getAllMaterialesService,
  getMaterialByIdService,
  createMaterialService,
  updateMaterialService,
  changeMaterialEstadoService
} from '../services/materiales.service.js';

// Obtener todos los materiales
const ctlGetAllMateriales = async (req, res) => {
  try {
    const result = await getAllMaterialesService();
    if (result.err) return res.status(result.errorCode).json({ err: result.err });
    res.status(200).json(result.data);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Obtener un material por ID
const ctlGetMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getMaterialByIdService({ id });
    if (result.err) return res.status(result.errorCode).json({ err: result.err });
    res.status(200).json(result.data);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Crear material
const ctlCreateMaterial = async (req, res) => {
  try {
    const { nombre, descripcion, umbralMinimo, cantidadInicial, unidadMedida, tipoMaterial, proveedorId, costo } = req.body;
    const usuarioId = req.user.user_id;

    const result = await createMaterialService({ nombre, descripcion, umbralMinimo, cantidadInicial, unidadMedida, tipoMaterial, proveedorId, costo, usuarioId });
    if (result.err) return res.status(result.errorCode).json({ err: result.err });
    res.status(201).json({ msg: result.msg });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Actualizar material
const ctlUpdateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, umbralMinimo, unidadMedida, tipoMaterial } = req.body;

    const result = await updateMaterialService({ id, nombre, descripcion, umbralMinimo, unidadMedida, tipoMaterial });
    if (result.err) return res.status(result.errorCode).json({ err: result.err });
    res.status(200).json({ msg: result.msg });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Cambiar estado del material
const ctlChangeMaterialEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const result = await changeMaterialEstadoService({ id, estado });
    if (result.err) return res.status(result.errorCode).json({ err: result.err });
    res.status(200).json({ msg: result.msg });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

export { ctlGetAllMateriales, ctlGetMaterialById, ctlCreateMaterial, ctlUpdateMaterial, ctlChangeMaterialEstado };
