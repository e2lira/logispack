import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SITE_HOST, SITE_URL } from '../../site.config.mjs';
import { evaluate, redirectConds, redirectRule } from './htaccess-redirect';

const raw = readFileSync(resolve(__dirname, '../../public/.htaccess'), 'utf8');
// Directives only: drop comment lines so prose cannot trip the assertions.
const source = raw
  .split(/\r?\n/)
  .filter((line) => !line.trim().startsWith('#'))
  .join('\n');

describe('public/.htaccess (shared hosting safe)', () => {
  it('has no <Location> or <Directory> blocks (server context only)', () => {
    expect(source).not.toMatch(
      /<\s*(Location|LocationMatch|Directory|DirectoryMatch)\b/i,
    );
  });

  it('wraps every directive group in <IfModule> (only ErrorDocument is bare)', () => {
    const outside = source.replace(/<IfModule[\s\S]*?<\/IfModule>/gi, '');
    const bare = outside
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    expect(bare).toEqual(['ErrorDocument 404 /404.html']);
  });

  it('does not use Options (needs AllowOverride Options)', () => {
    expect(source).not.toMatch(/^\s*Options\b/im);
  });

  it('does not use Require (needs AllowOverride AuthConfig)', () => {
    expect(source).not.toMatch(/^\s*Require\b/im);
  });

  it('ties the immutable cache rule to _astro via an env flag', () => {
    expect(source).toMatch(
      /RewriteRule\s+\^_astro\/\s+-\s+\[E=IMMUTABLE_ASSET:1\]/,
    );
    expect(source).toMatch(
      /Header set Cache-Control "public, max-age=31536000, immutable" env=IMMUTABLE_ASSET/,
    );
    expect(source).toMatch(
      /Header set Cache-Control "public, max-age=31536000, immutable" env=REDIRECT_IMMUTABLE_ASSET/,
    );
  });

  it('declares the immutable rule after the other cache rules so it wins', () => {
    const lines = source
      .split(String.fromCharCode(10))
      .filter((l) => /Cache-Control/.test(l));
    const firstImmutable = lines.findIndex((l) => /immutable/.test(l));
    const lastOther = lines.map((l) => /immutable/.test(l)).lastIndexOf(false);
    expect(firstImmutable).toBeGreaterThan(lastOther);
  });

  it('caches non-hashed static assets for one week', () => {
    expect(source).toMatch(/jpg\|jpeg\|png\|webp\|avif\|ico\|svg\|woff2/);
    expect(source).toMatch(/Cache-Control "public, max-age=604800"/);
  });

  it('blocks dotfiles except .well-known with a rewrite rule', () => {
    expect(source).toContain(
      String.raw`RewriteRule "(^|/)\.(?!well-known/)" - [F,L]`,
    );
  });

  it('does not enable HSTS', () => {
    expect(source).not.toMatch(/Strict-Transport-Security/i);
  });
});

describe('canonical host + HTTPS redirect', () => {
  const escapedHost = SITE_HOST.replace(/\./g, String.raw`\.`);

  it('uses exactly one R=301 rule to the canonical https URL', () => {
    const rules = source.split('\n').filter((l) => /R=301/.test(l));
    expect(rules).toHaveLength(1);
    expect(rules[0]?.trim()).toBe(
      `RewriteRule ^ ${SITE_URL}%{REQUEST_URI} [L,R=301]`,
    );
  });

  it('checks the exact canonical host', () => {
    expect(source).toContain(escapedHost);
    expect(source).toMatch(/%\{HTTP_HOST\}/);
  });

  it('stays proxy-aware (HTTPS and X-Forwarded-Proto)', () => {
    expect(source).toMatch(/%\{HTTPS\}/);
    expect(source).toMatch(/%\{HTTP:X-Forwarded-Proto\}/);
  });

  it('exempts /.well-known/acme-challenge/ from the redirect', () => {
    expect(redirectConds.join('\n')).toContain(
      String.raw`!^/\.well-known/acme-challenge/`,
    );
  });

  it('declares the redirect before the dotfile block', () => {
    expect(source.indexOf('R=301')).toBeLessThan(source.indexOf('[F,L]'));
  });

  it('has the redirect rule and conditions inside mod_rewrite', () => {
    expect(redirectRule).toBeDefined();
    expect(redirectConds.length).toBeGreaterThan(0);
  });

  const target = (path: string) => `${SITE_URL}${path}`;
  const cases: Array<{
    name: string;
    req: Parameters<typeof evaluate>[0];
    location?: string;
  }> = [
    {
      name: 'http + canonical',
      req: { host: SITE_HOST, https: false, path: '/a/' },
      location: target('/a/'),
    },
    {
      name: 'https + www.com.mx',
      req: { host: `www.${SITE_HOST}`, https: true, path: '/servicios/' },
      location: target('/servicios/'),
    },
    {
      name: 'http + secondary .mx',
      req: { host: 'logispack-capitalhumano.mx', https: false, path: '/x' },
      location: target('/x'),
    },
    {
      name: 'https + secondary .mx',
      req: { host: 'logispack-capitalhumano.mx', https: true, path: '/' },
      location: target('/'),
    },
    {
      name: 'https + www.mx',
      req: { host: 'www.logispack-capitalhumano.mx', https: true, path: '/' },
      location: target('/'),
    },
    {
      name: 'old placeholder subdomain',
      req: { host: `logispack.${SITE_HOST}`, https: true, path: '/' },
      location: target('/'),
    },
    {
      name: 'https + canonical',
      req: { host: SITE_HOST, https: true, path: '/' },
    },
    {
      name: 'canonical host casing',
      req: { host: SITE_HOST.toUpperCase(), https: true, path: '/' },
    },
    {
      name: 'X-Forwarded-Proto https on canonical',
      req: {
        host: SITE_HOST,
        https: false,
        xForwardedProto: 'https',
        path: '/',
      },
    },
    {
      name: 'X-Forwarded-Proto http on canonical',
      req: {
        host: SITE_HOST,
        https: false,
        xForwardedProto: 'http',
        path: '/',
      },
      location: target('/'),
    },
    {
      name: 'acme challenge on secondary .mx (http)',
      req: {
        host: 'logispack-capitalhumano.mx',
        https: false,
        path: '/.well-known/acme-challenge/token123',
      },
    },
    {
      name: 'acme challenge on canonical (http)',
      req: {
        host: SITE_HOST,
        https: false,
        path: '/.well-known/acme-challenge/token123',
      },
    },
    {
      name: 'other .well-known path is not exempt',
      req: {
        host: 'logispack-capitalhumano.mx',
        https: false,
        path: '/.well-known/security.txt',
      },
      location: target('/.well-known/security.txt'),
    },
  ];

  it.each(cases)('$name', ({ req, location }) => {
    const out = evaluate(req);
    if (location) {
      expect(out).toEqual({ redirect: true, status: 301, location });
    } else {
      expect(out.redirect).toBe(false);
    }
  });

  it('never chains: the redirect target itself is not redirected', () => {
    const out = evaluate({
      host: 'logispack-capitalhumano.mx',
      https: false,
      path: '/p',
    });
    const url = new URL(out.location ?? '');
    const next = evaluate({
      host: url.host,
      https: url.protocol === 'https:',
      path: url.pathname,
    });
    expect(next.redirect).toBe(false);
  });
});
