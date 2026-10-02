import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { APIRoute } from 'astro';
import sharp from 'sharp';

const SIZE = 192;

/** PNG fallback for browsers without SVG favicon support, rendered from the vector mark at build time. */
export const GET: APIRoute = async () => {
  const svg = await readFile(
    join(process.cwd(), 'src', 'assets', 'brand', 'logispack-mark.svg'),
  );
  const png = await sharp(svg, { density: 300 })
    .resize(SIZE, SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
