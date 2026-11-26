import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:4173';
export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: '**/integration.spec.ts',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'artifacts/playwright.json' }],
  ],
  use: { baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: 'npm run preview -- --strictPort',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
});
