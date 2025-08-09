import { test, expect } from '@playwright/test';

test('homepage loads and displays expected content', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/HelprLocal/i);
  await expect(page.locator('body')).toContainText(['login', 'register', 'events']);
});
