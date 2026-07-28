import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { uploadImage, getUploadPath } from '../controllers/uploadController.js';
import { authMiddleware } from '../middleware/auth.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function createUploadRouter(uploadDir: string): Router {
  const router = Router();
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, getUploadPath(uploadDir)),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP'));
      }
    },
  });

  router.use(authMiddleware);
  router.post('/image', upload.single('image'), uploadImage);
  return router;
}
