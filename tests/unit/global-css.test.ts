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
    expect(page?.[1]).toMatch(
      /border-block-end-color:\s*var\(--color-primary\)/,
    );
    expect(section?.[1]).toMatch(/color:\s*var\(--color-primary\)/);
    expect(section?.[1]).toMatch(/border-block-end-style:\s*dashed/);
    expect(section?.[1]).not.toEqual(page?.[1]);
  });
});
