import { Router } from 'express';
import { findImage, openImageStream } from '../services/imageStore.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

// Public: streams a product photo from GridFS. Ids never change, so browsers and CDNs may cache them for a year.
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const file = await findImage(req.params.id);
    if (!file) throw new HttpError(404, 'Photo not found');

    res.set({
      'Content-Type': file.contentType || 'application/octet-stream',
      'Content-Length': String(file.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    });

    const stream = openImageStream(req.params.id);
    stream.on('error', (err) => {
      console.error('[images] stream failed', err.message);
      if (!res.headersSent) res.status(500).end();
      else res.destroy(err);
    });
    stream.pipe(res);
  })
);

export default router;
