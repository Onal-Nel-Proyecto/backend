import { AppError } from '../utils/appError.js';
import {
  getAllUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  changeUserStatusService,
  updatePasswordService
} from '../services/user.services.js'

// Controlador para obtener todos los usuarios
const ctlGetAllUsers = async (req, res, next) => {
  try {
    const result = await getAllUsersService();

    if (result.err) return next(new AppError(result.err, result.errorCode));

    res.status(200).json(result.data);
  } catch (error) {
    console.error('Error en ctlGetAllUsers:', error);
    next(new AppError('Error interno del servidor', 500));
  }
};

// Controlador para obtener un usuario por ID
const ctlGetUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getUserByIdService({ id });

    if (result.err) return next(new AppError(result.err, result.errorCode));

    res.status(200).json(result.data);
  } catch (error) {
    console.error('Error en ctlGetUserById:', error);
    next(new AppError('Error interno del servidor', 500));
  }
};

// Controlador para crear un nuevo usuario
const ctlCreateUser = async (req, res, next) => {
  try {
    const { id, nombres, apellidos, telefono, correo, password, rolId, supervisorId } = req.body;

    const result = await createUserService({ id, nombres, apellidos, telefono, correo, password, rolId, supervisorId });

    if (result.err) return next(new AppError(result.err, result.errorCode));

    res.status(201).json({ msg: result.msg });
  } catch (error) {
    console.error('Error en ctlCreateUser:', error);
    next(new AppError('Error interno del servidor', 500));
  }
};

// Controlador para actualizar un usuario
const ctlUpdateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombres, apellidos, telefono, correo, rolId, supervisorId } = req.body;

    const result = await updateUserService({ id, nombres, apellidos, telefono, correo, rolId, supervisorId });

    if (result.err) return next(new AppError(result.err, result.errorCode));

    res.status(200).json({ msg: result.msg });
  } catch (error) {
    console.error('Error en ctlUpdateUser:', error);
    next(new AppError('Error interno del servidor', 500));
  }
};

// Controlador para cambiar el estado de un usuario (bloquear o activar)
const ctlChangeUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar que el usuario no se bloquee a sí mismo
    if (String(req.user.user_id) === id && Number(estado) === 2) {
      return next(new AppError('No puedes bloquearte a ti mismo', 400));
    }

    const result = await changeUserStatusService({ id, estado });

    if (result.err) return next(new AppError(result.err, result.errorCode));

    res.status(200).json({ msg: result.msg });
  } catch (error) {
    console.error('Error en ctlChangeUserStatus:', error);
    next(new AppError('Error interno del servidor', 500));
  }
};

// Controlador para actualizar la contraseña de un usuario
const ctlUpdatePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password, passwordActual } = req.body;

    const result = await updatePasswordService({
      id,
      password,
      passwordActual,
      requesterId: req.user.user_id,
      requesterRol: req.user.rol
    });

    if (result.err) return next(new AppError(result.err, result.errorCode));

    res.status(200).json({ status: true, msg: result.msg });
  } catch (error) {
    console.error('Error en ctlUpdatePassword:', error);
    next(new AppError('Error interno del servidor', 500));
  }
};

export { ctlGetAllUsers, ctlGetUserById, ctlCreateUser, ctlUpdateUser, ctlChangeUserStatus, ctlUpdatePassword };
