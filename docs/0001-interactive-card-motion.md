# RFC 0001: Interactive Floating-Glow Card

- **Status:** Partially accepted — the illustrative route-map interaction is accepted; the floating-glow card decision remains proposed.
- **Decision:** Build the card with native CSS and small native JavaScript; do not add a third-party animation or tilt dependency.

## Summary

The homepage may use a single reusable card with subtle pointer-responsive tilt and a floating glow to create visual depth around a service, proof point, or CTA. The effect must feel premium, never obstruct content, remain optional for users who prefer less motion, and inherit its visual expression from semantic CSS theme tokens.

## Context

The requested UI direction is creative but performant: a clean Logispack experience with the selected olive-green theme (`#405329` primary and `#A3A263` complementary secondary), realistic logistics imagery, and an interactive card. Final logo-asset and brand-manual approval remains required. The card is decorative enhancement, not a required interaction or navigation mechanism.

## Options considered

| Option | Advantages | Costs / risks | Decision |
|---|---|---|---|
| Native CSS + JavaScript | No dependency; exact behavior; small payload; works with theme tokens | Requires disciplined implementation and test coverage | **Chosen** |
| Tilt/animation plugin | Fast initial setup; packaged effects | Extra JS, version/security upkeep, less control, possible mobile/accessibility mismatch | Rejected |
| CSS-only hover effect | Minimal script | Cannot accurately derive pointer position for glow/tilt | Useful as fallback only |

## Decision and rationale

Use native pointer tracking, `requestAnimationFrame`, CSS custom properties, and the semantic tokens defined in `docs/design-system.md`. JavaScript samples pointer coordinates and schedules at most one visual update per animation frame. CSS consumes `--pointer-x`, `--pointer-y`, `--rotate-x`, and `--rotate-y` to position a radial glow and apply a restrained transform.

Visual styles must use semantic tokens such as `--color-primary`, `--color-primary-soft`, `--color-surface`, `--color-border`, `--color-ink`, and `--color-focus`. Component CSS must not contain raw brand hex values or depend on a specific theme value. Only theme definitions may map brand values to semantic tokens.

This preserves a minimal dependency surface, makes theme switching and reduced-motion behavior explicit, and avoids paying a plugin cost for one focused effect.

## Proposed API and behavior

### Markup contract

- Apply a semantic `data-interactive-card` attribute to an existing card/container.
- Keep links and buttons inside the card independently operable.
- Treat the glow as decorative (`aria-hidden="true"` if a separate element is used).
- Apply the active theme at an application/root boundary; individual cards do not select brand values.

### Runtime behavior

1. On fine-pointer hover, calculate normalized pointer position inside the card.
2. Schedule one update with `requestAnimationFrame`; do not mutate styles directly for every pointer event.
3. Update CSS variables for glow origin and a limited tilt (target maximum: 4 degrees per axis).
4. On pointer leave, animate or reset variables to neutral without changing document flow.
5. Do not attach the enhanced effect for coarse pointers, touch-first devices, or `prefers-reduced-motion: reduce`.

### CSS behavior

- Use `transform: perspective(...) rotateX(...) rotateY(...)` only on the card’s visual surface.
- Use a pseudo-element or decorative child for a low-opacity radial-gradient glow whose colors derive only from semantic theme tokens.
- Derive border, shadow, focus, background, and active state colors from semantic tokens; do not embed raw color literals in component styles.
- Preserve readable contrast and avoid text/image filters that reduce legibility.
- Keep a static border/shadow state that communicates hierarchy without motion.

## Route-map interaction (accepted)

The illustrative delivery map follows the same token contract. Route lines, moving marker, destination cue, labels, information popup, and any glow must derive from semantic tokens rather than raw brand colors. Theme changes must preserve meaningful route contrast against the surface and a static, readable reduced-motion state.

### Interaction contract

1. The route marker may make a restrained, repeating illustrative traversal while the map is visible. It is never connected to a shipment, person, location, ETA, timestamp, or external delivery event.
2. The marker is a native button when it reveals information. Fine-pointer hover and keyboard focus open the same non-modal popup; keyboard activation may also toggle it.
3. The popup is a labeled non-modal dialog/popover with `aria-expanded` and `aria-controls` on the marker, a visible close control, and a concise heading: “Ejemplo ilustrativo”. It contains fictional/static, non-personal delivery-person, package, and route details only.
4. Keep the popup open while either marker or popup has hover or focus, allowing the pointer to travel between them. Close only after both lose pointer/focus presence; a short, documented delay is permitted only to bridge that travel.
5. After Escape or an explicit close, set a dismissal-suppression latch. For fine pointers, do not reopen until the pointer leaves the marker/popup region and subsequently re-enters the marker. For keyboard, do not reopen until the marker blurs and receives a new focus; focus restored to the marker by dismissal must not reopen it.
6. On touch or coarse-pointer devices, tapping the marker toggles the popup. Escape, the close control, tapping the marker again, and tapping outside provide dismissal. A touch dismissal remains closed until a new deliberate tap on the marker, never as a focus-restoration side effect. If focus moved into the popup, dismissal restores it to the marker.
7. With `prefers-reduced-motion: reduce`, the marker remains static. The route, its text equivalent, and the sample popup remain available without motion, hover, or color alone. Pause the traversal while the popup is open.

### Content boundary

The map and popup must visibly state that they are illustrative. They must not show a real person’s name, contact data, shipment/order identifier, live location, ETA, timestamp, or a claim of real-time tracking. Final fictional sample copy and route labels require product approval before release.

## Performance constraints

- One `pointermove` listener per enhanced card, preferably delegated or initialized only for visible cards if multiple cards are introduced.
- At most one queued animation frame per card.
- Read bounding geometry only as needed; avoid layout reads after style writes in the same frame.
- Animate only compositor-friendly properties (`transform`, `opacity`) where possible.
- No continuous idle animation outside the illustrative route marker while its section is visible, scroll listener, canvas, WebGL, or external library. The route traversal pauses when the popup is open and stops when motion reduction is requested.
- The baseline page remains fully functional if JavaScript fails or is disabled.

## Accessibility and input behavior

| Requirement | Approach |
|---|---|
| Theme contrast | Validate WCAG 2.2 AA contrast for every semantic token pairing used in each theme, including active glow/card states |
| Reduced motion | Disable tilt/glow motion through media query and JS guard; show the static card |
| Touch / coarse pointer | Skip pointer tracking and expose the same content/action |
| Keyboard | Do not trap focus or require hover; focusable descendants retain visible focus indicators from `--color-focus` |
| Screen readers | Decorative effects are omitted from the accessibility tree; semantic card content remains unchanged |
| Motion sensitivity | Avoid parallax, indefinite floating, and large rotations |
| Route marker popup | Open on hover and keyboard focus; offer tap-to-toggle on touch; expose a labeled non-modal popup with explicit dismissal and fictional/static sample data |

### Responsive evidence and acceptance matrix

| Scenario | Required visual evidence | Deterministic acceptance |
|---|---|---|
| Mobile baseline | 320px screenshots of neutral, popup-open, and popup-dismissed map states. | No horizontal overflow; marker, illustrative label, route text equivalent, popup, close control, and CTA are reachable without overlap or clipping. |
| Keyboard | Screenshots of visible marker focus and popup-close focus. | Tab traversal follows reading order; marker focus opens the popup; Escape closes it; focus restores to the marker only when it entered the popup; the suppression latch blocks immediate reopen. |
| Fine pointer | Screenshots of marker hover and pointer transfer from marker to popup. | Popup remains open during transfer and closes only after both marker and popup lose pointer/focus presence. |
| Touch/coarse pointer | 320px screenshots of deliberate tap-open and dismissed states. | Marker tap toggles; outside tap, close, and second marker tap dismiss; focus restoration does not reopen the popup. |
| Reduced motion | 320px and desktop screenshots with `prefers-reduced-motion: reduce`. | The route marker is static; no card tilt/glow or route traversal is scheduled; route text and popup remain available. |

Use fixed viewport and media-query emulation in automated tests. Assert semantic state, focus target, and reachability rather than an animation frame or elapsed delay; this keeps coverage deterministic.

## Testing plan

- Unit-test pointer normalization and clamping (corners, center, pointer leave).
- Test `requestAnimationFrame` coalescing so event bursts schedule one update per frame.
- Test guards for reduced motion and coarse pointer input.
- Verify the selected olive theme renders the same card/map components without raw component color values and meets contrast requirements for every token pairing used.
- Add deterministic automated integration coverage at a 320px viewport for marker-to-popup hover transfer; keyboard traversal/focus transfer; Escape and explicit-close dismissal including focus restoration and suppression-latch behavior; touch toggle/dismissal; no-overflow/reachability; and the reduced-motion static state.
- Manually verify route-marker hover, keyboard-focus, Escape, focus restoration, touch toggle/dismissal, reduced-motion, no-JS fallback, and the required 320px evidence captures.
- Run an accessibility audit and visual regression check for 320px neutral/popup-open/reduced-motion plus desktop neutral, hover, focus, popup-open, and reduced-motion states in each approved theme.
- Profile a representative page to confirm no long task or scroll jank is introduced.

## Consequences

- The implementation has a small, owned utility rather than a dependency.
- Future cards and route-map effects reuse the same theme-token and behavior contracts rather than adding independent animation libraries.
- The design remains attractive in its static state; motion is enhancement only.
- Theme changes are centralized in token overrides instead of requiring component rewrites.

## Non-goals

- Building a physics engine, 3D scene, cursor follower, or ambient animation system.
- Requiring pointer input to reveal content or complete a task.
- Applying the effect automatically to every card on the site.
- Implementing production HTML, CSS, or JavaScript before the approved design phase.

## Rollback

Remove the `data-interactive-card` attribute or initialization script. The static token-driven CSS card remains usable and visually complete.
