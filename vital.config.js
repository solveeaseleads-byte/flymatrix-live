import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      // Exclude Node-specific modules that crash browser bundlers
      external: ['fsevents', 'express', 'cors', 'dotenv', 'helmet'],
    },
  },
});
