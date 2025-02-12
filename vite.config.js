
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Daugherty Ranches Equipment Tracker",
        short_name: "EquipTracker",
        description: "Equipment Tracker App for Daugherty Ranches",
        theme_color: "#7a5d33",
        background_color: "#f2efe4",
        display: "standalone",
        start_url: ".",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'equipment-tracker-daughertyranches.replit.app',
      '897f9e8d-e0c3-4366-b61f-c484ccd16da7-00-2tzovs6hgpmjs.kirk.replit.dev'
    ]
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'equipment-tracker-daughertyranches.replit.app',
      '897f9e8d-e0c3-4366-b61f-c484ccd16da7-00-2tzovs6hgpmjs.kirk.replit.dev'
    ]
  }
});
