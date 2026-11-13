import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the browser talks to Vite (localhost:5173); Vite forwards /api to the Express server.
// This matches Firebase Hosting, which forwards /api to the Cloud Function, so the code is identical in both.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
