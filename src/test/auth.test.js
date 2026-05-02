import { loginUser } from '../src/services/auth.service.js';
import { UserModel } from '../src/models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../src/models/user.model.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Login Service', () => {

  test('debe loguear correctamente', async () => {
    UserModel.getUserByEmail.mockResolvedValue({
      id: 1,
      usuCor: 'test@mail.com',
      usuCon: 'hashedpass'
    });

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('fake-token');

    const result = await loginUser({
      email: 'test@mail.com',
      pass: '123456'
    });

    expect(result.token).toBe('fake-token');
  });

  test('debe fallar si el usuario no existe', async () => {
    UserModel.getUserByEmail.mockResolvedValue(null);

    await expect(
      loginUser({ email: 'no@mail.com', pass: '123' })
    ).rejects.toThrow();
  });

  test('debe fallar si la contraseña es incorrecta', async () => {
    UserModel.getUserByEmail.mockResolvedValue({
      id: 1,
      usuCon: 'hashedpass'
    });

    bcrypt.compare.mockResolvedValue(false);

    await expect(
      loginUser({ email: 'test@mail.com', pass: 'wrong' })
    ).rejects.toThrow();
  });

});