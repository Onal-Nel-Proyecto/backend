// Importas jest en modo ESM (necesario cuando usas "type": "module")
import { jest } from '@jest/globals';


// 🔥 MOCKS (ANTES de importar el service)
// En ESM debes mockear antes de hacer los imports reales

// Mock del modelo de usuario
jest.unstable_mockModule('../models/user.models.js', () => ({
  UserModel: {
    // Simulas el método que consulta la BD
    getUserByEmail: jest.fn()
  }
}));

// Mock de bcryptjs
jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    // Simulas la comparación de contraseñas
    compareSync: jest.fn()
  }
}));

// Mock de jsonwebtoken
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    // Simulas la generación del token
    sign: jest.fn()
  }
}));


// 🔥 IMPORTS (DESPUÉS de mockear)
// Aquí ya cargas los módulos, pero usando los mocks

const bcrypt = (await import('bcryptjs')).default;
const { loginUser } = await import('../services/auth.service.js');
const { UserModel } = await import('../models/user.models.js');
const jwt = (await import('jsonwebtoken')).default;


// Agrupas los tests relacionados al login
describe('Login Service', () => {

  // Caso: login exitoso
  test('debe loguear correctamente', async () => {

    // 🔹 Simulas lo que devolvería la BD
    UserModel.getUserByEmail.mockResolvedValue({
      status: true,
      data: {
        user_id: 1,
        nombres: 'Test',
        apellidos: 'User',
        correo: 'test@mail.com',
        rol: 'admin',
        contraseña: 'hashedpass',
        estado: 1
      }
    });

    // 🔹 Simulas que la contraseña es correcta
    bcrypt.compareSync.mockReturnValue(true);

    // 🔹 Simulas la creación del token
    jwt.sign.mockReturnValue('fake-token');

    // 🔹 Ejecutas la función real del servicio
    const result = await loginUser({
      email: 'test@mail.com',
      pass: '123456'
    });

    // 🔹 Verificas el resultado esperado
    expect(result.token).toBe('fake-token');
  });

});