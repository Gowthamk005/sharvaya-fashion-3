// Firebase Cloud Functions entry point (deployed by `firebase deploy`).
// Firebase Hosting sends every /api/** request to the function named "api" (see firebase.json).
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import { createApp } from './src/app.js';

// Secrets are stored in Google Secret Manager: `firebase functions:secrets:set MONGODB_URI` (and JWT_SECRET).
const MONGODB_URI = defineSecret('MONGODB_URI');
const JWT_SECRET = defineSecret('JWT_SECRET');

let app;

export const api = onRequest(
  {
    region: 'asia-south1', // Mumbai
    secrets: [MONGODB_URI, JWT_SECRET],
    memory: '256MiB',
    timeoutSeconds: 60,
    maxInstances: 10,
    concurrency: 40,
    invoker: 'public', // the browser calls it, so it must be reachable without a Google login
  },
  (req, res) => {
    app ??= createApp(); // built on the first request, after the secrets are present
    return app(req, res);
  }
);
