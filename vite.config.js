// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // relative path rakhta hai taaki build bina server issue ke chale
  server: {
    port: 5173,
    open: true // 'npm run dev' chalate hi browser automatically open ho jayega
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});