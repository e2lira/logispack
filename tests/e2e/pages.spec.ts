import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import families from '../../src/content/families.json' with { type: 'json' };
import services from '../../src/content/services.json' with { type: 'json' };

const SITE = 'https://logispack.capitalhumano.com.mx';
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const routes = [
  '/',
  '/servicios/',
  ...services.map((s) => `/servicios/${s.id}/`),
  '/nosotros/',
  '/contacto/',
  '/preguntas-frecuentes/',
];

test.describe('every page', () => {
  for (const route of routes) {
    test.describe(route, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(route);
      });

      test('has one h1, landmarks, title, description and canonical', async ({
        page,
      }) => {
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('header')).toHaveCount(1);
        await expect(page.locator('main')).toHaveCount(1);
        await expect(page.locator('footer')).toHaveCount(1);
        await expect(page.locator('nav[aria-label="Principal"]')).toHaveCount(
          1,
        );
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
        expect(title.length).toBeLessThanOrEqual(60);
        const description = await page
          .locator('meta[name="description"]')
          .getAttribute('content');
        expect(description?.length ?? 0).toBeGreaterThan(0);
        expect(description?.length ?? 0).toBeLessThanOrEqual(155);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          'href',
          `${SITE}${route}`,
        );
      });

      test('has zero axe violations in the olive theme', async ({ page }) => {
        const results = await new AxeBuilder({ page })
          .withTags(AXE_TAGS)
          .analyze();
        expect(results.violations).toEqual([]);
      });

      test('has zero axe violations in the logo theme', async ({ page }) => {
        await page.evaluate(() => {
          document.documentElement.dataset['theme'] = 'logo';
        });
        const results = await new AxeBuilder({ page })
          .withTags(AXE_TAGS)
          .analyze();
        expect(results.violations).toEqual([]);
      });

      test('has no horizontal overflow', async ({ page }) => {
        const widths = await page.evaluate(() => ({
          client: document.documentElement.clientWidth,
          html: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
        }));
        expect(widths.html).toBeLessThanOrEqual(widths.client);
        expect(widths.body).toBeLessThanOrEqual(widths.client);
      });

      test('ships no scripts and no pending placeholders', async ({ page }) => {
        await expect(page.locator('script')).toHaveCount(0);
        const text = await page.locator('body').innerText();
        expect(text).not.toMatch(/pendiente|\[PENDING|\[VERIFY/i);
        expect(text).not.toMatch(/tiempo real|rastrea/i);
      });
    });
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const route of ['/', '/servicios/', '/preguntas-frecuentes/']) {
    test(`${route} renders its h1 and navigation`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      await expect(
        page.getByRole('navigation', { name: 'Principal' }).getByRole('link'),
      ).toHaveCount(5);
    });
  }

  test('FAQ disclosure opens natively', async ({ page }) => {
    await page.goto('/preguntas-frecuentes/');
    const first = page.locator('details').first();
    await expect(first).not.toHaveAttribute('open', '');
    await first.locator('summary').click();
    await expect(first).toHaveAttribute('open', '');
  });
});

test.describe('header navigation', () => {
  const items = [
    ['Inicio', '/'],
    ['Servicios', '/servicios/'],
    ['Nosotros', '/nosotros/'],
    ['Preguntas frecuentes', '/preguntas-frecuentes/'],
    ['Contacto', '/contacto/'],
  ] as const;

  test('lists the five sections', async ({ page }) => {
    await page.goto('/');
    const links = page
      .getByRole('navigation', { name: 'Principal' })
      .getByRole('link');
    await expect(links).toHaveText(items.map(([label]) => label));
  });

  for (const [label, href] of items) {
    test(`marks ${label} as the current page on ${href}`, async ({ page }) => {
      await page.goto(href);
      const nav = page.getByRole('navigation', { name: 'Principal' });
      await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
      await expect(nav.getByRole('link', { name: label })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });
  }

  test('keeps Servicios marked while on a service detail page', async ({
    page,
  }) => {
    await page.goto('/servicios/delivery/');
    await expect(
      page
        .getByRole('navigation', { name: 'Principal' })
        .getByRole('link', { name: 'Servicios' }),
    ).toHaveAttribute('aria-current', 'true');
  });

  test('every link stays reachable at the current viewport', async ({
    page,
  }) => {
    await page.goto('/');
    const links = page
      .getByRole('navigation', { name: 'Principal' })
      .getByRole('link');
    for (let i = 0; i < 5; i++) {
      const box = await links.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(24);
      expect(box!.x).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero shows the approved copy and CTAs', async ({ page }) => {
    const hero = page.locator('.hero');
    await expect(hero).toContainText('Certificación REPSE');
    await expect(hero.locator('h1')).toHaveText(
      'Su operación logística, resuelta de principio a fin',
    );
    await expect(hero).toContainText('Personal certificado');
    await expect(hero).toContainText('Respuesta el mismo día hábil');
    await expect(
      hero.getByRole('link', { name: 'Pida informes por WhatsApp' }),
    ).toHaveAttribute('href', 'https://wa.me/525544792696');
    await expect(
      hero.getByRole('link', { name: 'Ver servicios' }),
    ).toHaveAttribute('href', '/servicios/');
  });

  test('features the three families', async ({ page }) => {
    const section = page.locator('#familias');
    for (const family of families) {
      await expect(
        section.getByRole('heading', { name: family.name }),
      ).toBeVisible();
    }
  });

  test('shows trust items, the four process steps and a 3-item FAQ preview', async ({
    page,
  }) => {
    await expect(page.locator('#confianza')).toContainText(
      'Certificación REPSE',
    );
    await expect(page.locator('#confianza')).toContainText(
      '25+ años de experiencia',
    );
    await expect(page.locator('#proceso li')).toHaveCount(4);
    await expect(page.locator('#faq-preview details')).toHaveCount(3);
    await expect(
      page.locator('#faq-preview').getByRole('link', {
        name: /Ver todas las preguntas/,
      }),
    ).toHaveAttribute('href', '/preguntas-frecuentes/');
    await expect(page.locator('#contacto-cta')).toContainText(
      'Pida informes por WhatsApp',
    );
  });

  test('has no form', async ({ page }) => {
    await expect(page.locator('form')).toHaveCount(0);
  });

  for (const service of services) {
    test(`reaches ${service.name} in one interaction (G2)`, async ({
      page,
    }) => {
      await page
        .locator('#familias')
        .getByRole('link', { name: service.name, exact: true })
        .click();
      await expect(page).toHaveURL(new RegExp(`/servicios/${service.id}/$`));
      await expect(page.locator('h1')).toHaveText(service.name);
    });
  }
});

test.describe('services index', () => {
  test('groups all 11 services by family', async ({ page }) => {
    await page.goto('/servicios/');
    for (const family of families) {
      const group = page.locator(
        `section[aria-labelledby="family-${family.id}"]`,
      );
      await expect(
        group.getByRole('heading', { name: family.name }),
      ).toBeVisible();
      const expected = services.filter((s) => s.family === family.id);
      await expect(group.locator('li')).toHaveCount(expected.length);
    }
    await expect(page.locator('main a[href^="/servicios/"]')).toHaveCount(11);
  });
});

test.describe('service detail', () => {
  for (const service of services) {
    test(`${service.id} shows breadcrumb, summary, scope, process and CTA`, async ({
      page,
    }) => {
      await page.goto(`/servicios/${service.id}/`);
      const crumbs = page.getByRole('navigation', {
        name: 'Ruta de navegación',
      });
      await expect(crumbs.getByRole('link')).toHaveText([
        'Inicio',
        'Servicios',
      ]);
      await expect(crumbs.locator('[aria-current="page"]')).toHaveText(
        service.name,
      );
      await expect(page.locator('h1')).toHaveText(service.name);
      await expect(page.locator('main')).toContainText(service.summary);
      for (const item of service.scope) {
        await expect(page.locator('#alcance')).toContainText(item);
      }
      await expect(page.locator('#proceso li')).toHaveCount(4);
      await expect(
        page
          .locator('main')
          .getByRole('link', { name: 'Pida informes por WhatsApp' })
          .first(),
      ).toHaveAttribute('href', 'https://wa.me/525544792696');
      await expect(page).toHaveTitle(`${service.name} | Logispack`);
    });
  }
});

test.describe('nosotros', () => {
  test('shows the approved interim text and the trust items', async ({
    page,
  }) => {
    await page.goto('/nosotros/');
    const main = page.locator('main');
    await expect(main).toContainText(
      'Logispack ofrece servicios logísticos, maquila y personal especializado para empresas que no pueden detener su operación.',
    );
    await expect(main).toContainText(
      'Cuenta con más de 25 años de experiencia en maquila, logística y operación para diferentes industrias.',
    );
    for (const title of [
      'Certificación REPSE',
      '25+ años de experiencia',
      'Personal certificado',
      'Atención personalizada',
    ]) {
      await expect(main).toContainText(title);
    }
    await expect(page.locator('#proceso li')).toHaveCount(4);
  });
});

test.describe('contacto', () => {
  test('is display-only with every approved channel', async ({ page }) => {
    await page.goto('/contacto/');
    const main = page.locator('main');
    await expect(page.locator('form')).toHaveCount(0);
    await expect(
      main.getByRole('link', { name: 'Pida informes por WhatsApp' }),
    ).toHaveAttribute('href', 'https://wa.me/525544792696');
    await expect(main.locator('a[href="tel:+525544792696"]')).toBeVisible();
    await expect(main.locator('a[href="tel:+525444575887"]')).toBeVisible();
    await expect(
      main.locator('a[href="mailto:alfredocervantess@live.com.mx"]'),
    ).toBeVisible();
    await expect(main).toContainText('Mar del Frío #60, Col. Ciudad Brisa');
    await expect(main).toContainText('Lunes a sábado, 08:00 a 18:00 h');
  });
});

test.describe('preguntas frecuentes', () => {
  test('lists the four sourced questions as native disclosures', async ({
    page,
  }) => {
    await page.goto('/preguntas-frecuentes/');
    await expect(page.locator('main details')).toHaveCount(4);
    await expect(page.locator('main details > summary')).toHaveCount(4);
    await expect(page.locator('main')).toContainText(
      '¿Qué es la certificación REPSE y por qué importa?',
    );
    await expect(page.locator('main')).toContainText(
      'entre 3 y 10 días hábiles',
    );
  });
});

/** Responsive image slot contract (task 1.6), exercised with a generated placeholder. */
test.describe('image slot', () => {
  async function mountSlot(page: Page, withImage: boolean) {
    await page.goto('/');
    return page.evaluate(async (attach) => {
      const figure = document.createElement('figure');
      figure.className = 'media';
      figure.style.setProperty('--media-ratio', '4 / 3');
      const img = document.createElement('img');
      img.width = 800;
      img.height = 600;
      img.alt = 'Imagen de prueba';
      figure.append(img);
      document.querySelector('main')!.prepend(figure);

      // Mounting the slot itself moves content; only shifts after this mark count.
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      await new Promise((r) => setTimeout(r, 100));
      const mark = performance.now();
      let shift = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const ls = entry as PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          };
          if (!ls.hadRecentInput && ls.startTime >= mark) shift += ls.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });

      const before = figure.getBoundingClientRect().height;
      if (attach) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const url = canvas.toDataURL('image/png');
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.src = url;
        });
      }
      await new Promise((r) => setTimeout(r, 100));
      const after = figure.getBoundingClientRect().height;
      return {
        before,
        after,
        shift,
        imgWidth: img.getBoundingClientRect().width,
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      };
    }, withImage);
  }

  test('reserves space before load and does not shift layout', async ({
    page,
  }) => {
    const result = await mountSlot(page, true);
    expect(result.before).toBeGreaterThan(0);
    expect(result.after).toBeCloseTo(result.before, 0);
    expect(result.shift).toBeLessThanOrEqual(0.1);
  });

  test('never overflows the viewport', async ({ page }) => {
    const result = await mountSlot(page, true);
    expect(result.imgWidth).toBeLessThanOrEqual(result.client);
    expect(result.scroll).toBeLessThanOrEqual(result.client);
  });
});
