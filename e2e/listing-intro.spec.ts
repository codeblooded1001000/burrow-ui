import { expect, test } from '@playwright/test';

test('listing intro or auth gate', async ({ page }) => {
  await page.goto('/listing/new/intro');
  const listing = page.getByRole('heading', { name: /Tell us about your flat/i });
  const login = page.getByRole('heading', { name: /Welcome back/i });
  await expect(listing.or(login)).toBeVisible({ timeout: 20_000 });
});
