import { describe, expect, it } from 'vitest';
import { photos } from '../../src/lib/photos';
import { resolveMedia } from '../../src/lib/media';

const image = {
  src: '/x.png',
  width: 1600,
  height: 900,
  format: 'png',
} as const;

describe('resolveMedia', () => {
  it('requires a non-empty Spanish alt text', () => {
    expect(() => resolveMedia({ image, alt: '' })).toThrow(/alt/);
    expect(() => resolveMedia({ image, alt: '   ' })).toThrow(/alt/);
  });

  it('derives explicit dimensions and aspect ratio from the image', () => {
    const media = resolveMedia({ image, alt: 'Almacén con racks' });
    expect(media).toMatchObject({
      width: 1600,
      height: 900,
      ratio: '1600 / 900',
      formats: ['avif', 'webp'],
    });
    expect(media.sizes).toContain('100vw');
  });

  it('honors explicit width/height and keeps the ratio consistent', () => {
    const media = resolveMedia({
      image,
      alt: 'Reparto',
      width: 800,
      height: 600,
    });
    expect(media.width).toBe(800);
    expect(media.height).toBe(600);
    expect(media.ratio).toBe('800 / 600');
  });
});

describe('photos registry', () => {
  it('only registers photos with an alt text', () => {
    for (const [key, photo] of Object.entries(photos)) {
      expect(photo?.alt.trim().length, key).toBeGreaterThan(0);
    }
  });
});
