import { expect, test } from '@playwright/test';

test('loads with zero requests to external hosts', async ({
  page,
  baseURL,
}) => {
  const localOrigin = new URL(baseURL as string).origin;
  const external: string[] = [];
  page.on('request', (request) => {
    const url = request.url();
    if (url.startsWith('data:') || url.startsWith('blob:')) return;
    if (new URL(url).origin !== localOrigin) external.push(url);
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(external).toEqual([]);
});

test('serves fonts from the local origin', async ({ page }) => {
  const fonts: string[] = [];
  page.on('response', (response) => {
    if (/\.woff2?$/.test(new URL(response.url()).pathname))
      fonts.push(response.url());
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(fonts.length).toBeGreaterThan(0);
});
