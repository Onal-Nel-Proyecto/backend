import {
  getAllMaterialesService,
  getMaterialByIdService,
  createMaterialService,
  updateMaterialService,
  changeMaterialEstadoService
} from '../services/materiales.service.js';

// Obtener todos los materiales con paginación y filtros opcionales
const ctlGetAllMateriales = async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 15;
    const { nombre, estado, tipoMaterial } = req.query;

    const result = await getAllMaterialesService({ pagina, limite, nombre, estado, tipoMaterial });
    if (result.err) return res.status(result.errorCode).json({ err: result.err });
    res.status(200).json(result);
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
    const { nombre, descripcion, umbralMinimo, unidadMedida, tipoMaterial } = req.body;

    const result = await createMaterialService({ nombre, descripcion, umbralMinimo, unidadMedida, tipoMaterial });
    if (result.err) return res.status(result.errorCode).json({ err: result.err });
    res.status(201).json({ msg: result.msg, id: result.id });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Actualizar material — ID viene de req.params
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
