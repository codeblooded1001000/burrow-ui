import { expect, test } from '@playwright/test';

test('browse page loads shell', async ({ page }) => {
  await page.goto('/browse');
  await expect(page.getByRole('button', { name: 'Flats' })).toBeVisible({ timeout: 25_000 });
});

test('browse shows map or list toggle', async ({ page }) => {
  await page.goto('/browse');
  await expect(page.getByLabel(/Map view|List view/i)).toBeVisible({ timeout: 25_000 });
});
