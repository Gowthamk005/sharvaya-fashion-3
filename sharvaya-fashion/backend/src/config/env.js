// Reads configuration at call time (not import time), so Firebase secrets are available when it runs.
export function getConfig() {
  return {
    mongoUri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB || 'sharvaya',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
    // Only needed if the frontend is hosted on a different origin than the API (not the case on Firebase Hosting).
    corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
    port: Number(process.env.PORT || 5001),
    trustProxy: process.env.TRUST_PROXY !== 'false',
  };
}
