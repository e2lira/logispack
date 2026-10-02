import { expect, test } from '@playwright/test';

test('home has one h1 and a WhatsApp link', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(
    page.locator('a[href="https://wa.me/525544792696"]').first(),
  ).toBeVisible();
});
