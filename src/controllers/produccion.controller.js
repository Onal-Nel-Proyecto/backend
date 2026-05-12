import { createNewProduction, deleteProduction, updateProduction } from "../services/produccion.service.js";


export const createNewProductionController = async (req, res) => {
  try {
    const { id, id_detalle } = req.params;
    const result = await createNewProduction(id, id_detalle,req.body)
    console.log("a")
    return res.status(201).json({
      status: true,
      msg: "El detalle del pedido fue agregado a producción."
    })
  } catch (error) {
    console.error('Error en crearDetalle:', error)
    const mensaje = error.message || 'Error interno del servidor';
    return res.status(500).json({
      status: false,
      msg: mensaje
    });
  }
}

export const updateProductionController = async (req, res) => {
  try {
    const { id, id_detalle, id_produccion } = req.params
    const { user_id } = req.user
    const result = await updateProduction(id_produccion, id_detalle, id, user_id, req.body)
    // console.log(result)
    return res.status(201).json({
      status: true,
      msg: "Estado de producción actualizado correctamente."
    })
  } catch (error) {
    console.error('Error en crearDetalle:', error)
    const mensaje = error.message || 'Error interno del servidor';
    return res.status(500).json({
      status: false,
      msg: mensaje
    });
  }
}

export const eliminarProduccion = async (req, res) => {
  try {
    const { id, id_detalle, id_produccion } = req.params;
    const result = await deleteProduction(id, id_detalle, id_produccion)
    return res.status(200).json({
      status: true,
      msg: "Producción cancelada correctamente."
    })
  } catch (error) {
    console.error('Error en crearDetalle:', error)
    const mensaje = error.message || 'Error interno del servidor';
    return res.status(500).json({
      status: false,
      msg: mensaje
    });
  }
}