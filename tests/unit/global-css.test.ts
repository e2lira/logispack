import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contact } from '../../src/lib/contact';

const css = readFileSync(
  new URL('../../src/styles/global.css', import.meta.url),
  'utf8',
);

describe('contact copy', () => {
  it('uses the usted register for the WhatsApp CTA', () => {
    expect(contact.whatsappLabel).toBe('Pida informes por WhatsApp');
  });

  it('labels the shared number as WhatsApp', () => {
    expect(contact.phones[0]?.label).toBe('WhatsApp');
    expect(contact.phones[1]?.label).toBe('Teléfono');
  });

  it('lists the third mobile number', () => {
    expect(contact.phones).toHaveLength(3);
    expect(contact.phones[2]).toEqual({
      display: '55 35 68 95 49',
      href: 'tel:+525535689549',
      label: 'Celular',
    });
  });
});

describe('global.css', () => {
  it('uses dynamic viewport height with a vh fallback', () => {
    expect(css).toMatch(/min-height:\s*100vh;\s*min-height:\s*100dvh;/);
  });

  it('keeps a visible (subtle) focus indicator on main instead of removing it', () => {
    expect(css).not.toMatch(/main:focus\s*\{\s*outline:\s*none/);
    expect(css).toMatch(/main:focus-visible\s*\{[^}]*outline:/);
  });

  it('styles page and section current states distinctly in the nav', () => {
    const page = css.match(/\.site-nav a\[aria-current="page"\]\s*\{([^}]*)\}/);
    const section = css.match(
      /\.site-nav a\[aria-current="true"\]\s*\{([^}]*)\}/,
    );
    expect(page?.[1]).toMatch(/border-block-end-color:\s*var\(--olive-900\)/);
    expect(page?.[1]).toMatch(/color:\s*var\(--ink\)/);
    expect(section?.[1]).toMatch(/color:\s*var\(--ink\)/);
    expect(section?.[1]).toMatch(/border-block-end-style:\s*dashed/);
    expect(section?.[1]).not.toEqual(page?.[1]);
  });

  it('uses a 4px olive-900 underline for the current nav link', () => {
    expect(css).toMatch(/\.site-nav a\s*\{[^}]*border-block-end:\s*4px solid/);
  });

  it('only references design-system token names (no legacy --color-* tokens)', () => {
    expect(css).not.toMatch(/var\(--color-/);
    expect(css).not.toMatch(/data-theme/);
  });

  it('draws focus with a forced-colors-safe outline plus the yellow outer ring', () => {
    const rule = css.match(/(?:^|\n):focus-visible\s*\{([^}]*)\}/);
    expect(rule?.[1]).toMatch(/outline:\s*2px solid var\(--focus-inner\)/);
    expect(rule?.[1]).toMatch(/outline-offset:\s*0/);
    expect(rule?.[1]).toMatch(/box-shadow:\s*0 0 0 5px var\(--focus-ring\)/);
  });

  it('never uses olive-300 for borders or logo-red for text', () => {
    const rules = css.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(rules).not.toMatch(/border[^;{}]*olive-300/);
    expect(rules).not.toMatch(/(?<![-\w])color:\s*var\(--logo-red\)/);
  });

  it('gives secondary buttons an olive-700 border', () => {
    expect(css).toMatch(
      /\.button--outline\s*\{[^}]*border-color:\s*var\(--olive-700\)/,
    );
  });

  it('keeps tap targets at the tap-min token', () => {
    expect(css).toMatch(/\.button\s*\{[^}]*min-height:\s*var\(--tap-min\)/);
    expect(css).toMatch(/\.site-nav a\s*\{[^}]*min-height:\s*var\(--tap-min\)/);
  });

  it('declares transitions and transforms only when motion is allowed', () => {
    const withoutMotionBlock = css.replace(
      /@media \(prefers-reduced-motion: no-preference\)\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g,
      '',
    );
    expect(withoutMotionBlock).not.toMatch(/\btransition\s*:/);
    expect(withoutMotionBlock).not.toMatch(/\btransform\s*:/);
    expect(css).toMatch(/prefers-reduced-motion: no-preference/);
  });
});
