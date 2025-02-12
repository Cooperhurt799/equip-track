
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      clientPort: 443,
      host: '0.0.0.0'
    },
    allowedHosts: [
      '897f9e8d-e0c3-4366-b61f-c484ccd16da7-00-2tzovs6hgpmjs.kirk.replit.dev'
    ]
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: [
      '897f9e8d-e0c3-4366-b61f-c484ccd16da7-00-2tzovs6hgpmjs.kirk.replit.dev'
    ]
  }
});
