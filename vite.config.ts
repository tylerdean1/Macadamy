import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import commonjs from 'vite-plugin-commonjs'; // ✅ import the plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    commonjs() // ✅ include the plugin here
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
});
