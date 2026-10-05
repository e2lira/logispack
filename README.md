# Logispack

Marketing site for Logispack Capital Humano. Static [Astro](https://astro.build) site, plain CSS tokens, no backend, no analytics, no cookies.

Docs: [PRD](docs/PRD-logispack-uiux.md) · [Stack ADR](docs/implementation-stack.md) · [Design system](docs/design-system.md) · [Task plan](docs/executable-task-plan.md)

## Getting started

Requirements: Node 24 (see `.nvmrc`) and pnpm 11.

```sh
pnpm install
pnpm dev
```

| Script               | What it does                                                        |
| -------------------- | ------------------------------------------------------------------- |
| `pnpm dev`           | Start the dev server                                                |
| `pnpm build`         | Build the static site into `dist/`                                  |
| `pnpm preview`       | Serve `dist/` locally                                               |
| `pnpm check`         | Type-check with `astro check`                                       |
| `pnpm lint`          | ESLint (astro + jsx-a11y)                                           |
| `pnpm format`        | Prettier                                                            |
| `pnpm test`          | Unit tests (Vitest)                                                 |
| `pnpm test:e2e`      | Build, then run Playwright e2e + axe a11y (320px + desktop)         |
| `pnpm lighthouse`    | Lighthouse CI (mobile budgets) against the built `dist/`            |
| `pnpm release:check` | Build and verify `dist/` is releasable                              |
| `pnpm og:image`      | Regenerate `public/og-image.jpg` (committed; not part of the build) |

First e2e run: `pnpm exec playwright install chromium`. Playwright only serves `dist/` (`pnpm preview`); `pnpm test:e2e` rebuilds first so it never tests a stale build. Set `E2E_PORT` to change the preview port (default 4321). Astro allows one `astro preview` at a time, so stop any running preview first. CI builds once, then runs `pnpm exec playwright test`.

## Release (manual SFTP to HospedandoMX)

Per [ADR 0002](docs/implementation-stack.md#deployment).

### Before uploading

1. `main` must be green in CI (lint, check, unit, e2e/a11y, Lighthouse CI).
2. Run `pnpm release:check`. It builds and fails if `dist/` lacks `404.html`, `.htaccess`, `sitemap-index.xml`, `robots.txt`, or contains source maps or `*-high-res.*` originals. Alternatively download the `dist` artifact that CI attaches on `main`.
3. Optional: `pnpm lighthouse` (needs Chrome; set `CHROME_PATH` if it is not auto-detected).

### Upload

1. Copy the previous release first: download the current document root (or keep the previous `dist/` folder) so a rollback is possible.
2. Connect by SFTP to the document root of `logispack-capitalhumano.com.mx` (the secondary domain `logispack-capitalhumano.mx` must point to the same document root; `.htaccess` redirects it).
3. Upload the **contents** of `dist/` (not the `dist` folder itself) into the document root, replacing the previous files.
4. **Confirm SSL is active on the canonical domain before uploading `.htaccess`** (it forces HTTPS; to disable it temporarily, comment out the redirect rules). Then make sure `.htaccess` was uploaded. It is a dotfile and many SFTP clients hide dotfiles: enable "show hidden files" (FileZilla: Server > Force showing hidden files) and confirm it is listed in the document root.
5. Remove files from the previous release that no longer exist in `dist/` (hashed files in `_astro/` change on every build).

`.htaccess` is only honoured by Apache and LiteSpeed; Nginx ignores it, so HTTPS redirect, custom 404 and cache headers would then have to be configured in the HospedandoMX panel. Every directive group is wrapped in `<IfModule>`, so an unavailable module cannot cause a 500 error. The Content-Security-Policy is strict (`script-src 'self'`, `style-src 'self'`); only `style="..."` attributes are allowed inline.

### Rollback

Re-upload the previous `dist/` contents over the document root (or restore the document-root backup from step 1 of the upload) and delete files that only exist in the bad release. Static files only: there is no database or server state to revert.

### Post-release smoke checks

1. `curl -sI http://logispack-capitalhumano.com.mx/` returns `301` with `Location: https://logispack-capitalhumano.com.mx/`; `curl -sI https://logispack-capitalhumano.mx/x?a=1` and the `www.` variants of both domains return a single `301` to `https://logispack-capitalhumano.com.mx/x?a=1`.
2. `https://logispack-capitalhumano.com.mx/` loads with a valid certificate and the shell (header, footer, WhatsApp link).
3. A missing URL such as `/no-existe/` returns status `404` and shows "Página no encontrada".
4. `/sitemap-index.xml` and `/robots.txt` load; the sitemap lists 16 URLs.
5. A service page loads, for example `/servicios/servicio-de-reparto/`, with images and fonts.
6. `curl -sI https://logispack-capitalhumano.com.mx/` shows the security headers (`Content-Security-Policy`, `X-Content-Type-Options`) and a `/_astro/...` asset shows `Cache-Control: public, max-age=31536000, immutable`.
7. Open the Home in a browser console: no CSP violations and the route map renders.

Open items: confirm the HospedandoMX web server type (Apache vs LiteSpeed/Nginx), the document root, and the SSL certificate for both domains (HTTP-01 challenges under `/.well-known/acme-challenge/` are exempt from the redirect).
