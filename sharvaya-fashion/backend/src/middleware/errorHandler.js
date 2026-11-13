import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError.js';

export function notFound(req, _res, next) {
  next(new HttpError(404, `No route for ${req.method} ${req.path}`));
}

// The one place errors become responses. Real error details go to the logs, never to the browser.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.details ? { details: err.details } : {}) });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Please check the highlighted fields',
      details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: 'Please check the highlighted fields',
      details: Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
    });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'That link or id is not valid' });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'The request body is not valid JSON' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'The request is too large' });
  }

  console.error('[api] unhandled error:', err);
  return res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
}
