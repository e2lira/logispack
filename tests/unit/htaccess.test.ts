import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

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

  it('keeps the HTTPS redirect and does not enable HSTS', () => {
    expect(source).toMatch(/RewriteRule \^ https:\/\//);
    expect(source).not.toMatch(/Strict-Transport-Security/i);
  });
});
