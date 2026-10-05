import AxeBuilder from '@axe-core/playwright';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, test } from '@playwright/test';
import { SITE_URL } from '../../site.config.mjs';
import services from '../../src/content/services.json' with { type: 'json' };

// Reads the built output: these specs run after `pnpm build` (see test:e2e).
const DIST = join(process.cwd(), 'dist');

const routes = [
  '/',
  '/servicios/',
  ...services.map((s) => `/servicios/${s.id}/`),
  '/nosotros/',
  '/contacto/',
  '/preguntas-frecuentes/',
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const htaccess = () => readFileSync(join(DIST, '.htaccess'), 'utf8');

function parseCsp(): Map<string, string[]> {
  const line = /Header always set Content-Security-Policy "([^"]+)"/.exec(
    htaccess(),
  );
  expect(line, 'CSP header present in .htaccess').not.toBeNull();
  return new Map(
    line![1]!
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const [name, ...values] = d.split(/\s+/);
        return [name!, values] as const;
      }),
  );
}

test.describe('404 page', () => {
  test('is built as 404.html', () => {
    expect(existsSync(join(DIST, '404.html'))).toBe(true);
  });

  test('renders deck copy, noindex and no JavaScript', async ({ page }) => {
    const response = await page.goto('/ruta-que-no-existe/');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Página no encontrada');
    await expect(page.locator('main')).toContainText(
      'La página que busca no existe o fue movida. Puede volver al inicio o consultar nuestros servicios.',
    );
    await expect(
      page.getByRole('link', { name: 'Volver al inicio' }),
    ).toHaveAttribute('href', '/');
    await expect(
      page.getByRole('link', { name: 'Pida informes por WhatsApp' }).first(),
    ).toHaveAttribute('href', /^https:\/\/wa\.me\/525544792696/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex',
    );
    expect(await page.locator('script').count()).toBe(0);
  });

  test('has zero axe violations', async ({ page }) => {
    await page.goto('/ruta-que-no-existe/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('is excluded from the sitemap', () => {
    const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
    expect(sitemap).not.toContain('404');
  });
});

test.describe('.htaccess', () => {
  test('ships in dist', () => {
    expect(existsSync(join(DIST, '.htaccess'))).toBe(true);
  });

  test('forces HTTPS, serves the custom 404 and sets cache policy', () => {
    const file = htaccess();
    expect(file).toMatch(/RewriteCond %\{HTTP_HOST\}\|%\{HTTPS\}/);
    expect(file).toContain(`RewriteRule ^ ${SITE_URL}%{REQUEST_URI} [L,R=301]`);
    expect(file).toContain('ErrorDocument 404 /404.html');
    expect(file).toContain('public, max-age=31536000, immutable');
    expect(file).toContain('no-cache');
    for (const type of ['avif', 'webp', 'woff2', 'svg'])
      expect(file).toContain(type);
    expect(file).toContain('mod_deflate');
    for (const header of [
      'X-Content-Type-Options "nosniff"',
      'Referrer-Policy "strict-origin-when-cross-origin"',
      'Permissions-Policy',
      'X-Frame-Options "SAMEORIGIN"',
    ])
      expect(file).toContain(header);
  });

  test('wraps every directive group in IfModule', () => {
    const file = htaccess();
    const opens = file.match(/<IfModule /g)?.length ?? 0;
    const closes = file.match(/<\/IfModule>/g)?.length ?? 0;
    expect(opens).toBeGreaterThan(0);
    expect(opens).toBe(closes);
    const outside = file
      .replace(/<IfModule[\s\S]*?<\/IfModule>/g, '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));
    // Only core directives (always available) may sit outside IfModule.
    expect(outside.every((l) => /^ErrorDocument\b/.test(l))).toBe(true);
  });

  test('CSP is strict and declares the hardening directives', () => {
    const csp = parseCsp();
    expect(csp.get('default-src')).toEqual(["'self'"]);
    expect(csp.get('script-src')).toEqual(["'self'"]);
    expect(csp.get('style-src')).toEqual(["'self'"]);
    expect(csp.get('img-src')).toEqual(["'self'", 'data:']);
    expect(csp.get('frame-ancestors')).toEqual(["'self'"]);
    expect(csp.get('base-uri')).toEqual(["'self'"]);
    expect(csp.get('form-action')).toEqual(["'none'"]);
    expect(csp.get('script-src')).not.toContain("'unsafe-inline'");
    expect(csp.get('script-src')).not.toContain("'unsafe-eval'");
  });

  test('CSP allows everything the built pages load', () => {
    const csp = parseCsp();
    const pages = walk(DIST).filter((f) => f.endsWith('.html'));
    expect(pages.length).toBeGreaterThanOrEqual(17);
    const styleAttr = csp.get('style-src-attr') ?? csp.get('style-src')!;
    for (const file of pages) {
      const doc = readFileSync(file, 'utf8');
      const name = relative(DIST, file);
      // inline scripts (JSON-LD is data, not script execution)
      const inlineScripts = [
        ...doc.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g),
      ].filter((m) => !/type="application\/ld\+json"/.test(m[1]!));
      expect(inlineScripts, `${name}: inline scripts`).toEqual([]);
      expect(doc.includes('<style'), `${name}: inline <style>`).toBe(false);
      expect(doc, `${name}: inline event handlers`).not.toMatch(/\son[a-z]+="/);
      if (/\sstyle="/.test(doc))
        expect(styleAttr, `${name}: style attributes`).toContain(
          "'unsafe-inline'",
        );
      // every subresource is same-origin
      const refs = [
        ...doc.matchAll(
          /<(?:script|img|source|link(?![^>]*rel="(?:canonical|alternate)"))[^>]*\s(?:src|srcset|href)="([^"]+)"/g,
        ),
      ].map((m) => m[1]!);
      for (const ref of refs)
        expect(ref, `${name}: subresource ${ref}`).not.toMatch(
          /^(?:https?:)?\/\//,
        );
    }
    for (const file of walk(join(DIST, '_astro')).filter((f) =>
      f.endsWith('.css'),
    )) {
      const css = readFileSync(file, 'utf8');
      expect(css, relative(DIST, file)).not.toMatch(
        /url\((?:["']?)(?:https?:)?\/\//,
      );
      expect(css, 'no @import of remote CSS').not.toMatch(/@import/);
    }
  });
});

test.describe('CSP enforced in the browser', () => {
  for (const route of routes) {
    test(`${route} raises no CSP violations`, async ({ page }) => {
      const csp = [...parseCsp()]
        .map(([name, values]) => `${name} ${values.join(' ')}`)
        .join('; ');
      await page.route('**/*', async (route) => {
        const response = await route.fetch();
        await route.fulfill({
          response,
          headers: { ...response.headers(), 'content-security-policy': csp },
        });
      });
      await page.addInitScript(() => {
        (window as unknown as { __csp: string[] }).__csp = [];
        document.addEventListener('securitypolicyviolation', (event) =>
          (window as unknown as { __csp: string[] }).__csp.push(
            `${event.violatedDirective} ${event.blockedURI}`,
          ),
        );
      });
      await page.goto(route, { waitUntil: 'networkidle' });
      const violations = await page.evaluate(
        () => (window as unknown as { __csp: string[] }).__csp,
      );
      expect(violations).toEqual([]);
    });
  }
});
