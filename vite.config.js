
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    hmr: {
      clientPort: 443,
      host: '897f9e8d-e0c3-4366-b61f-c484ccd16da7-00-2tzovs6hgpmjs.kirk.replit.dev',
      protocol: 'wss',
      timeout: 120000,
      overlay: false
    },
    watch: {
      usePolling: true,
      interval: 1000
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  }
});
