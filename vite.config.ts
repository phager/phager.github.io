import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'esnext',
    modulePreload: {
      polyfill: true
    }
  },
  define: {
    'process.env': process.env
  }
}) 