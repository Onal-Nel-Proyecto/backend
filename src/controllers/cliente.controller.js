import { actualizarCliente, changeStatusServices, crearCliente, obtenerClientePorId, obtenerClientes } from "../services/clientes.service.js";


export const getClientes = async (req, res) => {
  try {
    const { pagina, limite } = req.query;
    const resultado = await obtenerClientes(pagina, limite);
    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await obtenerClientePorId(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createCliente = async (req, res) => {
  try {
    req.body.user_id = req.user.user_id
    const clienteCreado = await crearCliente(req.body);
    res.status(201).json(clienteCreado);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    // Si el error es de validación (usuario no existe), devuelve 400
    if (error.message.includes('no existe')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const changeStatus = async (req, res) => {
  try {
    req.body.id = req.params.id
    const resultado = await changeStatusServices(req.body);
    res.status(200).json({
      status: true,
      msg: "El cliente fue eliminado"
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    // Si el error es de validación (usuario no existe), devuelve 400
    if (error.message.includes('no existe')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await actualizarCliente(id, req.body);
    res.json(resultado);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    if (error.message === 'Cliente no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};