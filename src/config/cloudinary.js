import { v2 as cloudinary } from 'cloudinary';
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from './config.js';

// console.log({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY ? 'OK' : 'MISSING',
//   api_secret: process.env.CLOUDINARY_API_SECRET ? 'OK' : 'MISSING'
// });

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key:   CLOUDINARY_API_KEY,
  api_secret:   CLOUDINARY_API_SECRET
});

export default cloudinary;