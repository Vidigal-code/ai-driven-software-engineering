import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testMatch: '**/integration.spec.ts',
  testIgnore: [],
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  retries: 0,
  reporter: [
    ['list'],
    ['json', { outputFile: 'artifacts/playwright-integration.json' }],
  ],
  use: {
    ...base.use,
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: undefined,
});
