import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../../src/lib/contrast';

const css = readFileSync(
  new URL('../../src/styles/tokens.css', import.meta.url),
  'utf8',
);

const SEMANTIC_TOKENS = [
  'primary',
  'primary-strong',
  'primary-soft',
  'secondary',
  'secondary-strong',
  'accent',
  'surface',
  'surface-subtle',
  'on-primary',
  'ink',
  'ink-muted',
  'border',
  'border-strong',
  'focus',
  'focus-inverse',
] as const;

type TokenMap = Record<string, string>;

/** Extract `--color-*: value` declarations from the rule whose selector matches exactly. */
function parseBlock(selector: string): TokenMap {
  const rules = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .matchAll(/([^{}]+)\{([^{}]*)\}/g);
  for (const [, rawSelector, body] of rules) {
    const normalized = (rawSelector ?? '').replace(/\s+/g, ' ').trim();
    if (normalized !== selector) continue;
    const tokens: TokenMap = {};
    for (const [, name, value] of (body ?? '').matchAll(
      /--color-([\w-]+)\s*:\s*([^;]+);/g,
    )) {
      if (name && value) tokens[name] = value.trim();
    }
    return tokens;
  }
  throw new Error(`Selector not found in tokens.css: ${selector}`);
}

/** Exact values documented in docs/design-system.md (Theme overrides). */
const DOCUMENTED = {
  olive: {
    primary: '#405329',
    'primary-strong': '#2e3d1e',
    'primary-soft': '#f1f1e5',
    secondary: '#a3a263',
    'secondary-strong': '#6b6b3a',
    accent: '#d9343a',
    surface: '#ffffff',
    'surface-subtle': '#f8f8f3',
    'on-primary': '#ffffff',
    ink: '#1c2613',
    'ink-muted': '#536047',
    border: '#d8d9bd',
    'border-strong': '#8a8b5a',
    focus: '#1c2613',
    'focus-inverse': '#ffffff',
  },
  logo: {
    primary: '#025624',
    'primary-strong': '#013412',
    'primary-soft': '#bfe2fd',
    secondary: '#0041af',
    'secondary-strong': '#0041af',
    accent: '#f90820',
    surface: '#ffffff',
    'surface-subtle': '#f5f8fb',
    'on-primary': '#ffffff',
    ink: '#013412',
    'ink-muted': '#4f6b8a',
    border: '#c5d3e3',
    'border-strong': '#6e8099',
    focus: '#013412',
    'focus-inverse': '#ffffff',
  },
} as const;

const themes = {
  olive: parseBlock(':root, [data-theme="olive"]'),
  logo: parseBlock('[data-theme="logo"]'),
};

describe.each(Object.entries(themes))('%s theme', (themeName, tokens) => {
  it.each(SEMANTIC_TOKENS)('defines --color-%s as a hex color', (token) => {
    expect(tokens[token]).toMatch(/^#[0-9a-f]{6}$/i);
  });

  const ratio = (fg: string, bg: string) =>
    contrastRatio(tokens[fg] as string, tokens[bg] as string);

  it.each([
    'ink',
    'ink-muted',
    'primary',
    'primary-strong',
    'secondary-strong',
  ])('%s text on surface is at least 4.5:1', (fg) => {
    expect(ratio(fg, 'surface')).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['border-strong', 'focus'])('%s on surface is at least 3:1', (fg) => {
    expect(ratio(fg, 'surface')).toBeGreaterThanOrEqual(3);
  });

  it('focus-inverse on primary-strong is at least 3:1', () => {
    expect(ratio('focus-inverse', 'primary-strong')).toBeGreaterThanOrEqual(3);
  });

  it('on-primary on primary is at least 4.5:1', () => {
    expect(ratio('on-primary', 'primary')).toBeGreaterThanOrEqual(4.5);
  });

  // Pairs actually used in the UI (global.css): text must reach 4.5:1.
  it.each([
    ['ink', 'surface-subtle'],
    ['ink', 'primary-soft'],
    ['ink-muted', 'surface-subtle'],
    ['secondary-strong', 'primary-soft'],
    ['primary', 'primary-soft'],
    ['primary', 'surface-subtle'],
    ['ink-muted', 'surface'],
    ['on-primary', 'primary-strong'],
  ])('%s text on %s is at least 4.5:1', (fg, bg) => {
    expect(ratio(fg as string, bg as string)).toBeGreaterThanOrEqual(4.5);
  });

  it('matches the documented hex value of every token', () => {
    const expected = DOCUMENTED[themeName as keyof typeof DOCUMENTED];
    const actual = Object.fromEntries(
      Object.entries(tokens).map(([k, v]) => [k, v.toLowerCase()]),
    );
    expect(actual).toEqual(expected);
  });
});

describe('no raw colors outside tokens.css', () => {
  const srcDir = fileURLToPath(new URL('../../src', import.meta.url));
  const tokensPath = fileURLToPath(
    new URL('../../src/styles/tokens.css', import.meta.url),
  );

  function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      return statSync(full).isDirectory() ? walk(full) : [full];
    });
  }

  const files = walk(srcDir).filter(
    (f) => f !== tokensPath && /\.(css|astro|ts|tsx|js|mjs|svg|html)$/.test(f),
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

describe('inverse surface and focus tokens', () => {
  it('switches focus color on inverse surfaces', () => {
    expect(css).toMatch(
      /\[data-surface="inverse"\]\s*\{[^}]*--color-focus:\s*var\(--color-focus-inverse\)/,
    );
  });

  it('re-declares the focus outline on inverse surfaces so the override resolves there', () => {
    // Custom properties resolve var() where they are declared (:root), so the outline must be re-declared.
    expect(css).toMatch(
      /\[data-surface="inverse"\]\s*\{[^}]*--focus-outline:\s*3px solid var\(--color-focus\)/,
    );
  });

  it('defines the focus outline and offset', () => {
    expect(css).toMatch(/--focus-outline:\s*3px solid var\(--color-focus\)/);
    expect(css).toMatch(/--focus-offset:\s*2px/);
  });
});
