import { getUserByEmail } from '../models/auth.models.js';
import bcrypt from 'bcryptjs';

export const loginUser = async (email, pass) => {
  const data = await getUserByEmail(email)
  // let contra = bcrypt.hashSync(data.usuPassHash, 10)
  // console.log(contra)
  return data
}