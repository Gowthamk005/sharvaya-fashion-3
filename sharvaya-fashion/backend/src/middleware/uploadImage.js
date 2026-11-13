import multer from 'multer';
import { PRODUCT_LIMITS } from '../config/constants.js';
import { HttpError } from '../utils/httpError.js';

// Photos are held in memory (never written to the function's disk), then checked and stored in GridFS.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: PRODUCT_LIMITS.maxImageBytes, files: 1, fields: 10 },
}).single('image');

export function uploadImage(req, res, next) {
  upload(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return next(new HttpError(413, 'The photo must be 5 MB or smaller'));
    if (err instanceof multer.MulterError) return next(new HttpError(400, 'The photo could not be read'));
    return next(err);
  });
}
