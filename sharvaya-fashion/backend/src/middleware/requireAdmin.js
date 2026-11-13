import jwt from 'jsonwebtoken';
import { getConfig } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

// Lets a request through only if it carries a valid admin token: "Authorization: Bearer <token>".
export function requireAdmin(req, _res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return next(new HttpError(401, 'Please sign in to continue'));

  try {
    const payload = jwt.verify(token, getConfig().jwtSecret, { algorithms: ['HS256'] });
    req.admin = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return next(new HttpError(401, 'Your session has expired. Please sign in again.'));
  }
}
