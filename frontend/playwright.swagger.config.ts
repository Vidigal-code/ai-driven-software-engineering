import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/swagger.spec.ts',
  outputDir: 'artifacts/playwright-swagger-results',
  preserveOutput: 'never',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: [
    ['list'],
    ['json', { outputFile: 'artifacts/playwright-swagger.json' }],
  ],
  use: { ...devices['Desktop Chrome'], actionTimeout: 10_000, navigationTimeout: 15_000, trace: 'off', screenshot: 'off', video: 'off' },
  projects: [
    {
      name: 'swagger-proxy',
      use: { baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000' },
    },
    {
      name: 'swagger-direct',
      use: { baseURL: process.env.E2E_API_URL ?? 'http://localhost:8080' },
    },
  ],
});
