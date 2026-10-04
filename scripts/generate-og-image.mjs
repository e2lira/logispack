/**
 * Generates public/og-image.jpg (1200x630): hero photo on the right, olive-900
 * panel on the left with the white logo. Run with `pnpm og:image` and commit the
 * result; the build does not depend on it.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;
const OLIVE_900 = '#485028';
const PANEL_WIDTH = 640;

const root = process.cwd();
const photo = await sharp(
  join(root, 'src', 'assets', 'photos', 'courier-hero.jpg'),
)
  .resize(WIDTH - PANEL_WIDTH + 120, HEIGHT, { fit: 'cover', position: 'east' })
  .toBuffer();

const logoSvg = await readFile(
  join(root, 'src', 'assets', 'brand', 'logispack-logo-white.svg'),
);
const logo = await sharp(logoSvg, { density: 300 })
  .resize({ width: 480 })
  .png()
  .toBuffer();
const logoMeta = await sharp(logo).metadata();

const panel = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${PANEL_WIDTH}" height="${HEIGHT}">
    <defs>
      <linearGradient id="fade" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="${OLIVE_900}" stop-opacity="1" />
        <stop offset="0.82" stop-color="${OLIVE_900}" stop-opacity="1" />
        <stop offset="1" stop-color="${OLIVE_900}" stop-opacity="0" />
      </linearGradient>
    </defs>
    <rect width="${PANEL_WIDTH}" height="${HEIGHT}" fill="url(#fade)" />
  </svg>`,
);

const jpeg = await sharp({
  create: {
    width: WIDTH,
    height: HEIGHT,
    channels: 3,
    background: OLIVE_900,
  },
})
  .composite([
    { input: photo, left: PANEL_WIDTH - 120, top: 0 },
    { input: panel, left: 0, top: 0 },
    {
      input: logo,
      left: 72,
      top: Math.round((HEIGHT - (logoMeta.height ?? 0)) / 2),
    },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toBuffer();

await writeFile(join(root, 'public', 'og-image.jpg'), jpeg);
console.log(`og-image.jpg written (${(jpeg.length / 1024).toFixed(1)} KB)`);
