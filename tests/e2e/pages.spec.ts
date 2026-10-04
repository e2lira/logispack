import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
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

const templates = [
  ['home', '/'],
  ['services index', '/servicios/'],
  ['service detail', `/servicios/${services[0]!.id}/`],
  ['nosotros', '/nosotros/'],
  ['contacto', '/contacto/'],
  ['preguntas frecuentes', '/preguntas-frecuentes/'],
] as const;

test.describe('every route', () => {
  for (const route of routes) {
    test.describe(route, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(route);
      });

      test('has zero axe violations', async ({ page }) => {
        const results = await new AxeBuilder({ page })
          .withTags(AXE_TAGS)
          .analyze();
        expect(results.violations).toEqual([]);
      });

      test('has no horizontal overflow at 320px', async ({
        page,
      }, testInfo) => {
        test.skip(
          testInfo.project.name !== 'mobile-320',
          'overflow is only meaningful at the 320px viewport',
        );
        expect(page.viewportSize()?.width).toBe(320);
        const widths = await page.evaluate(() => ({
          client: document.documentElement.clientWidth,
          html: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
        }));
        expect(widths.html).toBeLessThanOrEqual(widths.client);
        expect(widths.body).toBeLessThanOrEqual(widths.client);
      });
    });
  }
});

test.describe('page templates', () => {
  for (const [name, route] of templates) {
    test(`${name} has one h1, landmarks, metadata and scripts only on Home`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('header')).toHaveCount(1);
      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('footer')).toHaveCount(1);
      await expect(page.locator('nav[aria-label="Principal"]')).toHaveCount(1);
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
      // Only Home carries JavaScript (the route-map island); every other route ships none.
      // JSON-LD blocks are inert data, not executable script.
      await expect(
        page.locator('script:not([type="application/ld+json"])'),
      ).toHaveCount(route === '/' ? 1 : 0);
      expect(await page.locator('body').innerText()).not.toMatch(
        /tiempo real|rastrea/i,
      );
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

  test('home shows the h1 and the WhatsApp CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText(
      'Su operación logística, resuelta de principio a fin',
    );
    await expect(
      page.locator('main a[href="https://wa.me/525544792696"]').first(),
    ).toBeVisible();
  });

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

test.describe('navigation to a service (G2)', () => {
  test('reaches a service detail in two interactions via the header', async ({
    page,
  }) => {
    const service = services[0]!;
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Principal' })
      .getByRole('link', { name: 'Servicios' })
      .click();
    await expect(page).toHaveURL(/\/servicios\/$/);
    await page
      .locator('main')
      .getByRole('link', { name: service.name, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/servicios/${service.id}/$`));
    await expect(page.locator('h1')).toHaveText(service.name);
  });
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
        page.locator('#proceso').getByRole('heading', { level: 2 }),
      ).toHaveText('Cómo trabajamos en todos nuestros servicios');
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
    await expect(page.locator('.cta-band')).toHaveCount(0);
    await expect(
      main.getByRole('link', { name: 'Pida informes por WhatsApp' }),
    ).toHaveAttribute('href', 'https://wa.me/525544792696');
    await expect(main.locator('a[href="tel:+525544792696"]')).toBeVisible();
    await expect(main.locator('a[href="tel:+525444575887"]')).toBeVisible();
    await expect(main.locator('a[href="tel:+525535689549"]')).toBeVisible();
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

test.describe('photography', () => {
  test('feature card photos anchor the crop to the top so faces are kept', async ({
    page,
  }) => {
    await page.goto('/');
    const imgs = page.locator('.feature .media img');
    await expect(imgs).toHaveCount(3);
    for (const img of await imgs.all()) {
      await expect(img).toHaveCSS('object-position', '50% 0%');
    }
  });

  test('hero photo is the eager, high-priority LCP image', async ({ page }) => {
    await page.goto('/');
    const img = page.locator('.hero img');
    await expect(img).toHaveCount(1);
    await expect(img).toHaveAttribute('loading', 'eager');
    await expect(img).toHaveAttribute('fetchpriority', 'high');
    await expect(img).toHaveAttribute('width', '1200');
    await expect(img).toHaveAttribute('height', '1040');
    await expect(img).toHaveAttribute(
      'alt',
      'Repartidor de Logispack con un paquete frente al Ángel de la Independencia',
    );
  });

  test('each service family card shows a lazy photo with alt text', async ({
    page,
  }) => {
    await page.goto('/');
    const images = page.locator('#familias img');
    await expect(images).toHaveCount(families.length);
    for (let i = 0; i < families.length; i++) {
      await expect(images.nth(i)).toHaveAttribute('loading', 'lazy');
      await expect(images.nth(i)).toHaveAttribute('alt', /.{20,}/);
    }
  });

  test('no raster photo is displayed larger than its native width', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() =>
      document
        .querySelectorAll('img')
        .forEach((img) => img.setAttribute('loading', 'eager')),
    );
    await page.waitForLoadState('networkidle');
    const sizes = await page.$$eval('main img', (imgs) =>
      imgs.map((img) => ({
        src: (img as HTMLImageElement).currentSrc,
        shown: img.getBoundingClientRect().width,
        natural: (img as HTMLImageElement).naturalWidth,
      })),
    );
    expect(sizes.length).toBe(1 + families.length);
    for (const { shown, natural, src } of sizes) {
      expect(natural, src).toBeGreaterThan(0);
      expect(shown, src).toBeLessThanOrEqual(natural + 0.5);
    }
    expect(sizes[0]!.shown).toBeLessThanOrEqual(600.5);
  });
});

test.describe('tap targets', () => {
  test('buttons, nav links and disclosure summaries are at least 44px tall', async ({
    page,
  }) => {
    await page.goto('/');
    const heights = await page.$$eval(
      '.button, .site-nav a, .faq summary, .feature-link',
      (els) =>
        els
          .filter((el) => el.getClientRects().length > 0)
          .map((el) => el.getBoundingClientRect().height),
    );
    expect(heights.length).toBeGreaterThan(10);
    for (const height of heights) expect(height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('reduced motion', () => {
  test('buttons do not transition or transform', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const style = await page
      .locator('.button')
      .first()
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return { duration: s.transitionDuration, transform: s.transform };
      });
    expect(style.duration).toBe('0s');
    expect(style.transform).toBe('none');
  });
});

test('home hero accent line is olive-500 and at least 24px', async ({
  page,
}) => {
  await page.goto('/');
  const style = await page.locator('.hero h1 span').evaluate((el) => {
    const s = getComputedStyle(el);
    return { color: s.color, size: parseFloat(s.fontSize) };
  });
  expect(style.color).toBe('rgb(136, 132, 56)');
  expect(style.size).toBeGreaterThanOrEqual(24);
});
