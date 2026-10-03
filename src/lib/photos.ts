import type { ImageMetadata } from 'astro';
import courierHero from '../assets/photos/courier-hero.jpg';

export interface Photo {
  image: ImageMetadata;
  /** Spanish alt text describing the photo. */
  alt: string;
}

export type PhotoSlot = 'hero' | 'nosotros';

/**
 * Photography registry. Layouts render a photo only when its slot is filled, so
 * pages look complete without photos. To add one, import the file from
 * `src/assets/photos/` and register it here with its Spanish alt text. Size
 * every slot at or below the source's native width.
 */
export const photos: Partial<Record<PhotoSlot, Photo>> = {
  // Native size 1200x1040: the desktop slot is capped at 600px for 2x density.
  hero: {
    image: courierHero,
    alt: 'Repartidor de Logispack con un paquete frente al Ángel de la Independencia',
  },
};
