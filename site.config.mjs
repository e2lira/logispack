// Single source of truth for the production origin. Tests and astro.config.mjs
// read it; public/robots.txt and public/.htaccess are static and are guarded
// by unit tests that compare them against this value.
export const SITE_URL = 'https://logispack-capitalhumano.com.mx';
export const SITE_HOST = new URL(SITE_URL).host;
