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
  preserveOutput: 'never',
  reporter: [
    ['list'],
    ['json', { outputFile: 'artifacts/playwright-integration.json' }],
  ],
  use: {
    ...base.use,
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  webServer: undefined,
});
