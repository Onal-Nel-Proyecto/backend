import { UserModel } from '../models/user.models.js';

// Servicio para listar todos los usuarios
export const getAllUsersService = async () => {
  try {
    const users = await UserModel.getAllUsers();
    return { data: users };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};

// Servicio para obtener un usuario por ID
export const getUserByIdService = async ({ id }) => {
  try {
    const user = await UserModel.getUserById({ id });

    if (!user) return { err: 'Usuario no encontrado', errorCode: 404 };

    return { data: user };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};

// Servicio para crear un nuevo usuario
export const createUserService = async ({ id, nombres, apellidos, telefono, correo, password, rolId, supervisorId }) => {
  try {
    // Verificar que el rol espicificado exista
    const rolValido = await UserModel.rolExists({ rolId });
    if (!rolValido) return { err: 'El rol especificado no existe', errorCode: 400 };

    // Verificar que el supervisor exista 
    if (supervisorId) {
      const supervisorValido = await UserModel.supervisorExists({ supervisorId });
      if (!supervisorValido) return { err: 'El supervisor especificado no existe', errorCode: 400 };
    }

    // Verificar que no exista otro usuario con el mismo correo
    const correoEnUso = await UserModel.emailExists({ correo, excludeId: '' });
    if (correoEnUso) return { err: 'El correo ya está registrado', errorCode: 409 };

    await UserModel.createUser({ id, nombres, apellidos, telefono, correo, password, rolId, supervisorId });

    return { msg: 'Usuario creado correctamente' };
  } catch (error) {
    // Error de clave primaria duplicada (ID ya existe)
    if (error.code === 'ER_DUP_ENTRY') return { err: 'El ID ya está registrado', errorCode: 409 };
    return { err: error.message, errorCode: 500 };
  }
};

// Servicio para actualizar un usuario
export const updateUserService = async ({ id, nombres, apellidos, telefono, correo, rolId, supervisorId }) => {
  try {
    // Verificar que el usuario exista antes de actualizar
    const userExists = await UserModel.getUserById({ id });
    if (!userExists) return { err: 'Usuario no encontrado', errorCode: 404 };

    // Verificar que el rol espicificado exista
    const rolValido = await UserModel.rolExists({ rolId });
    if (!rolValido) return { err: 'El rol especificado no existe', errorCode: 400 };

    // Verificar que el supervisor exista 
    if (supervisorId) {
      const supervisorValido = await UserModel.supervisorExists({ supervisorId });
      if (!supervisorValido) return { err: 'El supervisor especificado no existe', errorCode: 400 };
    }

    // Verificar que el correo nuevo no lo tenga otro usuario
    const correoEnUso = await UserModel.emailExists({ correo, excludeId: id });
    if (correoEnUso) return { err: 'El correo ya está en uso por otro usuario', errorCode: 409 };

    await UserModel.updateUser({ id, nombres, apellidos, telefono, correo, rolId, supervisorId });

    return { msg: 'Usuario actualizado correctamente' };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};

// Servicio para bloquear un usuario (estado 2) o reactivarlo (estado 1)
export const changeUserStatusService = async ({ id, estado }) => {
  try {
    // Verificar que el usuario exista
    const userExists = await UserModel.getUserById({ id });
    if (!userExists) return { err: 'Usuario no encontrado', errorCode: 404 };

    await UserModel.changeUserStatus({ id, estado });

    const mensaje = estado === 2 ? 'Usuario bloqueado correctamente' : 'Usuario activado correctamente';
    return { msg: mensaje };
  } catch (error) {
    return { err: error.message, errorCode: 500 };
  }
};
