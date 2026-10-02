# Logispack

Marketing site for Logispack Capital Humano. Static [Astro](https://astro.build) site, plain CSS tokens, no backend, no analytics, no cookies.

Docs: [PRD](docs/PRD-logispack-uiux.md) · [Stack ADR](docs/implementation-stack.md) · [Design system](docs/design-system.md) · [Task plan](docs/executable-task-plan.md)

## Getting started

Requirements: Node 24 (see `.nvmrc`) and pnpm 11.

```sh
pnpm install
pnpm dev
```

| Script          | What it does                                                |
| --------------- | ----------------------------------------------------------- |
| `pnpm dev`      | Start the dev server                                        |
| `pnpm build`    | Build the static site into `dist/`                          |
| `pnpm preview`  | Serve `dist/` locally                                       |
| `pnpm check`    | Type-check with `astro check`                               |
| `pnpm lint`     | ESLint (astro + jsx-a11y)                                   |
| `pnpm format`   | Prettier                                                    |
| `pnpm test`     | Unit tests (Vitest)                                         |
| `pnpm test:e2e` | Build, then run Playwright e2e + axe a11y (320px + desktop) |

First e2e run: `pnpm exec playwright install chromium`. Playwright only serves `dist/` (`pnpm preview`); `pnpm test:e2e` rebuilds first so it never tests a stale build. CI builds once, then runs `pnpm exec playwright test`.

## Release (manual SFTP to HostingMX)

Per [ADR 0002](docs/implementation-stack.md#deployment):

1. `main` must be green in CI.
2. Run `pnpm build` locally (or download the CI `dist` artifact).
3. Upload the contents of `dist/` to the subdomain's document root via SFTP, replacing the previous release.
4. Every route is a folder with `index.html` (`build.format: 'directory'`), so no server rewrites are needed.
5. Keep the previous `dist/` copy locally for a manual rollback.
6. Verify HTTPS and the live pages at https://logispack.capitalhumano.com.mx.

Open items: confirm the HostingMX web server type (Apache vs LiteSpeed/Nginx), the document root, and the SSL certificate for the subdomain.
