import type { ImageMetadata } from 'astro';

export interface Photo {
  image: ImageMetadata;
  /** Spanish alt text describing the photo. */
  alt: string;
}

export type PhotoSlot = 'hero' | 'nosotros';

/**
 * Photography registry. Layouts render a photo only when its slot is filled, so
 * pages look complete without photos. To add one, import the file from
 * `src/assets/photos/` and register it here with its Spanish alt text:
 *
 *   import heroPhoto from '../assets/photos/hero.jpg';
 *   export const photos = { hero: { image: heroPhoto, alt: '...' } };
 */
export const photos: Partial<Record<PhotoSlot, Photo>> = {};
