# ADR 0002: Implementation stack

- **Status:** Accepted
- **Date:** 2026-10-01
- **Related:** `docs/PRD-logispack-uiux.md`, `docs/design-system.md`, `docs/0001-interactive-card-motion.md`, `docs/executable-task-plan.md`

## Context

Logispack v1 is a content marketing site with no backend, no contact form, no analytics, and no cookies (PRD non-goals). The only rich interaction is the illustrative route map (RFC 0001). The site must meet WCAG 2.2 AA, work at 320px, degrade without JavaScript, and collect no personal data.

## Decision

| Concern | Choice | Rationale |
|---|---|---|
| Framework | Astro (current stable), static output (`output: 'static'`) | HTML-first; ships zero JavaScript by default; islands for the route map only |
| Language | TypeScript, `strict` mode | Typed content collections and component props |
| Styling | Plain CSS with custom properties (`src/styles/tokens.css`) | Tokens from `docs/design-system.md` (single light theme); no CSS framework required |
| Interactivity | Vanilla TypeScript island for the route map (no UI framework) | Smallest bundle; RFC 0001 behavior needs no framework |
| Content | Astro content collections (Markdown/JSON in repo) | Copy reviewed through PRs; no CMS in v1 |
| Fonts | Lexend (display) and Source Sans 3 (body), self-hosted via `@fontsource`; every above-the-fold weight preloaded | No third-party requests; preload prevents a font-swap layout shift (0.154 CLS root cause) |
| Icons | Phosphor (`@phosphor-icons/core`), inlined SVG at build time | No runtime request or icon font |
| Package manager | pnpm | Fast, strict dependency resolution |
| Runtime | Node.js active LTS, pinned in `.nvmrc` and `package.json#engines` | Reproducible builds |
| Unit tests | Vitest | Token, content, and pure-logic tests |
| E2E / a11y tests | Playwright + `@axe-core/playwright`; serves `dist/` with `pnpm preview` on port 4321, override with `E2E_PORT` | Deterministic 320px, keyboard, pointer, touch, Escape, and reduced-motion tests required by RFC 0001 |
| Lint / format | ESLint (`eslint-plugin-astro`, `eslint-plugin-jsx-a11y`) + Prettier | Consistent code and static a11y checks |
| CI | GitHub Actions: install → lint → typecheck (`astro check`) → unit → build → e2e/a11y | Required PR gate |
| Hosting | HospedandoMX shared hosting; manual SFTP upload of the built `dist/` folder | Owner-managed; no build runs on the server |
| Domain | Canonical `https://logispack-capitalhumano.com.mx` (set as Astro `site`); secondary `logispack-capitalhumano.mx` and `www.` variants 301-redirect to it via `.htaccess` (decision 2026-10-05; replaces the never-live placeholder `logispack.capitalhumano.com.mx`) | Canonical URLs, sitemap, and Open Graph tags derive from it; one canonical host avoids duplicate content |

## Constraints

- No third-party scripts, embeds, fonts, or map tiles.
- Every page must render its full content without JavaScript; the route map island enhances a static text equivalent.
- Strict TDD: each behavior starts with a failing test.
- Astro allows one `astro preview` at a time: stop any running preview, or set `E2E_PORT`, before running `pnpm test:e2e`.

## Consequences

- Positive: minimal JavaScript, simple hosting, low maintenance, easy a11y/performance compliance.
- Negative: copy edits require a repository change (no CMS); acceptable for v1.

## Deployment

1. CI builds and tests every PR; `main` must be green before a release.
2. Release: run `pnpm build` locally (or download the CI `dist` artifact) and upload the contents of `dist/` to the subdomain's document root via SFTP, replacing the previous release.
3. Use Astro `build.format: 'directory'` so every route is a folder with `index.html` and works on any static server without rewrites.
4. Ship a `public/.htaccess` (if the server is Apache, verify with HospedandoMX) for HTTPS redirect, the custom `404.html`, and long-lived caching of hashed `/_astro/` assets.
5. Keep the previous `dist/` copy locally for a manual rollback.

## Open questions

1. Confirm the HospedandoMX web server (Apache vs LiteSpeed/Nginx), that both domains (`logispack-capitalhumano.com.mx` as primary and `logispack-capitalhumano.mx` as alias/addon) point to the same document root, and that SSL certificates are issued for both domains and their `www.` variants.
