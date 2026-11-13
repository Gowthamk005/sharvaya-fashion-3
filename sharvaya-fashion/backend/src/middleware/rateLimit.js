import rateLimit from 'express-rate-limit';

// Slows down password guessing and form spam. Each function instance counts separately,
// which is fine for a small shop; use a shared store if traffic grows.
const make = (windowMinutes, limit, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: message },
  });

export const loginLimiter = make(15, 10, 'Too many sign-in attempts. Please wait 15 minutes and try again.');
export const contactLimiter = make(10, 5, 'Too many messages sent. Please try again in a few minutes.');
