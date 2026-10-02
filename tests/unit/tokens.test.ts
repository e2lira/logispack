import { readFileSync } from 'node:fs';
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

const themes = {
  olive: parseBlock(':root, [data-theme="olive"]'),
  logo: parseBlock('[data-theme="logo"]'),
};

describe.each(Object.entries(themes))('%s theme', (_name, tokens) => {
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
