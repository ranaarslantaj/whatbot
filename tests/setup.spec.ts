import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/WhatBot/);
});

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('h1')).toContainText(/Welcome back/i);
});
