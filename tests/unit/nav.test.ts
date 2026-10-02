import { describe, expect, it } from 'vitest';
import { navItems, navCurrent, normalizePath } from '../../src/lib/nav';

describe('nav', () => {
  it('lists the five main sections in order', () => {
    expect(navItems.map((i) => i.label)).toEqual([
      'Inicio',
      'Servicios',
      'Nosotros',
      'Preguntas frecuentes',
      'Contacto',
    ]);
    for (const item of navItems) expect(item.href).toMatch(/^\/(.*\/)?$/);
  });

  it('normalizes paths to a trailing slash', () => {
    expect(normalizePath('/servicios')).toBe('/servicios/');
    expect(normalizePath('/servicios/')).toBe('/servicios/');
    expect(normalizePath('')).toBe('/');
  });

  it('marks the exact page and ancestor sections', () => {
    expect(navCurrent('/', '/')).toBe('page');
    expect(navCurrent('/', '/nosotros/')).toBeUndefined();
    expect(navCurrent('/servicios/', '/servicios/')).toBe('page');
    expect(navCurrent('/servicios/', '/servicios/delivery/')).toBe('true');
    expect(navCurrent('/nosotros/', '/servicios/delivery/')).toBeUndefined();
  });
});
