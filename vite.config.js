
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses (0.0.0.0) to allow LAN access
    port: 3000, // Port for the Web App
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000', // Explicitly use IPv4 to ensure connectivity
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
