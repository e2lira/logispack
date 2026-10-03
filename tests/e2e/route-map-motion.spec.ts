import { gzipSync } from 'node:zlib';
import { expect, test, type Page } from '@playwright/test';

/**
 * Motion contract (RFC 0001 items 1 and 7): the marker travels only when the
 * user has no reduced-motion preference, and a static marker keeps everything
 * operable. Assertions are on computed state, never on animation frames.
 */
const marker = (page: Page) =>
  page.getByRole('button', { name: /^Ejemplo ilustrativo de ruta de reparto/ });
const popup = (page: Page) => page.locator('#rm-popup');
const rider = (page: Page) => page.locator('.rm__rider');

const animation = (page: Page) =>
  rider(page).evaluate((el) => {
    const s = getComputedStyle(el);
    return { name: s.animationName, state: s.animationPlayState };
  });

async function tabToMarker(page: Page) {
  await page.locator('#familias a').last().focus();
  await page.keyboard.press('Tab');
  await expect(marker(page)).toBeFocused();
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the marker is static: no animation is scheduled and it does not move', async ({
    page,
  }) => {
    await page.goto('/');
    await marker(page).scrollIntoViewIfNeeded();
    expect((await animation(page)).name).toBe('none');
    const first = await marker(page).boundingBox();
    await page.waitForTimeout(400);
    expect(await marker(page).boundingBox()).toEqual(first);
    expect(
      await page.evaluate(
        () =>
          document.getAnimations().filter((a) => a.playState === 'running')
            .length,
      ),
    ).toBe(0);
  });

  test('the route, its text equivalent and the popup stay available', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('#rm-text')).toBeVisible();
    await expect(page.locator('.rm-sample')).toBeVisible();
    await expect(page.locator('.m-route')).toBeVisible();
    await tabToMarker(page);
    await expect(popup(page)).toBeVisible();
    await expect(popup(page)).toContainText('Ejemplo ilustrativo');
  });

  test('the static marker sits inside the map box', async ({ page }) => {
    await page.goto('/');
    const stage = await page.locator('.rm__stage').boundingBox();
    const dot = await marker(page).boundingBox();
    expect(dot!.x).toBeGreaterThanOrEqual(stage!.x);
    expect(dot!.y).toBeGreaterThanOrEqual(stage!.y);
    expect(dot!.x + dot!.width).toBeLessThanOrEqual(stage!.x + stage!.width);
    expect(dot!.y + dot!.height).toBeLessThanOrEqual(stage!.y + stage!.height);
  });
});

test.describe('motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('the marker travels the route with a CSS animation', async ({
    page,
  }) => {
    await page.goto('/');
    const { name, state } = await animation(page);
    expect(name).toBe('rm-travel');
    expect(state).toBe('running');
  });

  test('the traversal pauses while the popup is open and the marker stays anchored', async ({
    page,
  }) => {
    await page.goto('/');
    await marker(page).scrollIntoViewIfNeeded();
    await tabToMarker(page);
    await expect(popup(page)).toBeVisible();
    expect((await animation(page)).state).toBe('paused');
    const first = await marker(page).boundingBox();
    const popupFirst = await popup(page).boundingBox();
    await page.waitForTimeout(400);
    expect(await marker(page).boundingBox()).toEqual(first);
    expect(await popup(page).boundingBox()).toEqual(popupFirst);
  });

  test('the traversal resumes after the popup is dismissed and focus leaves', async ({
    page,
  }) => {
    await page.goto('/');
    await marker(page).scrollIntoViewIfNeeded();
    await tabToMarker(page);
    await page.keyboard.press('Escape');
    await expect(popup(page)).toBeHidden();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(marker(page)).not.toBeFocused();
    await expect
      .poll(async () => (await animation(page)).state)
      .toBe('running');
  });

  test('a touch tap opens the popup on a moving marker and pauses it', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      hasTouch: true,
      reducedMotion: 'no-preference',
      viewport: { width: 320, height: 640 },
    });
    const page = await context.newPage();
    await page.goto('/');
    await marker(page).scrollIntoViewIfNeeded();
    // dispatch the tap at the marker's live position
    const box = await marker(page).boundingBox();
    await page.touchscreen.tap(
      box!.x + box!.width / 2,
      box!.y + box!.height / 2,
    );
    await expect(popup(page)).toBeVisible();
    expect((await animation(page)).state).toBe('paused');
    await context.close();
  });
});

test.describe('cost', () => {
  test('causes no meaningful layout shift while the popup opens and closes', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as {
          value: number;
          hadRecentInput: boolean;
        }[]) {
          if (!entry.hadRecentInput)
            (window as unknown as { __cls: number }).__cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    await marker(page).scrollIntoViewIfNeeded();
    await tabToMarker(page);
    await expect(popup(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(popup(page)).toBeHidden();
    const cls = await page.evaluate(
      () => (window as unknown as { __cls: number }).__cls,
    );
    expect(cls).toBeLessThanOrEqual(0.1);
  });

  test('Home ships at most 8 KB gzip for the island and 30 KB gzip of JavaScript overall', async ({
    page,
  }) => {
    const external: number[] = [];
    page.on('response', async (response) => {
      if (/\.m?js$/.test(new URL(response.url()).pathname)) {
        external.push(gzipSync(await response.body(), { level: 9 }).length);
      }
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    const inline = await page
      .locator('script')
      .evaluateAll((scripts) =>
        scripts
          .filter((s) => !s.getAttribute('src'))
          .map((s) => s.textContent ?? ''),
      );
    const inlineSizes = inline.map(
      (code) => gzipSync(code, { level: 9 }).length,
    );
    const total = [...external, ...inlineSizes].reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThanOrEqual(8 * 1024);
    expect(total).toBeLessThanOrEqual(30 * 1024);
  });
});
