import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import services from '../../src/content/services.json' with { type: 'json' };

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const delivery = services.find((s) => s.name === 'Servicio de reparto')!;

const DISCLAIMER =
  'Datos ficticios con fines demostrativos. No corresponde a un envío real ni muestra ubicación o estado en vivo.';
const TEXT_EQUIVALENT =
  'Ilustración de una ruta de reparto de ejemplo. Un paquete sale del centro de distribución, avanza por una ruta programada y llega a su destino. Es una representación ilustrativa: no muestra envíos reales ni seguimiento en vivo.';

/** Content that must never appear in the map section (the denial sentences are exempt). */
const PROHIBITED =
  /tiempo real|rastre|\bETA\b|\bLP-?\d+|#LP|\b\d{1,2}:\d{2}\b|\b\d{4}-\d{2}-\d{2}\b|en vivo/i;

async function expectNoProhibitedContent(text: string) {
  const cleaned = text
    .replaceAll(DISCLAIMER, '')
    .replaceAll(TEXT_EQUIVALENT, '');
  expect(cleaned).not.toMatch(PROHIBITED);
}

test.describe('route map section (static, no JavaScript)', () => {
  test.use({ javaScriptEnabled: false });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('is labelled "Ruta ilustrativa" and sits after the services section', async ({
    page,
  }) => {
    const section = page.locator('#ruta');
    await expect(
      section.getByRole('heading', { level: 2, name: 'Ruta ilustrativa' }),
    ).toBeVisible();
    await expect(section).toHaveAttribute('aria-labelledby', 'ruta-title');
    const order = await page.evaluate(() => {
      const familias = document.querySelector('#familias')!;
      const ruta = document.querySelector('#ruta')!;
      return familias.compareDocumentPosition(ruta);
    });
    expect(order & 4).toBeTruthy();
  });

  test('draws a decorative inline SVG map with route and both pins', async ({
    page,
  }) => {
    const svg = page.locator('#ruta svg.rm__art');
    await expect(svg).toBeVisible();
    await expect(svg).toHaveAttribute('aria-hidden', 'true');
    await expect(svg.locator('.m-route')).toHaveCount(1);
    await expect(svg.locator('.m-origin')).toHaveCount(1);
    await expect(svg.locator('.m-dest')).toHaveCount(1);
    await expect(svg.locator('.m-park').first()).toBeAttached();
    await expect(svg.locator('.m-water').first()).toBeAttached();
    await expect(svg.locator('.m-street').first()).toBeAttached();
    await expect(page.locator('#ruta img')).toHaveCount(0);
  });

  test('shows the visible text equivalent and a static marker', async ({
    page,
  }) => {
    const section = page.locator('#ruta');
    await expect(section.locator('#rm-text')).toHaveText(TEXT_EQUIVALENT);
    await expect(section.locator('#rm-text')).toBeVisible();
    await expect(section.locator('.rm-marker')).toBeVisible();
    await expect(section.locator('.rm__stage button:visible')).toHaveCount(0);
  });

  test('shows the fictional sample data as a static readable card', async ({
    page,
  }) => {
    const card = page.locator('#ruta .rm-sample');
    await expect(card).toBeVisible();
    await expect(
      card.getByRole('heading', { name: 'Ejemplo ilustrativo' }),
    ).toBeVisible();
    await expect(card).toContainText(DISCLAIMER);
    const rows = card.locator('dl > div');
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toContainText('Repartidor');
    await expect(rows.nth(0)).toContainText('Carlos (nombre ficticio)');
    await expect(rows.nth(1)).toContainText('Paquete');
    await expect(rows.nth(1)).toContainText('Caja mediana (ejemplo)');
    await expect(rows.nth(2)).toContainText('Ruta');
    await expect(rows.nth(2)).toContainText('Centro de distribución → Destino');
  });

  test('the popup stays hidden without JavaScript', async ({ page }) => {
    await expect(page.locator('#rm-popup')).toBeHidden();
  });

  test('offers the WhatsApp CTA and a link to the delivery service', async ({
    page,
  }) => {
    const section = page.locator('#ruta');
    await expect(
      section.getByRole('link', { name: 'Pida informes por WhatsApp' }),
    ).toHaveAttribute('href', 'https://wa.me/525544792696');
    await expect(
      section.getByRole('link', { name: /Servicio de reparto/i }),
    ).toHaveAttribute('href', `/servicios/${delivery.id}/`);
  });

  test('contains no live-tracking, ETA, timestamp, ID or personal data', async ({
    page,
  }) => {
    await expectNoProhibitedContent(await page.locator('#ruta').innerText());
  });
});

test.describe('route map section (with JavaScript)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('contains no live-tracking, ETA, timestamp, ID or personal data', async ({
    page,
  }) => {
    await expectNoProhibitedContent(await page.locator('#ruta').innerText());
    const html = await page.locator('#ruta').innerHTML();
    await expectNoProhibitedContent(
      html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '),
    );
  });

  test('has zero axe violations in the neutral state', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('#ruta')
      .withTags(AXE_TAGS)
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('the delivery service link resolves', async ({ page }) => {
    await page
      .locator('#ruta')
      .getByRole('link', { name: /Servicio de reparto/i })
      .click();
    await expect(page).toHaveURL(new RegExp(`/servicios/${delivery.id}/$`));
    await expect(page.locator('h1')).toHaveText('Servicio de reparto');
  });
});
