// client/vite.config.js
// FIX: proxy corregido de localhost:4000 (node/ muerto) a localhost:3000 (server/index.js real)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});