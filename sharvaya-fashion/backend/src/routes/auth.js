import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import { z } from 'zod';
import { getConfig } from '../config/env.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { Admin } from '../models/Admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

// Used when the email does not exist, so a wrong email takes as long to reject as a wrong password.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(120).pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Enter your password').max(200),
});

router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const { jwtSecret, jwtExpiresIn } = getConfig();
    if (!jwtSecret) throw new Error('JWT_SECRET is not set');

    const admin = await Admin.findOne({ email }).select('+passwordHash');
    const ok = await bcrypt.compare(password, admin?.passwordHash || DUMMY_HASH);
    if (!admin || !ok) throw new HttpError(401, 'Incorrect email or password');

    const token = jwt.sign({ sub: String(admin._id), email: admin.email, role: 'admin' }, jwtSecret, {
      algorithm: 'HS256',
      expiresIn: jwtExpiresIn,
    });
    res.json({ token, user: { email: admin.email } });
  })
);

router.get('/me', requireAdmin, (req, res) => {
  res.json({ user: { email: req.admin.email } });
});

export default router;
