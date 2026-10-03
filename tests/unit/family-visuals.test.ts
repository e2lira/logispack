import { describe, expect, it } from 'vitest';
import families from '../../src/content/families.json';
import { getFamilyVisual } from '../../src/lib/family-visuals';
import { iconNames } from '../../src/lib/icons';
import { photos } from '../../src/lib/photos';

/** Narrowest native width of the family photos (packing.jpg): card slots must never exceed it. */
const NATIVE_WIDTHS = { hero: 380, family: 447 };

describe('family visuals', () => {
  it.each(families.map((f) => f.id))(
    'maps %s to a photo with Spanish alt text, a registered icon and a tone',
    (id) => {
      const visual = getFamilyVisual(id);
      expect(visual.photo.alt.trim().length).toBeGreaterThan(20);
      expect(visual.photo.image.width).toBeGreaterThanOrEqual(
        NATIVE_WIDTHS.family,
      );
      expect(iconNames).toContain(visual.icon);
      expect(['deep', 'olive', 'red']).toContain(visual.tone);
    },
  );

  it('throws for an unknown family so a new family cannot ship without a visual', () => {
    expect(() => getFamilyVisual('nueva-familia')).toThrow(/nueva-familia/);
  });

  it('uses a distinct photo per family', () => {
    const srcs = families.map((f) => getFamilyVisual(f.id).photo.image.src);
    expect(new Set(srcs).size).toBe(families.length);
  });
});

describe('hero photo', () => {
  it('is registered with the scene described in Spanish alt text', () => {
    expect(photos.hero?.alt).toBe(
      'Repartidor de Logispack con un paquete frente al Ángel de la Independencia',
    );
    expect(photos.hero?.image.width).toBe(NATIVE_WIDTHS.hero);
  });
});
