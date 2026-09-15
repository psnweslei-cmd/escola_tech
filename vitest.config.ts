import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    include: ['web/**/*.test.{ts,tsx}'],
    setupFiles: ['./web/test/setup.ts'],
    clearMocks: true,
  },
});
