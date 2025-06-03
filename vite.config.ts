import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'carry-trade.html',
      },
    },
  },
  server: {
    port: 3000,
    open: '/carry-trade.html',
  },
}); 