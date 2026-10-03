import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import services from '../../src/content/services.json' with { type: 'json' };

// Reads the built output: these specs run after `pnpm build` (see test:e2e).
const DIST = join(process.cwd(), 'dist');
const SITE = 'https://logispack.capitalhumano.com.mx';

const routes = [
  '/',
  '/servicios/',
  ...services.map((s) => `/servicios/${s.id}/`),
  '/nosotros/',
  '/contacto/',
  '/preguntas-frecuentes/',
];

const html = (route: string) =>
  readFileSync(join(DIST, route, 'index.html'), 'utf8');

const metaContent = (doc: string, attr: 'name' | 'property', key: string) => {
  const m = new RegExp(
    `<meta[^>]*${attr}="${key}"[^>]*content="([^"]*)"|<meta[^>]*content="([^"]*)"[^>]*${attr}="${key}"`,
  ).exec(doc);
  return m ? (m[1] ?? m[2]) : undefined;
};

test.describe('social and SEO meta', () => {
  for (const route of routes) {
    test(`${route} has Open Graph, Twitter and canonical on the site origin`, () => {
      const doc = html(route);
      const url = `${SITE}${route}`;
      expect(doc).toContain(`<link rel="canonical" href="${url}"`);
      expect(metaContent(doc, 'property', 'og:url')).toBe(url);
      expect(metaContent(doc, 'property', 'og:type')).toBe('website');
      expect(metaContent(doc, 'property', 'og:locale')).toBe('es_MX');
      expect(metaContent(doc, 'property', 'og:site_name')).toBeTruthy();
      expect(metaContent(doc, 'property', 'og:title')).toBe(
        /<title>([^<]*)<\/title>/.exec(doc)?.[1],
      );
      expect(metaContent(doc, 'property', 'og:description')).toBe(
        metaContent(doc, 'name', 'description'),
      );
      expect(metaContent(doc, 'property', 'og:image')).toBe(
        `${SITE}/og-image.jpg`,
      );
      expect(metaContent(doc, 'property', 'og:image:width')).toBe('1200');
      expect(metaContent(doc, 'property', 'og:image:height')).toBe('630');
      expect(metaContent(doc, 'property', 'og:image:alt')).toBeTruthy();
      expect(metaContent(doc, 'name', 'twitter:card')).toBe(
        'summary_large_image',
      );
      expect(metaContent(doc, 'name', 'twitter:image')).toBe(
        `${SITE}/og-image.jpg`,
      );
      expect(metaContent(doc, 'name', 'robots')).toBeUndefined();
    });
  }

  test('serves the social card as a 1200x630 image of at most 200 KB', () => {
    const file = join(DIST, 'og-image.jpg');
    expect(existsSync(file)).toBe(true);
    expect(statSync(file).size).toBeLessThanOrEqual(200 * 1024);
    const buf = readFileSync(file);
    let i = 2;
    let size: [number, number] | undefined;
    while (i < buf.length) {
      const marker = buf[i + 1]!;
      const len = buf.readUInt16BE(i + 2);
      if (marker === 0xc0 || marker === 0xc2) {
        size = [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
        break;
      }
      i += 2 + len;
    }
    expect(size).toEqual([1200, 630]);
  });
});

test.describe('structured data', () => {
  test('home embeds a valid LocalBusiness JSON-LD block', () => {
    const doc = html('/');
    const blocks = [
      ...doc.matchAll(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
      ),
    ];
    expect(blocks).toHaveLength(1);
    const data = JSON.parse(blocks[0]![1]!) as Record<string, unknown>;
    for (const key of [
      '@context',
      '@type',
      'name',
      'url',
      'logo',
      'telephone',
      'email',
      'address',
      'openingHoursSpecification',
    ])
      expect(data).toHaveProperty(key);
    expect(data['url']).toBe(`${SITE}/`);
    expect(String(data['logo']).startsWith(`${SITE}/`)).toBe(true);
  });
});

test.describe('sitemap and robots', () => {
  test('sitemap index points at a sitemap listing all 16 routes and no 404', () => {
    const index = readFileSync(join(DIST, 'sitemap-index.xml'), 'utf8');
    expect(index).toContain(`<loc>${SITE}/sitemap-0.xml</loc>`);
    const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.sort()).toEqual(routes.map((r) => `${SITE}${r}`).sort());
    expect(sitemap).not.toContain('404');
  });

  test('robots.txt allows all and links the sitemap index', () => {
    const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8');
    expect(robots).toMatch(/User-agent: \*\s+Allow: \//);
    expect(robots).not.toMatch(/Disallow: \//);
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
  });
});

test.describe('favicon set', () => {
  test('ships svg, png, apple-touch-icon and ico', () => {
    expect(existsSync(join(DIST, 'favicon.png'))).toBe(true);
    const apple = readFileSync(join(DIST, 'apple-touch-icon.png'));
    expect(apple.readUInt32BE(16)).toBe(180);
    expect(apple.readUInt32BE(20)).toBe(180);
    const ico = readFileSync(join(DIST, 'favicon.ico'));
    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);
    const doc = html('/');
    expect(doc).toContain('rel="apple-touch-icon"');
    expect(doc).toContain('href="/favicon.ico"');
    expect(doc).toContain('type="image/svg+xml"');
  });
});
