import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SITE_HOST, SITE_URL } from '../../site.config.mjs';

const read = (p: string) =>
  readFileSync(resolve(__dirname, '../..', p), 'utf8');

describe('production domain single source', () => {
  it('is the canonical https apex', () => {
    expect(SITE_URL).toBe('https://logispack-capitalhumano.com.mx');
    expect(SITE_HOST).toBe('logispack-capitalhumano.com.mx');
  });

  it('is used by astro.config.mjs', () => {
    expect(read('astro.config.mjs')).toMatch(/site:\s*SITE_URL/);
  });

  it('is the sitemap host in public/robots.txt', () => {
    expect(read('public/robots.txt')).toContain(
      `Sitemap: ${SITE_URL}/sitemap-index.xml`,
    );
  });

  it('leaves no trace of the old placeholder host', () => {
    for (const f of [
      'astro.config.mjs',
      'public/robots.txt',
      'public/.htaccess',
    ]) {
      expect(read(f)).not.toContain('logispack.capitalhumano');
    }
  });
});
