import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../../src/lib/contrast';

const css = readFileSync(
  new URL('../../src/styles/tokens.css', import.meta.url),
  'utf8',
);

type TokenMap = Record<string, string>;

/** Extract `--name: value` declarations from the rule whose selector matches exactly. */
function parseBlock(selector: string): TokenMap {
  const rules = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .matchAll(/([^{}]+)\{([^{}]*)\}/g);
  for (const [, rawSelector, body] of rules) {
    const normalized = (rawSelector ?? '').replace(/\s+/g, ' ').trim();
    if (normalized !== selector) continue;
    const tokens: TokenMap = {};
    for (const [, name, value] of (body ?? '').matchAll(
      /--([\w-]+)\s*:\s*([^;]+);/g,
    )) {
      if (name && value) tokens[name] = value.replace(/\s+/g, '');
    }
    return tokens;
  }
  throw new Error(`Selector not found in tokens.css: ${selector}`);
}

/** Whitespace is insignificant: Prettier may reflow lists and function arguments. */
const strip = (value: string) => value.replace(/\s+/g, '');

const root = parseBlock(':root');

/** Exact values from the design system's tokens.json (single light theme). */
const COLORS = {
  surface: '#fcfcfc',
  'surface-raised': '#ffffff',
  'surface-sunken': '#ecf0ec',
  'olive-100': '#ecf0e4',
  border: '#e8ece4',
  ink: '#182414',
  'ink-muted': '#6c7078',
  'olive-900': '#485028',
  'olive-700': '#5c6434',
  'olive-500': '#888438',
  'olive-300': '#b8b88c',
  'olive-200': '#d0d0b4',
  'on-olive': '#ffffff',
  'forest-800': '#145428',
  'forest-900': '#144018',
  'logo-green': '#005020',
  'logo-leaf': '#008848',
  'logo-red': '#f80820',
  'logo-blue': '#0040a8',
  'logo-sky': '#0054b4',
  'logo-sky-mid': '#0078d0',
  'logo-sky-light': '#a0d4fc',
  'map-land': '#f0f4f4',
  'map-park': '#d8ecd4',
  'map-water': '#c0e0fc',
  'map-street': '#ffffff',
  'pin-origin': '#109834',
  'focus-ring': '#fcd40c',
  'halo-tap': '#e4d4688c',
  'halo-hover': '#ccc07059',
} as const;

const OTHER = {
  'pin-destination': 'var(--logo-red)',
  'font-display': '"Lexend", "Segoe UI", system-ui, sans-serif',
  'font-sans': '"Source Sans 3", "Segoe UI", system-ui, sans-serif',
  'space-1': '4px',
  'space-2': '8px',
  'space-3': '12px',
  'space-4': '16px',
  'space-5': '20px',
  'space-6': '24px',
  'space-8': '32px',
  'space-12': '48px',
  'radius-sm': '6px',
  'radius-md': '10px',
  'radius-lg': '16px',
  'radius-pill': '999px',
  'shadow-card':
    '0 1px 2px rgba(24,36,20,0.06), 0 4px 12px rgba(24,36,20,0.06)',
  'shadow-pop': '0 8px 24px rgba(24,36,20,0.14)',
  'shadow-button': '0 2px 4px rgba(24,36,20,0.18)',
  'tap-min': '44px',
  'icon-disc': '40px',
  'icon-disc-l': '56px',
  marker: '44px',
} as const;

describe('design system tokens (exact values from tokens.json)', () => {
  it.each(Object.entries(COLORS))('defines --%s as %s', (name, value) => {
    expect(root[name]?.toLowerCase()).toBe(strip(value));
  });

  it.each(Object.entries(OTHER))('defines --%s as %s', (name, value) => {
    expect(root[name]).toBe(strip(value));
  });

  it('has a single theme: no data-theme selectors remain', () => {
    expect(css).not.toMatch(/data-theme/);
    expect(css).not.toMatch(/--color-/);
  });
});

describe('contrast pairs from the README usage notes', () => {
  const c = (name: keyof typeof COLORS) => COLORS[name];
  const ratio = (fg: keyof typeof COLORS, bg: keyof typeof COLORS) =>
    contrastRatio(c(fg), c(bg));

  it.each([
    ['ink', 'surface'],
    ['ink', 'surface-raised'],
    ['ink', 'surface-sunken'],
    ['ink', 'olive-100'],
    ['ink-muted', 'surface'],
    ['ink-muted', 'surface-raised'],
    ['olive-700', 'surface'],
    ['olive-700', 'surface-raised'],
    ['olive-700', 'olive-100'],
    ['on-olive', 'olive-900'],
    ['on-olive', 'olive-700'],
    ['olive-200', 'olive-900'],
    ['olive-900', 'olive-100'],
    ['olive-900', 'surface-raised'],
  ] as const)('%s text on %s is at least 4.5:1', (fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it('olive-500 is large-text only: at least 3:1 on surface (24px+), below 4.5:1', () => {
    expect(ratio('olive-500', 'surface')).toBeGreaterThanOrEqual(3);
    expect(ratio('olive-500', 'surface')).toBeLessThan(4.5);
  });

  it('white icons on olive-500 and logo-red reach 3:1 (non-text)', () => {
    expect(ratio('on-olive', 'olive-500')).toBeGreaterThanOrEqual(3);
    expect(ratio('on-olive', 'logo-red')).toBeGreaterThanOrEqual(3);
  });

  it('ink-muted on surface-sunken is below 4.5:1, so body copy there uses ink', () => {
    expect(ratio('ink-muted', 'surface-sunken')).toBeLessThan(4.5);
  });

  it('olive-300 is below the 3:1 control-border floor, so olive-700 is the control border', () => {
    expect(ratio('olive-300', 'surface')).toBeLessThan(3);
    expect(ratio('olive-700', 'surface')).toBeGreaterThanOrEqual(3);
  });

  it.each(['olive-700', 'forest-800'] as const)(
    '%s control border is at least 3:1 on surface and surface-raised',
    (fg) => {
      expect(ratio(fg, 'surface')).toBeGreaterThanOrEqual(3);
      expect(ratio(fg, 'surface-raised')).toBeGreaterThanOrEqual(3);
    },
  );

  it('focus ring pair: forest-800 inner ring is at least 3:1 on every light ground', () => {
    for (const ground of [
      'surface',
      'surface-raised',
      'surface-sunken',
      'olive-100',
    ] as const) {
      expect(ratio('forest-800', ground)).toBeGreaterThanOrEqual(3);
    }
  });

  it('focus ring pair: the yellow outer ring is at least 3:1 on olive-900 and forest-800', () => {
    expect(ratio('focus-ring', 'olive-900')).toBeGreaterThanOrEqual(3);
    expect(ratio('focus-ring', 'forest-800')).toBeGreaterThanOrEqual(3);
  });

  it('inverse surfaces swap the inner ring to on-olive (at least 3:1 on olive-900)', () => {
    expect(ratio('on-olive', 'olive-900')).toBeGreaterThanOrEqual(3);
    expect(css).toMatch(
      /\[data-surface="inverse"\]\s*\{[^}]*--focus-inner:\s*var\(--on-olive\)/,
    );
    expect(root['focus-inner']).toBe(strip('var(--forest-800)'));
  });
});

describe('accessibility corrections are documented in tokens.css', () => {
  it.each(['olive-300', 'olive-500', 'logo-red', 'ink-muted', 'focus-ring'])(
    'carries a comment about %s',
    (token) => {
      const comments = [...css.matchAll(/\/\*[\s\S]*?\*\//g)]
        .map((m) => m[0])
        .join('\n');
      expect(comments).toContain(token);
    },
  );
});

describe('no raw colors outside tokens.css', () => {
  const srcDir = fileURLToPath(new URL('../../src', import.meta.url));
  const tokensPath = fileURLToPath(
    new URL('../../src/styles/tokens.css', import.meta.url),
  );
  /** Vector master logos keep their own palette; they are brand artwork, not UI styles. */
  const brandDir = join(srcDir, 'assets', 'brand');

  function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      return statSync(full).isDirectory() ? walk(full) : [full];
    });
  }

  const files = walk(srcDir).filter(
    (f) =>
      f !== tokensPath &&
      !f.startsWith(brandDir) &&
      /\.(css|astro|ts|tsx|js|mjs|svg|html)$/.test(f),
  );

  it('scans at least one source file', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('contains no hex color literals', () => {
    const offenders = files.filter((f) =>
      /#[0-9a-f]{3,8}\b/i.test(readFileSync(f, 'utf8').replace(/&#\d+;/g, '')),
    );
    expect(offenders.map((f) => relative(srcDir, f))).toEqual([]);
  });
});
