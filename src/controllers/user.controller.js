import {
  getAllUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  changeUserStatusService
} from '../services/user.services.js'

// Controlador para obtener todos los usuarios
const ctlGetAllUsers = async (req, res) => {
  try {
    const result = await getAllUsersService();

    if (result.err) return res.status(result.errorCode).json({ err: result.err });

    res.status(200).json(result.data);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Controlador para obtener un usuario por ID
const ctlGetUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getUserByIdService({ id });

    if (result.err) return res.status(result.errorCode).json({ err: result.err });

    res.status(200).json(result.data);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Controlador para crear un nuevo usuario
const ctlCreateUser = async (req, res) => {
  try {
    const { id, nombres, apellidos, telefono, correo, password, rolId, supervisorId } = req.body;

    const result = await createUserService({ id, nombres, apellidos, telefono, correo, password, rolId, supervisorId });

    if (result.err) return res.status(result.errorCode).json({ err: result.err });

    res.status(201).json({ msg: result.msg });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Controlador para actualizar un usuario
const ctlUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombres, apellidos, telefono, correo, rolId, supervisorId } = req.body;

    const result = await updateUserService({ id, nombres, apellidos, telefono, correo, rolId, supervisorId });

    if (result.err) return res.status(result.errorCode).json({ err: result.err });

    res.status(200).json({ msg: result.msg });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Controlador para cambiar el estado de un usuario (bloquear o activar)
const ctlChangeUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const result = await changeUserStatusService({ id, estado });

    if (result.err) return res.status(result.errorCode).json({ err: result.err });

    res.status(200).json({ msg: result.msg });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

export { ctlGetAllUsers, ctlGetUserById, ctlCreateUser, ctlUpdateUser, ctlChangeUserStatus };
