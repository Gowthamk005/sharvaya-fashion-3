// Local development server: `npm run dev` (http://localhost:5001). Production runs through index.js (Firebase).
import { createApp } from './app.js';
import { getConfig } from './config/env.js';
import { connectDB, disconnectDB } from './db.js';

const { port } = getConfig();
const server = createApp().listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

connectDB()
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection failed:', err.message));

const shutdown = async () => {
  server.close();
  await disconnectDB();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
