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
});

describe('global.css', () => {
  it('uses dynamic viewport height with a vh fallback', () => {
    expect(css).toMatch(/min-height:\s*100vh;\s*min-height:\s*100dvh;/);
  });

  it('keeps a visible (subtle) focus indicator on main instead of removing it', () => {
    expect(css).not.toMatch(/main:focus\s*\{\s*outline:\s*none/);
    expect(css).toMatch(/main:focus-visible\s*\{[^}]*outline:/);
  });
});
