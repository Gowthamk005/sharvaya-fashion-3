import { Router } from 'express';
import { z } from 'zod';
import { contactLimiter } from '../middleware/rateLimit.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  email: z.string().trim().toLowerCase().max(120).pipe(z.email('Enter a valid email address')),
  phone: z
    .union([z.literal(''), z.string().trim().regex(/^[0-9+()\-\s]{7,20}$/, 'Enter a valid phone number')])
    .optional(),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters)').max(2000),
  // Honeypot: real visitors never see or fill this hidden field, bots often do.
  website: z.string().max(0).optional(),
});

router.post(
  '/',
  contactLimiter,
  asyncHandler(async (req, res) => {
    const { name, email, phone = '', message } = contactSchema.parse(req.body);
    await ContactMessage.create({ name, email, phone, message });
    res.status(201).json({ ok: true, message: 'Thank you! Your message has been received.' });
  })
);

export default router;
