import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { APIRoute } from 'astro';
import sharp from 'sharp';

const SIZE = 180;
const PADDING = 24;
const WHITE = { r: 255, g: 255, b: 255 };

/** iOS home-screen icon: the vector mark on an opaque white tile (iOS fills transparency with black). */
export const GET: APIRoute = async () => {
  const svg = await readFile(
    join(process.cwd(), 'src', 'assets', 'brand', 'logispack-mark.svg'),
  );
  const png = await sharp(svg, { density: 300 })
    .resize(SIZE - PADDING * 2, SIZE - PADDING * 2, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .extend({
      top: PADDING,
      bottom: PADDING,
      left: PADDING,
      right: PADDING,
      background: WHITE,
    })
    .flatten({ background: WHITE })
    .png()
    .toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
