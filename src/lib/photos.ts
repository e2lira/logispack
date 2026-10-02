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
 * `src/assets/photos/` and register it here with its Spanish alt text. The
 * source photos are low resolution: size every slot at or below its native width.
 */
export const photos: Partial<Record<PhotoSlot, Photo>> = {
  // Native size 380x342: never render this slot wider than 380px.
  hero: {
    image: courierHero,
    alt: 'Repartidor de Logispack con un paquete frente al Ángel de la Independencia',
  },
};
