# Tasks: Logispack Marketing Site

Sources: `docs/PRD-logispack-uiux.md` (goals G1–G6, IA 1–7), `docs/design-system.md`, `docs/implementation-stack.md` (ADR 0002), `docs/0001-interactive-card-motion.md` (RFC 0001), `docs/content/content-deck.md`.

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 1,200–1,800 (incl. tests and config) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 tooling + walking skeleton → PR 2 content pages → PR 3 route map → PR 4 release hardening |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

Only the tracker/integration branch targets `main`.

## Working agreements

- **Strict TDD:** every behavior task starts with a failing test (red), then the minimum implementation (green), then refactor. A task is not done without its tests.
- **Definition of Ready:** copy for the task exists in `docs/content/content-deck.md` with no `[PENDING]` items; any `[VERIFY]` claim is either owner-approved or omitted.
- **Definition of Done:** CI green (lint, `astro check`, unit, build, e2e/a11y); zero axe violations; no horizontal overflow at 320px; works without JavaScript; budgets below are met.
- **Owner approvals (parallel, block release not Phase 0):** master logo SVG + white variant (provisional: `assets/brand/`), brand manual sign-off, REPSE/years/certification wording, licensed photography. Move approved files to `assets/approved/`.
- **Budgets (mobile, Lighthouse, throttled):** Performance ≥ 90, Accessibility = 100, Best Practices ≥ 95, SEO ≥ 95; LCP ≤ 2.5 s; CLS ≤ 0.1; JS ≤ 30 KB gzip per page (Home incl. map island); no third-party requests.

## Delivered

Phase 0 (PR #3), Phase 1 (PR #5), design system (PR #6), photography (PR #7), Phase 2 route map (PR #8). Task 0.7 (manual SFTP dry run) is pending the owner. Phase 3 is open.

## Phase 0: Tooling and walking skeleton (PR 1)

- [x] 0.1 Scaffold Astro (static, `build.format: 'directory'`, `site: https://logispack.capitalhumano.com.mx`), TypeScript strict, pnpm, `.nvmrc`, ESLint + Prettier. **Done:** `pnpm build` produces `dist/`. **[ADR 0002]**
- [x] 0.2 Add Vitest and Playwright + `@axe-core/playwright` with one failing smoke test (Home renders `<h1>` and a WhatsApp link), then make it pass. **Done:** `pnpm test` and `pnpm test:e2e` run locally. **[ADR 0002]**
- [x] 0.3 Add GitHub Actions CI: install → lint → `astro check` → unit → build → e2e/a11y; set the real commands in `.github/PULL_REQUEST_TEMPLATE.md`. **Done:** CI blocks a red PR. **[ADR 0002]**
- [x] 0.4 Test-first: `tokens.css` exposes the design-system tokens (single light theme) and each documented pairing meets its contrast ratio (unit test parses tokens). Implement `src/styles/tokens.css`. **[Design: palette]**
- [x] 0.5 Test-first: shell with skip link, `header`/`main`/`footer` landmarks, `lang="es-MX"`, visible `:focus-visible` (2px outline plus yellow ring), footer on `--olive-900` with `data-surface="inverse"`, white logo, both phones, email, address, hours, and WhatsApp CTA `https://wa.me/525544792696`. **[G2, G4, IA 6, PRD: contact]**
- [x] 0.6 Self-host fonts (Lexend, Source Sans 3) with `font-display: swap` and preload; test asserts no external font/script requests. **[ADR 0002, PRD: privacy]**
- [ ] 0.7 (pending owner: manual SFTP dry run) Release dry-run: build, upload `dist/` via SFTP to HostingMX, verify HTTPS and the skeleton live. **Done:** skeleton reachable at the production URL. **[ADR 0002: deployment]**

## Phase 1: Content pages (PR 2; after 0)

- [x] 1.1 Content collections: test-first schema validation for services (11), families, FAQ, and trust claims; load from `docs/content/content-deck.md` (approved copy only). **[G1, IA 3]**
- [x] 1.2 Home: hero, featured service families, proof, process, FAQ preview, contact CTA. E2E: every service reachable from Home within two interactions. **[G1, G2, IA 1]**
- [x] 1.3 Services index and service detail pages (problem, capability, flow, proof, CTA) generated from the collection. **[IA 3, IA 4]**
- [x] 1.4 About / trust page; render only owner-approved credentials (REPSE, years). **[G1, IA 5, PRD: trust]**
- [x] 1.5 Contact page (display-only channels, address, hours; no form) and FAQ page with native `<details>` disclosure. **[IA 6, IA 7]**
- [x] 1.6 Responsive images: Astro `<Image>`, explicit dimensions, AVIF/WebP, licensed assets only. E2E: 320px no overflow, CLS budget. **[G4, G5]**

## Phase 2: Illustrative route map (PR 3; after 1)

- [x] 2.1 Test-first: static route text equivalent and token-driven SVG map render without JavaScript; prohibited content check (no live location, ETA, timestamps, order IDs, "tiempo real"). **[G6, RFC 0001]**
- [x] 2.2 Test-first: marker button + popup "Ejemplo ilustrativo" (`aria-expanded`, `aria-controls`); hover, focus, tap open; hover transfer marker↔popup. **[RFC 0001]**
- [x] 2.3 Test-first: Escape, close control, outside tap dismissal; focus restoration; suppression latch (no reopen after dismissal). **[RFC 0001]**
- [x] 2.4 Test-first: `prefers-reduced-motion: reduce` shows a static marker and keeps the popup operable. **[G4, RFC 0001]**
- [x] 2.5 Visual baselines (Playwright screenshots) at 320px and desktop: neutral, hover, focus, popup-open, popup-dismissed, reduced-motion. **[PRD: evidence]**

## Phase 3: Release hardening (PR 4; after 2)

- [ ] 3.1 SEO: per-page title/description, canonical, Open Graph image, `sitemap.xml` (`@astrojs/sitemap`), `robots.txt`, favicon set. **[PRD: discoverability]**
- [ ] 3.2 Custom `404.html` and `public/.htaccess` (HTTPS redirect, 404, cache headers) after confirming the HostingMX server type. **[ADR 0002: deployment]**
- [ ] 3.3 Lighthouse CI against budgets; fix regressions. **[Working agreements]**
- [ ] 3.4 Production release via SFTP; smoke-test live pages; keep previous `dist/` for rollback. **[ADR 0002: deployment]**

## Backlog (not v1)

- Interactive card enhancement (RFC 0001 proposed portion) — only after RFC approval.
- Redirect strategy from `logispack.com.mx` to the new subdomain.
