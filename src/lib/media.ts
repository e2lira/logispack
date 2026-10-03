import type { ImageMetadata } from 'astro';

export interface MediaInput {
  image: ImageMetadata;
  /** Required Spanish alternative text describing what the photo shows. */
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  /** Candidate widths for srcset; keep each at or below the source width. */
  widths?: number[];
}

export interface ResolvedMedia {
  image: ImageMetadata;
  alt: string;
  width: number;
  height: number;
  /** CSS aspect-ratio value that reserves space before the image loads. */
  ratio: string;
  sizes: string;
  widths: number[] | undefined;
  formats: ['avif', 'webp'];
}

const DEFAULT_SIZES = '(min-width: 48rem) 50vw, 100vw';

/** Validates and normalizes the props of an image slot. Throws when alt is missing. */
export function resolveMedia(input: MediaInput): ResolvedMedia {
  const alt = input.alt.trim();
  if (!alt) throw new Error('Image slot requires a non-empty Spanish alt text');
  const width = input.width ?? input.image.width;
  const height = input.height ?? input.image.height;
  return {
    image: input.image,
    alt,
    width,
    height,
    ratio: `${width} / ${height}`,
    sizes: input.sizes ?? DEFAULT_SIZES,
    widths: input.widths,
    formats: ['avif', 'webp'],
  };
}
