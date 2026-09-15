import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  server: {
    proxy: {
      '/posts': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
      '/usuarios': 'http://localhost:3000',
    },
  },
});
