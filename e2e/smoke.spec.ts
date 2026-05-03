import { expect, test } from '@playwright/test';

test('design showcase loads', async ({ page }) => {
  await page.goto('/design');
  await expect(page.getByRole('heading', { name: /Design system showcase/i })).toBeVisible();
});
