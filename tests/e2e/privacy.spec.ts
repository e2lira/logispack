import { expect, test } from '@playwright/test';
import services from '../../src/content/services.json' with { type: 'json' };

const routes = [
  '/',
  '/servicios/',
  `/servicios/${services[0]!.id}/`,
  '/nosotros/',
  '/contacto/',
  '/preguntas-frecuentes/',
];

for (const route of routes) {
  test(`${route} makes only same-origin requests`, async ({
    page,
    baseURL,
  }) => {
    const localOrigin = new URL(baseURL as string).origin;
    const requested: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.startsWith('data:') || url.startsWith('blob:')) return;
      requested.push(url);
    });
    await page.goto(route, { waitUntil: 'networkidle' });
    expect(requested.length).toBeGreaterThan(0);
    const external = requested.filter(
      (url) => new URL(url).origin !== localOrigin,
    );
    expect(external).toEqual([]);
    expect(requested.some((url) => url.includes('wa.me'))).toBe(false);
  });
}

test('serves fonts from the local origin', async ({ page }) => {
  const fonts: string[] = [];
  page.on('response', (response) => {
    if (/\.woff2?$/.test(new URL(response.url()).pathname))
      fonts.push(response.url());
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(fonts.length).toBeGreaterThan(0);
});
