import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { APIRoute } from 'astro';
import sharp from 'sharp';

const SIZE = 32;

/** Legacy favicon.ico: a single 32x32 PNG image wrapped in an ICO container. */
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

  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  header.writeUInt8(SIZE, 6); // width
  header.writeUInt8(SIZE, 7); // height
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14); // image size
  header.writeUInt32LE(header.length, 18); // image offset
  return new Response(new Uint8Array(Buffer.concat([header, png])), {
    headers: { 'Content-Type': 'image/x-icon' },
  });
};
