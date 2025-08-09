import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './apps/frontend/tests/ui',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
  },
});
