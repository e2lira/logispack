import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { REQUIRED_FILES, verifyDist } from '../../scripts/release-check.mjs';

let dist: string;

function put(rel: string, content = 'x') {
  const file = join(dist, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

beforeEach(() => {
  dist = mkdtempSync(join(tmpdir(), 'lp-dist-'));
  for (const rel of REQUIRED_FILES) put(rel);
});

afterEach(() => {
  rmSync(dist, { recursive: true, force: true });
});

describe('verifyDist', () => {
  it('accepts a complete release', () => {
    expect(verifyDist(dist)).toEqual([]);
  });

  it('requires the 404 page, .htaccess, sitemap and robots', () => {
    expect([...REQUIRED_FILES]).toEqual(
      expect.arrayContaining([
        '404.html',
        '.htaccess',
        'sitemap-index.xml',
        'sitemap-0.xml',
        'robots.txt',
        'index.html',
      ]),
    );
  });

  it.each([...REQUIRED_FILES])('reports a missing %s', (rel) => {
    rmSync(join(dist, rel));
    expect(verifyDist(dist).join('\n')).toContain(rel);
  });

  it('rejects source maps', () => {
    put('_astro/app.js.map');
    expect(verifyDist(dist).join('\n')).toContain('app.js.map');
  });

  it('rejects scripts that reference a source map', () => {
    put('_astro/app.js', 'console.log(1);\n//# sourceMappingURL=app.js.map');
    expect(verifyDist(dist).join('\n')).toContain('sourceMappingURL');
  });

  it('rejects owner-only high resolution originals', () => {
    put('_astro/courier-hero-high-res.png');
    put('assets/packing-high-res.avif');
    const report = verifyDist(dist).join('\n');
    expect(report).toContain('courier-hero-high-res.png');
    expect(report).toContain('packing-high-res.avif');
  });
});
