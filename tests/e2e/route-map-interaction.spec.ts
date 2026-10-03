import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * RFC 0001 route-map interaction contract. Motion is reduced so the marker is
 * static: assertions cover semantic state and focus, never animation frames.
 */
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const marker = (page: Page) =>
  page.getByRole('button', { name: /^Ejemplo ilustrativo de ruta de reparto/ });
const popup = (page: Page) => page.locator('#rm-popup');
const closeButton = (page: Page) =>
  page.getByRole('button', { name: 'Cerrar ejemplo' });

async function centre(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}

/** Put keyboard focus on the marker with a real Tab from the previous control. */
async function tabToMarker(page: Page) {
  await page.locator('#familias a').last().focus();
  await page.keyboard.press('Tab');
  await expect(marker(page)).toBeFocused();
}

/** Move past the 150ms close delay and a beat more, deterministically. */
const SETTLE_MS = 400;

test.describe('route map interaction (fine pointer and keyboard)', () => {
  test.use({ reducedMotion: 'reduce' });

  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    await marker(page).scrollIntoViewIfNeeded();
  });

  test('enhances the static marker into a real, labelled button', async ({
    page,
  }) => {
    const button = marker(page);
    await expect(button).toHaveCount(1);
    await expect(button).toHaveJSProperty('tagName', 'BUTTON');
    await expect(button).toHaveAttribute('type', 'button');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toHaveAttribute('aria-controls', 'rm-popup');
    await expect(button).toHaveAttribute('aria-describedby', 'rm-text');
    await expect(page.locator('span.rm-marker')).toHaveCount(0);
    await expect(popup(page)).toBeHidden();
    await expect(popup(page)).toHaveAttribute('role', 'dialog');
    await expect(popup(page)).not.toHaveAttribute('aria-modal', /.*/);
  });

  test('marker and close control meet the tap-target minimum', async ({
    page,
  }) => {
    await marker(page).hover();
    for (const control of [marker(page), closeButton(page)]) {
      const box = await control.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('hover opens the labelled popup', async ({ page }) => {
    await marker(page).hover();
    await expect(popup(page)).toBeVisible();
    await expect(marker(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(
      page.getByRole('dialog', { name: 'Ejemplo ilustrativo' }),
    ).toBeVisible();
    await expect(popup(page)).toContainText('Carlos (nombre ficticio)');
    await expect(popup(page)).toContainText('Caja mediana (ejemplo)');
    await expect(popup(page)).toContainText('Centro de distribución → Destino');
  });

  test('pointer can travel from marker to popup without closing it', async ({
    page,
  }) => {
    await marker(page).hover();
    await expect(popup(page)).toBeVisible();
    const target = await centre(popup(page));
    await page.mouse.move(target.x, target.y, { steps: 12 });
    await expect(popup(page)).toBeVisible();
    await expect(marker(page)).toHaveAttribute('aria-expanded', 'true');
    // leaving both surfaces closes it
    await page.mouse.move(2, 2, { steps: 4 });
    await expect(popup(page)).toBeHidden();
    await expect(marker(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('keyboard focus opens the same popup; Tab reaches the close control and does not trap', async ({
    page,
  }) => {
    await tabToMarker(page);
    await expect(popup(page)).toBeVisible();
    await expect(marker(page)).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Tab');
    await expect(closeButton(page)).toBeFocused();
    await expect(popup(page)).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(closeButton(page)).not.toBeFocused();
    await expect(popup(page)).toBeHidden();
  });

  test('Escape closes, keeps focus on the marker and the latch blocks reopening', async ({
    page,
  }) => {
    await tabToMarker(page);
    await expect(popup(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(popup(page)).toBeHidden();
    await expect(marker(page)).toBeFocused();
    await expect(marker(page)).toHaveAttribute('aria-expanded', 'false');
    // still latched after a beat
    await page.clock.runFor(SETTLE_MS);
    await expect(popup(page)).toBeHidden();
    // blur and a fresh keyboard focus reopens
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(marker(page)).toBeFocused();
    await expect(popup(page)).toBeVisible();
  });

  test('Escape from the close control restores focus to the marker without reopening', async ({
    page,
  }) => {
    await tabToMarker(page);
    await page.keyboard.press('Tab');
    await expect(closeButton(page)).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(popup(page)).toBeHidden();
    await expect(marker(page)).toBeFocused();
    await page.clock.runFor(SETTLE_MS);
    await expect(popup(page)).toBeHidden();
  });

  test('the close button closes, restores focus and does not reopen', async ({
    page,
  }) => {
    await tabToMarker(page);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(popup(page)).toBeHidden();
    await expect(marker(page)).toBeFocused();
    await page.clock.runFor(SETTLE_MS);
    await expect(popup(page)).toBeHidden();
    await expect(marker(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('keyboard activation toggles the popup', async ({ page }) => {
    await tabToMarker(page);
    await expect(popup(page)).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(popup(page)).toBeHidden();
    await page.keyboard.press('Enter');
    await expect(popup(page)).toBeVisible();
  });

  test('after Escape on hover the latch holds until the pointer leaves and re-enters', async ({
    page,
  }) => {
    await marker(page).hover();
    await expect(popup(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(popup(page)).toBeHidden();
    const at = await centre(marker(page));
    await page.mouse.move(at.x + 2, at.y + 2);
    await page.clock.runFor(SETTLE_MS);
    await expect(popup(page)).toBeHidden();
    await page.mouse.move(2, 2, { steps: 4 });
    await marker(page).hover();
    await expect(popup(page)).toBeVisible();
  });

  test('the close button with the mouse closes and the latch clears after leaving', async ({
    page,
  }) => {
    await marker(page).hover();
    const target = await centre(closeButton(page));
    await page.mouse.move(target.x, target.y, { steps: 12 });
    await page.mouse.down();
    await page.mouse.up();
    await expect(popup(page)).toBeHidden();
    await page.mouse.move(2, 2, { steps: 4 });
    await page.clock.runFor(SETTLE_MS);
    await expect(popup(page)).toBeHidden();
    await marker(page).hover();
    await expect(popup(page)).toBeVisible();
  });

  test('stays inside the viewport with no horizontal overflow when open', async ({
    page,
  }) => {
    await marker(page).hover();
    await expect(popup(page)).toBeVisible();
    const { box, viewport, widths } = await page.evaluate(() => {
      const rect = document.querySelector('#rm-popup')!.getBoundingClientRect();
      return {
        box: {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        },
        viewport: { w: window.innerWidth, h: window.innerHeight },
        widths: {
          client: document.documentElement.clientWidth,
          html: document.documentElement.scrollWidth,
        },
      };
    });
    expect(box.left).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(viewport.w);
    expect(box.top).toBeGreaterThanOrEqual(0);
    // a narrow popup sits in flow below the map and may extend past the fold
    if (viewport.w >= 640) expect(box.bottom).toBeLessThanOrEqual(viewport.h);
    expect(widths.html).toBeLessThanOrEqual(widths.client);
    // required content is not clipped by the popup box
    const clipped = await popup(page).evaluate(
      (el) =>
        el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth,
    );
    expect(clipped).toBe(false);
  });

  test('marker, close control and CTA stay reachable and do not overlap when open', async ({
    page,
  }) => {
    await tabToMarker(page);
    await page.keyboard.press('Tab');
    const close = await closeButton(page).boundingBox();
    const pop = await popup(page).boundingBox();
    expect(close!.x).toBeGreaterThanOrEqual(pop!.x);
    expect(close!.x + close!.width).toBeLessThanOrEqual(
      pop!.x + pop!.width + 1,
    );
    await expect(
      page.locator('#ruta').getByRole('link', { name: /WhatsApp/ }),
    ).toBeVisible();
  });

  test('has zero axe violations with the popup open (hover and keyboard)', async ({
    page,
  }) => {
    await marker(page).hover();
    await expect(popup(page)).toBeVisible();
    let results = await new AxeBuilder({ page })
      .include('#ruta')
      .withTags(AXE_TAGS)
      .analyze();
    expect(results.violations).toEqual([]);

    await page.mouse.move(2, 2, { steps: 4 });
    await expect(popup(page)).toBeHidden();
    await tabToMarker(page);
    await expect(popup(page)).toBeVisible();
    results = await new AxeBuilder({ page })
      .include('#ruta')
      .withTags(AXE_TAGS)
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('keyboard focus on the marker shows the focus ring pair', async ({
    page,
  }) => {
    await tabToMarker(page);
    const ring = await marker(page).evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        outline: s.outlineColor,
        width: s.outlineWidth,
        shadow: s.boxShadow,
      };
    });
    expect(ring.width).toBe('2px');
    expect(ring.outline).toBe('rgb(20, 84, 40)');
    expect(ring.shadow).toContain('rgb(252, 212, 12) 0px 0px 0px 5px');
  });
});

test.describe('route map interaction (touch / coarse pointer)', () => {
  test.use({ reducedMotion: 'reduce', hasTouch: true });

  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    await marker(page).scrollIntoViewIfNeeded();
  });

  test('tap toggles the popup', async ({ page }) => {
    await marker(page).tap();
    await expect(popup(page)).toBeVisible();
    await expect(marker(page)).toHaveAttribute('aria-expanded', 'true');
    await marker(page).tap();
    await expect(popup(page)).toBeHidden();
    await page.clock.runFor(SETTLE_MS);
    await expect(popup(page)).toBeHidden();
    await marker(page).tap();
    await expect(popup(page)).toBeVisible();
  });

  test('tapping outside closes it and it stays closed', async ({ page }) => {
    await marker(page).tap();
    await expect(popup(page)).toBeVisible();
    // the popup may cover the heading, so tap a blank corner of the viewport
    await page.touchscreen.tap(page.viewportSize()!.width - 3, 3);
    await expect(popup(page)).toBeHidden();
    await page.clock.runFor(SETTLE_MS);
    await expect(popup(page)).toBeHidden();
  });

  test('the close control closes, restores focus to the marker and does not reopen', async ({
    page,
  }) => {
    await marker(page).tap();
    await expect(popup(page)).toBeVisible();
    await closeButton(page).tap();
    await expect(popup(page)).toBeHidden();
    await expect(marker(page)).toBeFocused();
    await page.clock.runFor(SETTLE_MS);
    await expect(popup(page)).toBeHidden();
    await expect(marker(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('an open popup stays open without hover and fits the viewport', async ({
    page,
  }) => {
    await marker(page).tap();
    await page.clock.runFor(SETTLE_MS);
    await expect(popup(page)).toBeVisible();
    const box = await popup(page).boundingBox();
    const viewport = page.viewportSize()!;
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
  });

  test('has zero axe violations with the popup open', async ({ page }) => {
    await marker(page).tap();
    await expect(popup(page)).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include('#ruta')
      .withTags(AXE_TAGS)
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('route map popup never covers required content at 320px', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 320, height: 640 } });

  async function expectClear(page: Page) {
    const pop = (await popup(page).boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(pop.x).toBeGreaterThanOrEqual(0);
    expect(pop.x + pop.width).toBeLessThanOrEqual(viewport.width);
    const intersects = (
      a: { x: number; y: number; width: number; height: number },
      b: { x: number; y: number; width: number; height: number },
    ) =>
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y;
    await expect(marker(page)).toBeVisible();
    const targets = {
      '.rm__stage': page.locator('.rm__stage'),
      marker: marker(page),
      '#rm-text': page.locator('#rm-text'),
      '#rm-sample-title': page.locator('#rm-sample-title'),
    };
    for (const [name, locator] of Object.entries(targets)) {
      const other = (await locator.boundingBox())!;
      expect(intersects(pop, other), `${name} is covered by the popup`).toBe(
        false,
      );
    }
    // the map itself stays whole: the marker lies inside the stage
    const stage = (await page.locator('.rm__stage').boundingBox())!;
    const dot = (await marker(page).boundingBox())!;
    expect(dot.y).toBeGreaterThanOrEqual(stage.y);
    expect(dot.y + dot.height).toBeLessThanOrEqual(stage.y + stage.height);
  }

  test('hover and focus', async ({ page }) => {
    await page.goto('/');
    await page.locator('.rm__stage').scrollIntoViewIfNeeded();
    await marker(page).hover();
    await expect(popup(page)).toBeVisible();
    await expectClear(page);
    await page.mouse.move(2, 2, { steps: 4 });
    await expect(popup(page)).toBeHidden();
    await tabToMarker(page);
    await expect(popup(page)).toBeVisible();
    await expectClear(page);
  });

  test('touch', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      reducedMotion: 'reduce',
      viewport: { width: 320, height: 640 },
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.locator('.rm__stage').scrollIntoViewIfNeeded();
    await marker(page).tap();
    await expect(popup(page)).toBeVisible();
    await expectClear(page);
    await context.close();
  });
});
