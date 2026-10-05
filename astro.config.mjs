import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './site.config.mjs';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  build: {
    format: 'directory',
    // Never inline CSS: keeps the CSP free of inline <style> blocks.
    inlineStylesheets: 'never',
  },
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
});
