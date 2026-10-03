# Logispack Design System: Tokens and Interaction Rules

## Decision

The visual source of truth is the owner's **Claude Design system** ([published artifact](https://claude.ai/artifact/Aq55y8szmbiW8fZew3QjmM); `README.md` and `tokens.json`). This repository implements it in `src/styles/tokens.css`, whose names and values mirror `tokens.json`. Components consume tokens only; hex literals are allowed in `tokens.css` alone (enforced by `tests/unit/tokens.test.ts`).

Decisions (owner, 2026-10-01/02):

- **The design system governs visuals; the PRD governs content.** Copy uses the *usted* register. The design system README's *tú* rule and its tracking sample copy are overridden: the site has no tracking features (no tracking numbers, "Ver mi envío", `DeliveryDetail`, or `BottomNav`).
- **Single light theme.** The former `olive` and `logo` themes and the `data-theme` attribute are removed. Logo colors exist as brand-moment tokens only; they are not a selectable theme.
- **Vector SVG logos** in `src/assets/brand/` are the master logos (see the [brand manual](./brand-manual.md)).

## Quick path

1. Consume only the tokens in `src/styles/tokens.css`; never add raw hex values to components.
2. Validate contrast and reduced-motion behavior whenever a token value changes.
3. For dark bands, set `data-surface="inverse"` (swaps the inner focus ring).

## Color tokens

| Group | Tokens | Purpose |
|---|---|---|
| Surfaces and ink | `--surface` `#fcfcfc`, `--surface-raised` `#ffffff`, `--surface-sunken` `#ecf0ec`, `--ink` `#182414`, `--ink-muted` `#6c7078` | Page, cards, quiet sections, text |
| Border | `--border` `#e8ece4` | Decorative hairline only, never the sole affordance |
| Olive scale | `--olive-100` `#ecf0e4`, `--olive-200` `#d0d0b4`, `--olive-300` `#b8b88c`, `--olive-500` `#888438`, `--olive-700` `#5c6434`, `--olive-900` `#485028`, `--on-olive` `#ffffff` | Primary UI scale (buttons, controls, footer band) |
| Forest | `--forest-800` `#145428`, `--forest-900` `#144018` | Focus inner ring, map route and marker |
| Logo palette | `--logo-green` `#005020`, `--logo-leaf` `#008848`, `--logo-red` `#f80820`, `--logo-blue` `#0040a8`, `--logo-sky` `#0054b4`, `--logo-sky-mid` `#0078d0`, `--logo-sky-light` `#a0d4fc` | Brand moments only |
| Illustrative map | `--map-land` `#f0f4f4`, `--map-park` `#d8ecd4`, `--map-water` `#c0e0fc`, `--map-street` `#ffffff`, `--pin-origin` `#109834`, `--pin-destination` (= `--logo-red`) | Route-map SVG fills |
| Focus and halo | `--focus-ring` `#fcd40c`, `--focus-inner` (= `--forest-800`), `--halo-tap` `#e4d4688c`, `--halo-hover` `#ccc07059` | Keyboard focus and marker halos |

Other tokens: spacing `--space-1`…`--space-12` (4, 8, 12, 16, 20, 24, 32, 48 px), radius `--radius-sm` 6px, `--radius-md` 10px, `--radius-lg` 16px, `--radius-pill`; shadows `--shadow-card`, `--shadow-pop`, `--shadow-button`; sizes `--tap-min` 44px, `--icon-disc` 40px, `--icon-disc-l` 56px, `--marker` 44px; layout `--container-max` 75rem (not part of `tokens.json`).

### Accessibility adjustments to the design system

The design system README is followed except where it fails WCAG 2.2 AA. These corrections are documented in `tokens.css`:

- `--olive-300` (2.0:1 on surface) is **never a control border**. Outline (secondary) buttons and other controls use `--olive-700` (6.2:1).
- `--olive-500` (3.8:1) is text only at 24px and above (the hero display accent line).
- `--logo-red` (4.1:1) is **never text** below 24px: icons, discs, and pins only.
- `--ink-muted` is 4.8:1 on `--surface` and `--surface-raised` but 4.3:1 on `--surface-sunken`; use `--ink` for body text on sunken surfaces.
- Keyboard focus is a 2px `outline` using `--focus-inner` plus a 3px `box-shadow` ring using `--focus-ring` (yellow). The inner ring is an outline so it survives forced-colors mode. On `[data-surface="inverse"]` (footer, contact band on `--olive-900`) `--focus-inner` becomes `--on-olive`; the yellow ring stays high contrast.
- Pair every status color with text, icons, or shape.

## Typography

| Role | Family | Token | Delivery |
|---|---|---|---|
| Display / heading | Lexend | `--font-display` | Self-hosted via `@fontsource/lexend` |
| Body / UI | Source Sans 3 | `--font-sans` | Self-hosted via `@fontsource/source-sans-3` |

Fallback stack: `"Segoe UI", system-ui, sans-serif`. No Google Fonts or other third-party requests. **Every above-the-fold weight must be preloaded** in `BaseLayout.astro`: a missed preload caused a font-swap layout shift of 0.154 CLS (budget: 0.1). Body text is 16px minimum.

## Iconography

Icons come from Phosphor (`@phosphor-icons/core`), inlined as SVG at build time (no runtime icon font or request). Icons inside `--icon-disc` / `--icon-disc-l` discs are decorative (`aria-hidden`) and paired with text.

## Component rules

| Component | Rules |
|---|---|
| Buttons | Primary uses the olive scale; secondary (outline) uses `--olive-700` border; never rely on color alone. |
| Header | The header CTA is hidden below 64rem; DOM order equals visual order. |
| Service cards | Surface, ink, and olive tokens only; static state must stand on its own. |
| Trust markers | Approved evidence only; avoid generic icon clutter. |
| Process steps | Numbered sequence: Diagnóstico, Propuesta, Arranque, Seguimiento. |
| FAQ | Native `<details>` disclosure; no hidden critical information by default. |
| Contact CTA | Persistent, direct, business-verified channels with clear labels. |
| Route map | See below. Labeled as illustrative, not live tracking. |
| Interactive card | Proposed only (RFC 0001); not implemented. |
| Footer | `--olive-900` with `data-surface="inverse"` and the white vector logo (`logispack-logo-white.svg`). |

## Imagery direction

Photography is owner-authored (AI-generated) and ships as high-resolution JPGs with responsive widths: hero 600/1200, cards 700/1400. Layout space is reserved to prevent CLS.

- Last-mile delivery with parcel handoff and motorcycles where relevant.
- Warehouse fulfillment: scanning, packing, labeling, retractilado, shelving.
- Human-resource management: professional teams coordinating operations.

Avoid generic handshake stock photography, isolated decorative boxes, futuristic dashboards, unsafe riding or driving, and images that conflict with the service claim.

## Route-map interaction

Implemented (RFC 0001, PR #8). The map is a product-storytelling interaction, not a tracking product. It is an inline SVG (Home only) driven by a vanilla TypeScript island of about 1.4 KB gzip (`src/scripts/route-map.ts`, state logic in `src/lib/route-map-state.ts`, styles in `src/styles/route-map.css`). Its fills use the map tokens (`--map-land`, `--map-park`, `--map-water`, `--map-street`, `--pin-origin`, `--pin-destination`); the route and marker use `--forest-900` and `--forest-800`; the popup uses `--surface-raised`, `--border`, `--shadow-pop`, and `--ink`.

- Semantic surrounding content: heading "Ruta ilustrativa", a concise description, and a link "Conozca el Servicio de reparto". Both strings were approved by the owner as extra copy (`src/lib/route-map-copy.ts`).
- A **static sample card is always visible** and is the no-JavaScript source of truth; the island only adds the popup behavior on top of it.
- The marker may repeat a restrained, illustrative traversal only while the map is visible. It represents no external event or change of shipment state.
- The marker is a real button (`--marker` 44px, min target `--tap-min`) with `aria-expanded` and `aria-controls`. Hover (fine pointers) and keyboard focus open the popup.
- The popup is a labeled, non-modal popover with a visible close control. Heading and fields say "Ejemplo ilustrativo" and include only fictional, non-personal details: delivery person, package, and route.
- **Placement:** on wide stages (`min-width: 64rem` in `route-map.css`) the popup is positioned beside the marker; on narrow widths it renders **in flow below the map**, so it never overlaps the marker or clips.
- **Hover bridge:** the popup stays open while either marker or popup has hover or focus; a 150 ms close delay (`CLOSE_DELAY_MS`) bridges pointer travel between them.
- After Escape or an explicit close, a dismissal-suppression latch applies: on fine pointers the popup stays dismissed until the pointer leaves the marker/popup region and re-enters the marker; on keyboard, until the marker blurs and receives new focus. Focus restored to the marker never reopens the popup.
- On touch/coarse pointers, tapping the marker toggles the popup; Escape, the close control, tapping outside, and a second marker tap dismiss it. Closing returns focus to the marker when focus entered the popup.
- `prefers-reduced-motion` renders the marker statically (animation is declared only under `prefers-reduced-motion: no-preference`). The traversal pauses while the popup is open.
- Do not display live locations, timestamps, ETA, order identifiers, or claims of real-time tracking.

## Responsive and accessibility guardrails

- Design from a single-column, 320px-wide baseline before adding larger breakpoints.
- Keep primary CTAs within thumb reach on mobile without sticky elements that hide content.
- Use responsive images and reserve layout space to prevent CLS.
- Do not rely on hover-only affordances: provide tap-to-toggle for the route marker.
- Meet WCAG 2.2 AA contrast for every token pairing used.
- Provide visible `:focus-visible` states (2px outline plus yellow ring) on every interactive control.
- Respect `prefers-reduced-motion`; route-map motion degrades to static styling without losing meaning.
- Use semantic headings, landmarks, buttons, links, labels, and native controls first.

### Handoff evidence matrix

| Scenario | Evidence | Interaction contract |
|---|---|---|
| 320px baseline | Neutral map and marker-popup-open captures; single column, no horizontal scroll, overlap, or clipping. | Route text, illustrative label, marker, popup, close control, and CTA remain reachable in reading order. |
| Keyboard focus | `:focus-visible` on the marker and close control. | Tab reaches the marker before popup content; focus opens the popup; Escape closes it and restores focus when it had moved into the popup. No focus trap. |
| Fine pointer | Hover-on-marker and pointer-transfer-to-popup captures. | Popup stays open across transfer; closes after both surfaces are left; the latch prevents immediate reopening. |
| Coarse pointer | 320px tap-open and tap-dismissed captures. | Tap toggles; close, outside tap, and second tap dismiss. Restored focus never reopens it. |
| Reduced motion | 320px and desktop captures with reduced motion. | Marker is static; text route context and popup access remain available. |

**Test evidence contract:** use deterministic viewport (320px), keyboard, pointer, coarse-pointer, and reduced-motion emulation. Assert reachability and state changes, not animation timing. Visual baselines cover neutral, hover, focus, popup-open, and reduced-motion states.

## Validation

- Contrast for each actual token pairing, including the adjustments above.
- Component CSS contains no raw hex values outside `tokens.css` (unit test).
- Photography is owner-authored; no third-party license is required.
