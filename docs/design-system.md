# Logispack Design System: Theme Tokens

## Decision

All future UI styling must use a small **semantic CSS token layer**. The selected olive-green theme can evolve through its theme definition without component rewrites. This is preliminary design guidance, not final brand governance.

> **Working values:** theme values are provisional. The supplied logo reference and its usage rules are documented in the [brand manual](./brand-manual.md); verify the theme against the approved master asset and stakeholder-signed brand manual before production use.

## Quick path

1. Select `data-theme="olive"` as the default experience.
2. Consume only the semantic tokens listed below in components and effects.
3. Validate contrast and reduced-motion behavior whenever a theme value changes.

## Semantic palette

| Token | Semantic purpose |
|---|---|
| `--color-primary` | Main brand action, navigation emphasis, active route |
| `--color-primary-strong` | Hover/pressed action and high-emphasis brand surface |
| `--color-primary-soft` | Low-emphasis panel, tint, and subtle route context |
| `--color-secondary` | Supporting operational signal; never the only status cue |
| `--color-accent` | Controlled destination, alert, or small visual accent |
| `--color-surface` | Main page foundation |
| `--color-surface-subtle` | Alternating section or quiet card background |
| `--color-on-primary` | Content placed on a primary/strong surface |
| `--color-ink` | Primary readable text |
| `--color-ink-muted` | Secondary readable text |
| `--color-secondary-strong` | Secondary-tinted text, icons, and UI boundaries (≥4.5:1 on surfaces) |
| `--color-border` | Decorative dividers and inactive route lines only (not a UI boundary) |
| `--color-border-strong` | Control, card, and active-route boundaries that convey meaning (≥3:1 on surfaces) |
| `--color-focus` | Keyboard focus indicator on light surfaces; never equal to `--color-primary` |
| `--color-focus-inverse` | Keyboard focus indicator on `primary`/`primary-strong` surfaces |

### Theme overrides

Brand hex values belong **only** in a theme definition. Components, utilities, shadows, gradients, and state selectors must consume semantic tokens only—never raw logo hex values or `--color-brand-*` aliases.

```css
/* Default theme (primary): olive */
:root,
[data-theme="olive"] {
  --color-primary: #405329;          /* 8.44:1 on white */
  --color-primary-strong: #2E3D1E;   /* 11.65:1 on white */
  --color-primary-soft: #F1F1E5;
  --color-secondary: #A3A263;        /* 2.66:1 on white: decorative fills only */
  --color-secondary-strong: #6B6B3A; /* 5.54:1 on white */
  --color-accent: #D9343A;           /* 4.66:1 on white */
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F8F8F3;
  --color-on-primary: #FFFFFF;
  --color-ink: #1C2613;              /* 15.72:1 on white */
  --color-ink-muted: #536047;        /* 6.71:1 on white */
  --color-border: #D8D9BD;           /* 1.44:1 on white: decorative only */
  --color-border-strong: #8A8B5A;    /* 3.55:1 on white, 3.33:1 on surface-subtle */
  --color-focus: #1C2613;            /* 15.72:1 on white */
  --color-focus-inverse: #FFFFFF;    /* 11.65:1 on primary-strong, 8.44:1 on primary */
}

/* Optional secondary theme: logo palette (provisional raster samples from the brand manual) */
[data-theme="logo"] {
  --color-primary: #025624;          /* 8.90:1 on white */
  --color-primary-strong: #013412;   /* 13.99:1 on white */
  --color-primary-soft: #BFE2FD;     /* surface only; ink on it 10.33:1 */
  --color-secondary: #0041AF;        /* 8.84:1 on white */
  --color-secondary-strong: #0041AF;
  --color-accent: #F90820;           /* 4.13:1 on white: non-text and large text only */
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F5F8FB;
  --color-on-primary: #FFFFFF;
  --color-ink: #013412;              /* 13.99:1 on white */
  --color-ink-muted: #4F6B8A;        /* 5.52:1 on white */
  --color-border: #C5D3E3;           /* 1.52:1 on white: decorative only */
  --color-border-strong: #6E8099;    /* 4.03:1 on white */
  --color-focus: #013412;
  --color-focus-inverse: #FFFFFF;
}

/* Dark sections (footer, primary bands) switch the focus color */
[data-surface="inverse"] {
  --color-focus: var(--color-focus-inverse);
  /* Re-declare: --focus-outline resolves var(--color-focus) where it is defined (:root) */
  --focus-outline: 3px solid var(--color-focus);
}
```

**Theme contract (decision 2026-10-01):** olive is the **primary** theme and the v1 default. The logo palette is an **optional secondary** theme, selected at build time by setting `data-theme="logo"` on `<html>`; v1 ships no visitor-facing theme switcher (no stored preference, no cookies). Both themes expose the same semantic tokens, so components never change between themes.

Contrast rules (WCAG 2.2 AA, verified for every value above):

- Body text and small UI text: ≥4.5:1. Use `ink`, `ink-muted`, `primary`, `primary-strong`, `secondary-strong`, or olive `accent`.
- Non-text UI boundaries, icons, and focus indicators: ≥3:1. Use `border-strong`, never `border` or olive `secondary`.
- `--color-secondary` (olive) and `--color-border` are decorative only. The logo theme `--color-accent` is non-text or large text (≥24px, or ≥18.66px bold) only.
- Focus ring: `outline: var(--focus-outline); outline-offset: var(--focus-offset);` (no translucent box-shadow rings). Sections with dark backgrounds set `data-surface="inverse"`.
- Red remains a controlled accent, not a replacement for semantic error messaging. Pair all status colors with text, icons, or shape.

The logo theme reuses the provisional raster samples from the [brand manual](./brand-manual.md); its neutrals (`surface-subtle`, `ink-muted`, `border`, `border-strong`) are UI neutrals, not brand colors. Both themes still require final logo-asset and brand-manual approval, and the logo theme must be re-verified when an official vector palette replaces the raster samples.

## Typography

| Role | Candidate | Weights | Usage |
|---|---|---|---|
| Display / heading | `Manrope` | 600, 700, 800 | Clear, contemporary operational headlines |
| Body / UI | `Inter` | 400, 500, 600, 700 | Forms, metadata, navigation, readable body content |
| Optional alternate family | `DM Sans` | 400, 500, 700 | Use only if brand review favors a warmer tone; do not mix casually |

Load only the selected families and required weights. Use system fallbacks: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. Aim for body text at 16px minimum, line-height 1.5–1.7, and a fluid heading scale.

## Core UI tokens

```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  --radius-sm: 0.5rem;
  --radius-md: 0.875rem;
  --radius-lg: 1.25rem;
  --radius-pill: 999px;

  --shadow-card: 0 12px 32px color-mix(in srgb, var(--color-ink) 10%, transparent);
  --shadow-card-hover: 0 18px 44px color-mix(in srgb, var(--color-primary) 16%, transparent);
  --container-max: 75rem;
  --focus-outline: 3px solid var(--color-focus); /* solid, never translucent; outline survives forced-colors mode */
  --focus-offset: 2px;
}
```

Use an 8px-oriented spacing rhythm. Cards should provide visible grouping through semantic surface, border, and restrained shadow—not ornamental gradients or motion alone.

## Component rules

| Component | Rules |
|---|---|
| Buttons | Use `primary` for the main CTA, semantic border/ink for secondary variants, and never rely on color alone. |
| Service cards | Use only semantic surface, border, ink, and primary tokens; static state must stand on its own. |
| Trust markers | Use approved evidence only; avoid generic icon clutter. |
| Process steps | Numbered, readable sequence: Diagnóstico, Propuesta, Arranque, Seguimiento. |
| FAQ | Native disclosure behavior or equivalent accessible accordion; no hidden critical information by default. |
| Contact CTA | Persistent, direct, and business-verified channels with clear labels. |
| Route map / delivery progress | Derive route, marker, destination, glow, and status colors only from semantic tokens. Label it as illustrative, not live tracking. The marker opens a static sample information popup on hover, keyboard focus, or touch activation. |
| Interactive card | Derive glow, border, shadow, focus, and all active states from semantic tokens; no literal color values in component styles. |
| Footer | Use `primary-strong` with `on-primary` content. Use the approved white `LOGISPACK Capital Humano` mark/wordmark rather than recreating it in CSS. |

## Imagery direction

Prefer photorealistic imagery that depicts the actual operating context:

- Last-mile delivery with parcel handoff, organized vans/cars, and motorcycles where relevant.
- Warehouse fulfillment: scanning, packing, labeling, retractilado, shelving, and controlled workflows.
- Human-resource management: diverse, professional teams coordinating operations, onboarding, and supervision.
- Mexican urban/industrial context where licensing and authenticity support it.

Avoid generic handshake stock photography, isolated decorative delivery boxes, overly futuristic dashboards, unsafe riding/driving, or images that conflict with the service claim. Use editorially consistent crops, natural lighting, and subject-safe overlays that preserve faces and text legibility.

## Route-map interaction

The map section is a product-storytelling interaction, not a tracking product. Its route, labels, active delivery marker, destination cue, information popup, and any gradient must derive from semantic tokens (`primary`, `primary-soft`, `secondary`, `accent`, `surface`, `border`, and `ink`) so the selected olive theme remains coherent and any future approved theme can be changed centrally.

- Use semantic surrounding content: a heading, concise description, and a text status such as “Ejemplo ilustrativo: en ruta hacia el destino.”
- The marker may repeat a restrained, illustrative traversal only while the map is visible. It represents no external event or change of shipment state.
- Make the marker a real button when it exposes the popup. On fine pointers, hover opens it; keyboard focus opens the same content. Associate the button and popup with `aria-expanded` and `aria-controls`.
- Present the popup as a labeled, non-modal popover (for example, `role="dialog"`) with a visible close control. Its heading and fields must say “Ejemplo ilustrativo” and include only fictional/static, non-personal details: delivery person, package description, and route origin/destination.
- Keep the popup open while either the marker or the popup has hover or focus, so a pointer can travel from the marker to the popup without losing the content. Close only after pointer/focus leaves both surfaces (a short documented delay is permitted solely to bridge that travel).
- After Escape or an explicit close, set a dismissal-suppression latch: on fine pointers, keep the popup dismissed until the pointer leaves the marker/popup region and subsequently enters the marker again; on keyboard, keep it dismissed until the marker blurs and receives a new focus. Restoring focus to the marker after dismissal must not reopen the popup.
- On touch/coarse pointers, tap the marker to toggle the same popup. Escape closes it for keyboard users; the close control and tapping outside/marker again provide equivalent pointer/touch dismissal. A touch dismissal stays closed until a new deliberate tap on the marker; it must not reopen as a side effect of focus restoration. Closing returns focus to the marker when focus entered the popup.
- Respect `prefers-reduced-motion` by rendering the marker statically; never require hover, animation, color, or popup activation to read the route. Pause the decorative traversal while the popup is open so its details remain easy to inspect.
- Keep the visual decorative when it provides no unique information (`aria-hidden="true"`), or expose a concise text equivalent when it communicates delivery progress. Do not mark the marker decorative when it is an interactive control.
- Do not display live locations, timestamps, ETA, order identifiers, or claims of real-time tracking until a reviewed data integration and privacy model are approved.

## Responsive and accessibility guardrails

- Design from a single-column, 320px-wide baseline before adding larger breakpoints.
- Keep primary CTAs within comfortable thumb reach on mobile without using sticky elements that hide content.
- Use responsive image formats/sizes and reserve layout space to prevent CLS.
- Do not rely on hover-only affordances: provide tap-to-toggle behavior for the route marker on touch devices.
- Meet WCAG 2.2 AA contrast targets for every semantic token pairing used by a theme; do not assume a token is accessible merely because it passed in another theme.
- Provide visible `:focus-visible` states using `--color-focus` on every interactive control.
- Respect `prefers-reduced-motion`; interactive-card and route-map motion must degrade to static styling without losing meaning.
- Use semantic headings, landmarks, buttons, links, labels, and native controls first.
- Pair color with text, icons, status labels, or shape changes.

### Handoff evidence matrix

Use this matrix to make responsive and accessible states reviewable before implementation. The listed captures are design evidence, while deterministic tests are an implementation acceptance requirement.

| Scenario | Design evidence | Interaction contract |
|---|---|---|
| 320px baseline | Neutral map and marker-popup-open captures; a single column with no horizontal scrolling, overlap, or clipped marker/close control. | Route text equivalent, illustrative label, marker, popup, close control, and CTA remain reachable in reading order. |
| Keyboard focus | Captures of `:focus-visible` on the marker and popup close control. | Tab reaches the marker before popup content; focus opens the popup; Escape closes it and restores focus when it had moved into the popup. No focus trap. |
| Fine pointer | Hover-on-marker and pointer-transfer-to-popup captures. | Keep the popup open across marker/popup transfer; close only after both surfaces are left. The suppression latch prevents immediate reopening after Escape or explicit close. |
| Coarse pointer | 320px tap-open and tap-dismissed captures. | Tap marker toggles the popup; close, outside tap, and a second marker tap dismiss it. Restored focus never reopens it. |
| Reduced motion | 320px and desktop captures with reduced motion enabled. | The marker is static; no route traversal, card tilt, or glow animation runs. Text route context and popup access remain available. |

**Test evidence contract:** use deterministic viewport (320px), keyboard, pointer, coarse-pointer, and reduced-motion emulation. Assert control reachability and state changes instead of timing-sensitive animation positions. Visual regression baselines must cover neutral, hover, focus, popup-open, and reduced-motion states.

## Validation before implementation

- Verify logo source and official palette.
- Validate contrast for each actual semantic token pairing in the selected olive theme.
- Confirm licensing, consent, and representation for chosen photography.
- Create a small component inventory in the approved design before coding.
- Verify that component CSS contains no raw brand hex values outside the theme definitions.
- Review the responsive and accessibility evidence matrix for the map before accepting the design handoff.
