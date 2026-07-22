import { defineConfig } from 'vite';
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending request to the target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received response from the target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));