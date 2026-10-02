import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('shell', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('declares es-MX and exposes landmarks', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'es-MX');
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('main#main')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
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

  test('has zero axe violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('has no horizontal overflow', async ({ page }) => {
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('exposes correct contact links', async ({ page }) => {
    await expect(
      page.locator('a[href="https://wa.me/525544792696"]').first(),
    ).toHaveText(/Pide informes por WhatsApp/);
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

  test('focus-visible uses the focus outline token', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement as Element);
      return {
        width: style.outlineWidth,
        style: style.outlineStyle,
        offset: style.outlineOffset,
      };
    });
    expect(outline).toEqual({ width: '3px', style: 'solid', offset: '2px' });
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

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('shows the h1 and the WhatsApp CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText(
      'Su operación logística, resuelta de principio a fin',
    );
    await expect(
      page.locator('a[href="https://wa.me/525544792696"]').first(),
    ).toBeVisible();
  });
});
