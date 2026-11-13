import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { getConfig } from './config/env.js';
import { connectDB } from './db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contact.js';
import imageRoutes from './routes/images.js';
import productRoutes from './routes/products.js';

// Builds the Express app. Used by both the local server (src/server.js) and the Firebase function (index.js).
// Every route lives under /api, which Firebase Hosting forwards to this function.
export function createApp({ ensureDb = connectDB } = {}) {
  const app = express();
  const { trustProxy, corsOrigins } = getConfig();

  app.disable('x-powered-by');
  if (trustProxy) app.set('trust proxy', 1); // correct client IPs behind Google's load balancer (rate limits)

  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'same-site' } }));
  if (corsOrigins.length) app.use('/api', cors({ origin: corsOrigins }));
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));

  // Health check works even while the database is still connecting.
  app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

  // Every other API call waits for the database connection.
  app.use('/api', (_req, _res, next) => {
    ensureDb().then(() => next(), next);
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/images', imageRoutes);
  app.use('/api/contact', contactRoutes);

  app.use('/api', notFound);
  app.use(errorHandler);
  return app;
}
