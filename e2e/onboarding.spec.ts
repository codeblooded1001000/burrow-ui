import { expect, test } from '@playwright/test';

test('login page loads with sign-in disabled', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeDisabled();
});

test('signup page loads with send code disabled', async ({ page }) => {
  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: /Find your flatmate/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send verification code' })).toBeDisabled();
});

test('forgot PIN step one loads', async ({ page }) => {
  await page.goto('/login/forgot-pin');
  await expect(page.getByRole('heading', { name: /Reset your PIN/i })).toBeVisible();
});
