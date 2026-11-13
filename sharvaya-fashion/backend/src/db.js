import mongoose from 'mongoose';
import { getConfig } from './config/env.js';

// One shared connection per server / function instance. Concurrent callers wait for the same promise.
let connecting = null;

export function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
  if (!connecting) {
    const { mongoUri, dbName } = getConfig();
    if (!mongoUri) throw new Error('MONGODB_URI is not set');
    connecting = mongoose
      .connect(mongoUri, {
        dbName,
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 8000,
      })
      .then(() => mongoose.connection)
      .catch((err) => {
        connecting = null; // allow a retry on the next request
        throw err;
      });
  }
  return connecting;
}

export async function disconnectDB() {
  connecting = null;
  await mongoose.disconnect();
}
