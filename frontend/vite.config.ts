import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': process.env.API_PROXY_TARGET ?? 'http://localhost:8080',
      '/actuator': process.env.API_PROXY_TARGET ?? 'http://localhost:8080',
      '/swagger-ui': process.env.API_PROXY_TARGET ?? 'http://localhost:8080',
      '/v3': process.env.API_PROXY_TARGET ?? 'http://localhost:8080',
    },
  },
  test: {
    maxWorkers: 2,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov', 'html'],
      include: [
        'src/entities/**/model/*.ts',
        'src/shared/api/*.ts',
        'src/features/**/model/*.{ts,tsx}',
      ],
      exclude: ['**/*.test.*', '**/types.ts', '**/catalog.ts'],
      thresholds: { lines: 80, branches: 75, functions: 80, statements: 80 },
    },
  },
});
