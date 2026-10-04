import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://logispack.capitalhumano.com.mx',
  output: 'static',
  build: {
    format: 'directory',
    // Never inline CSS: keeps the CSP free of inline <style> blocks.
    inlineStylesheets: 'never',
  },
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
});
