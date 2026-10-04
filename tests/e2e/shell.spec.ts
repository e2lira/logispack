import { expect, test } from '@playwright/test';

test.describe('shell', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('declares es-MX and a focusable main target', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'es-MX');
    await expect(page.locator('main#main')).toHaveCount(1);
  });

  test('skip link is first focusable, visible on focus and moves focus to main', async ({
    page,
  }) => {
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Saltar al contenido' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await expect(skip).toHaveAttribute('href', '#main');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
    await expect(page.locator('main#main')).toBeFocused();
  });

  test('exposes correct contact links', async ({ page }) => {
    await expect(
      page.locator('a[href="https://wa.me/525544792696"]').first(),
    ).toHaveText(/Pida informes por WhatsApp/);
    await expect(page.locator('footer a[href="tel:+525544792696"]')).toHaveText(
      '55 44 79 26 96',
    );
    await expect(page.locator('footer a[href="tel:+525444575887"]')).toHaveText(
      '54 44 57 58 87',
    );
    await expect(page.locator('footer a[href="tel:+525535689549"]')).toHaveText(
      '55 35 68 95 49',
    );
    await expect(
      page.locator('footer a[href="mailto:alfredocervantess@live.com.mx"]'),
    ).toBeVisible();
    const footer = page.locator('footer');
    await expect(footer).toContainText('Mar del Frío #60, Col. Ciudad Brisa');
    await expect(footer).toContainText('Naucalpan de Juárez, Estado de México');
    await expect(footer).toContainText('Lunes a sábado, 08:00 a 18:00 h');
  });

  test('footer is an inverse surface with the white logo', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toHaveAttribute('data-surface', 'inverse');
    await expect(footer.locator('img')).toHaveAttribute(
      'alt',
      'Logispack Capital Humano',
    );
    const img = footer.locator('img');
    await expect(img).toHaveAttribute('width', /\d+/);
    await expect(img).toHaveAttribute('height', /\d+/);
  });

  test('focus-visible draws a 2px forest inner outline plus a 3px yellow outer ring', async ({
    page,
  }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const ring = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement as Element);
      return {
        width: style.outlineWidth,
        style: style.outlineStyle,
        color: style.outlineColor,
        offset: style.outlineOffset,
        shadow: style.boxShadow,
      };
    });
    expect(ring.width).toBe('2px');
    expect(ring.style).toBe('solid');
    expect(ring.color).toBe('rgb(20, 84, 40)');
    expect(ring.offset).toBe('0px');
    expect(ring.shadow).toContain('rgb(252, 212, 12) 0px 0px 0px 5px');
  });

  test('focus ring is white on the inverse footer', async ({ page }) => {
    await page.locator('footer a[href^="mailto:"]').focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const color = await page.evaluate(
      () => getComputedStyle(document.activeElement as Element).outlineColor,
    );
    expect(color).toBe('rgb(255, 255, 255)');
  });
});

test('header logo link has a single accessible name', async ({ page }) => {
  await page.goto('/');
  const logoLink = page.locator('header a:has(img)');
  await expect(logoLink).not.toHaveAttribute('aria-label', /.+/);
  await expect(logoLink.locator('img')).toHaveAttribute(
    'alt',
    'Logispack Capital Humano, inicio',
  );
});

test('main shows a visible focus indicator after the skip link', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('main#main')).toBeFocused();
  const outlineStyle = await page.evaluate(
    () =>
      getComputedStyle(document.querySelector('main') as Element).outlineStyle,
  );
  expect(outlineStyle).not.toBe('none');
});

test.describe('brand', () => {
  test('header shows the vector lockup at 72px on desktop and 60px on mobile', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    const img = page.locator('header a.brand img');
    await expect(img).toHaveAttribute('src', /\.svg$/);
    const box = await img.boundingBox();
    expect(box).not.toBeNull();
    const expected = testInfo.project.name === 'mobile-320' ? 60 : 72;
    expect(Math.round(box!.height)).toBe(expected);
    expect(box!.width).toBeGreaterThanOrEqual(120);
  });

  test('footer shows the white vector lockup at 64px', async ({ page }) => {
    await page.goto('/');
    const img = page.locator('footer img');
    await expect(img).toHaveAttribute('src', /\.svg$/);
    const box = await img.boundingBox();
    expect(Math.round(box!.height)).toBe(64);
    expect(box!.width).toBeGreaterThanOrEqual(120);
  });

  test('footer sits on the olive-900 band', async ({ page }) => {
    await page.goto('/');
    const bg = await page
      .locator('footer')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(72, 80, 40)');
  });

  test('declares an SVG favicon with a PNG fallback that is served', async ({
    page,
    request,
  }) => {
    await page.goto('/');
    await expect(
      page.locator('link[rel="icon"][type="image/svg+xml"]'),
    ).toHaveCount(1);
    const png = page.locator('link[rel="icon"][type="image/png"]');
    await expect(png).toHaveCount(1);
    const href = (await png.getAttribute('href')) as string;
    const response = await request.get(href);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
  });

  test('uses the single theme: no data-theme anywhere', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-theme]')).toHaveCount(0);
  });
  test('header DOM order is brand, nav, CTA and matches visual order at desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const items = [
      page.locator('.site-header .brand'),
      page.locator('.site-header .site-nav'),
      page.locator('.site-header .container > .button'),
    ];
    const boxes = [];
    for (const item of items) {
      await expect(item).toBeVisible();
      const box = await item.boundingBox();
      expect(box).not.toBeNull();
      boxes.push(box as { x: number; y: number });
    }
    // DOM order (brand, nav, CTA) must be left-to-right on the same row
    expect(boxes[0]!.x).toBeLessThan(boxes[1]!.x);
    expect(boxes[1]!.x).toBeLessThan(boxes[2]!.x);
    const order = await page
      .locator('.site-header .container')
      .evaluate((el) =>
        Array.from(el.children).map((c) =>
          c.classList.contains('brand')
            ? 'brand'
            : c.classList.contains('site-nav')
              ? 'nav'
              : 'cta',
        ),
      );
    expect(order).toEqual(['brand', 'nav', 'cta']);
  });

  test('Tab goes through the nav links before the header CTA at desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.keyboard.press('Tab'); // skip link
    await page.keyboard.press('Tab'); // logo
    await expect(page.locator('.site-header .brand')).toBeFocused();
    const navCount = await page.locator('.site-nav a').count();
    expect(navCount).toBeGreaterThan(0);
    for (let i = 0; i < navCount; i++) {
      await page.keyboard.press('Tab');
      await expect(page.locator('.site-nav a').nth(i)).toBeFocused();
    }
    await page.keyboard.press('Tab');
    await expect(
      page.locator('.site-header .container > .button'),
    ).toBeFocused();
  });

  test('header WhatsApp CTA is visible at desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(
      page.locator('.site-header .container > .button'),
    ).toBeVisible();
  });

  test('at 320px the header CTA is hidden and the hero CTA is above the fold', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    await expect(
      page.locator('.site-header .container > .button'),
    ).toBeHidden();
    const hero = page.locator('.hero a[href^="https://wa.me/"]').first();
    await expect(hero).toBeInViewport({ ratio: 1 });
  });
});
