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
