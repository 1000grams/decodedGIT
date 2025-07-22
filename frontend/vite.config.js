import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@fix-artistid': path.resolve(__dirname, 'src/fix-artistid'),
    },
  },
});