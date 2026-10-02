import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://logispack.capitalhumano.com.mx',
  output: 'static',
  build: { format: 'directory' },
});
