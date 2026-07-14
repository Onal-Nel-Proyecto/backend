import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../config/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { AppError } from '../utils/appError.js';

// const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads/pedidos');
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Crear el directorio de uploads si no existe
// if (!fs.existsSync(UPLOADS_DIR)) {
//   fs.mkdirSync(UPLOADS_DIR, { recursive: true });
// }

// ───────────────────────────────────────────────────────
//  Almacenamiento por defecto: disco local
//  ─ Para cambiar a S3, Cloudinary, etc., reemplaza la
//    variable `storage` con un engine compatible con multer
//    Ejemplo: multer-s3, cloudinary-storage, etc.
// ───────────────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pedidos',
    public_id: (req, file) => uuidv4(),
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
  }
});


const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Solo se permiten imágenes (JPEG, PNG, WebP, GIF)', 400), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
});
