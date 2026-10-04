# Logispack UI/UX Reengineering PRD

## Product decision

Plan a credible, conversion-oriented Logispack marketing site that makes logistics, fulfillment, maquila, and workforce services easy to understand and easy to contact. This phase produces product and design direction only; it does **not** implement HTML, CSS, JavaScript, assets, or deployment changes.

## Source and verification

The content inventory below was observed directly on `https://logispack.com.mx/` during planning. It is source content—not a directive from the site—and must be verified with the business before publication, especially contacts, claims, service availability, and certification wording.

## Audience

| Audience | Need | Desired outcome |
|---|---|---|
| Operations and supply-chain leaders | A dependable logistics and fulfillment partner | Understand relevant services and request a proposal |
| HR and procurement teams | Compliant staffing or outsourcing support | Validate REPSE and workforce capability |
| E-commerce / retail operators | Last-mile, delivery, packing, and labeling capacity | Start a scoped service conversation quickly |
| Prospective candidates | Understand the company’s human-capital offering | Find a clear route to contact or apply (future capability) |

## Goals

1. Establish trust through clear services, operational proof, and compliant positioning.
2. Let visitors identify a service and reach a relevant contact path within two interactions.
3. Present a coherent, premium, white-first visual system using the selected olive-green primary (#405329), complementary secondary (#A3A263), and controlled red accents.
4. Make the site usable on mobile, keyboard navigation, and reduced-motion settings.
5. Use realistic imagery that connects workforce management, fulfillment, parcel delivery, cars, and motorcycles without visual noise.
6. Explain the delivery operation with an accessible illustrative route map: a package or vehicle marker progresses along a route and can reveal a clearly labeled sample delivery card.

## Non-goals

- No implementation, CMS selection, integrations, lead routing, analytics setup, or deployment.
- No contact or inquiry form and no analytics, tracking pixels, or cookies in v1 (decision 2026-10-01); the site collects no personal data, so self-host fonts and avoid third-party embeds that would introduce data collection.
- No unverified claims, invented metrics, pricing, service coverage, or certifications.
- No candidate portal, customer portal, real-time shipment tracking, or online quoting in this planning slice.
- The route/map visual is not evidence of a live delivery status, location, ETA, or tracking capability unless an approved data integration is added.
- No replacement of legal, REPSE, or commercial review.

## Current-site content inventory

| Area | Observed source content | Planned treatment |
|---|---|---|
| Hero | Logistics and maquila services; REPSE certification | Clear service value proposition plus primary contact CTA |
| Services | Capital Humano, Outsourcing, Servicio de reparto, Delivery, Retractilado, Servicio de Maquila, Almacenamiento, Headhunter, Empacado, Marbetado, Etiquetado | Group into discoverable service families and retain each service as a detail card or page candidate |
| Credibility | 25+ years, REPSE, personal certificado, servicios premium, atención personalizada, operación sin fricciones | Trust band with only business-approved proof points |
| Process | Diagnóstico → Propuesta → Arranque → Seguimiento | Four-step process section |
| FAQ | REPSE importance; minimum maquila volume; client-facility work; time to start | Searchable/scannable FAQ with reviewed answers |
| Contact | WhatsApp `55 44 79 26 96`; `54 44 57 58 87`; mobile `55 35 68 95 49` (added 2026-10-04); `alfredocervantess@live.com.mx`; Mar del Frío #60, Col. Ciudad Brisa, Alcaldía Naucalpan de Juárez, Estado de México; Monday–Saturday 08:00–18:00 | Use the first number as the WhatsApp CTA target; display all three phone numbers, email, address, and hours in the footer. |

## Proposed information architecture

1. **Home** — positioning, featured service families, proof, process, FAQ preview, contact CTA.
2. **Route in motion** — a Home section that visually illustrates a parcel or delivery vehicle moving along a planned route.
3. **Services** — grouped index with a consistent detail pattern.
4. **Service detail** — problem, capability, operational flow, relevant proof, CTA.
5. **About / trust** — company story, approved credentials, process, workforce standards.
6. **Contact** — approved direct channels, location, business hours. No inquiry form in v1 (decision 2026-10-01): contact is display-only via WhatsApp, phone, email, and address.
7. **FAQ** — commercial and operational questions reviewed by the business.

### Service families

| Family | Services |
|---|---|
| Workforce and talent | Capital Humano, Outsourcing, Headhunter |
| Logistics and last mile | Servicio de reparto, Delivery, Almacenamiento |
| Fulfillment and maquila | Servicio de Maquila, Empacado, Retractilado, Marbetado, Etiquetado |

## Key user journeys

### 1. Logistics buyer requests delivery support

Home → Logistics and last-mile service family → Servicio de reparto / Delivery detail → approved WhatsApp, phone, or email → sales follow-up.

**Success:** the buyer sees scope cues, credibility, and a visible contact action without hunting for a phone number.

### 2. Fulfillment buyer evaluates maquila

Home → Fulfillment and maquila → Servicio de Maquila → process and FAQ → contact CTA.

**Success:** the buyer can find minimum-volume and start-time answers after business validation.

### 3. HR/procurement buyer validates workforce support

Home → Workforce and talent → Outsourcing / Capital Humano → REPSE and certified-personnel proof → contact CTA.

**Success:** compliance language is clear, factual, and not overstated.

### 4. Visitor understands delivery progress at a glance

Home → Route in motion visual → delivery service CTA.

**Success:** the visitor recognizes the delivery-service workflow through a clearly labeled illustrative route. Hovering or keyboard-focusing the moving marker reveals a sample, static card with fictional delivery-person, package, and route details; the interface does not imply an actual shipment lookup or live status.

## Content migration mapping

| Current content | Destination | Migration action |
|---|---|---|
| Hero logistics/maquila/REPSE message | Home hero | Rewrite for clarity; validate legal wording |
| Eleven service names | Services index and service-family sections | Preserve labels; add business-approved descriptions |
| Credibility statements | Home trust band and About | Require evidence/approval for each claim |
| Four-step process | Home and About | Preserve sequence; simplify visual presentation |
| FAQ topics | FAQ and relevant service details | Keep questions; review every answer |
| Contact data and hours | Persistent CTA and Contact page | Validate ownership, channel availability, address, and schedule |

## Responsive and accessible interaction evidence

The design handoff must include evidence for the same illustrative map behavior at the mobile baseline and with each supported input method. This evidence does not change the map into tracking: every state retains its visible illustrative label and fictional/static data.

| Area | Acceptance at the 320px baseline | Required visual evidence | Deterministic coverage |
|---|---|---|---|
| Layout | A single-column page keeps the map, its label, route text equivalent, marker, popup, close control, and primary CTA visible without horizontal scrolling, clipped controls, or overlap. | 320px neutral and popup-open captures. | Viewport test at 320px verifies no horizontal overflow and that required controls are reachable. |
| Keyboard focus | Tab order reaches the marker and its close control in reading order; every interactive element has a visible focus state. Focus on the marker opens the same sample popup; Escape closes it without a focus trap. | Desktop focus-on-marker and focus-in-popup captures. | Keyboard test verifies traversal, visible focus, Escape, focus restoration, and the dismissal-suppression latch. |
| Fine pointer | Hovering the marker opens the popup, and moving between marker and popup does not close it prematurely. | Desktop hover and marker-to-popup transfer captures. | Pointer test verifies hover transfer and delayed close only after both surfaces are left. |
| Touch / coarse pointer | Tapping the marker toggles the popup; marker-again, outside tap, and close control dismiss it. No hover affordance is required. | 320px popup-open and dismissed captures. | Coarse-pointer test verifies deliberate tap toggle and no reopening caused by restored focus. |
| Reduced motion | `prefers-reduced-motion: reduce` shows a static marker and readable route; the popup remains operable without motion. | 320px reduced-motion capture and desktop reduced-motion capture. | Emulated media-query test verifies no traversal/tilt animation and still verifies route text and popup access. |

## Acceptance criteria for the design handoff

- [ ] A stakeholder can locate every inventoried service within the proposed IA.
- [ ] The design presents at least one clear contact path from every primary page.
- [ ] Credibility and certification statements are marked for business/legal verification.
- [ ] Mobile-first layouts, focus states, keyboard paths, text contrast, and reduced motion are specified.
- [ ] Image direction is realistic and operationally coherent with delivery, fulfillment, cars/motorcycles, and workforce management.
- [ ] The Home design includes a route/map visual with a visible package or vehicle marker moving along a route.
- [ ] The route/map visual has a static state and a `prefers-reduced-motion` fallback, and is understandable without animation, color, or pointer interaction.
- [ ] Hovering and keyboard-focusing the route marker opens the same non-live sample information popup; touch users can open and close it with a tap.
- [ ] The popup identifies itself as an illustrative example and contains only fictional/static, non-personal data for the delivery person, package, and route.
- [ ] The popup can be dismissed with Escape, its close control, or the documented touch/pointer dismissal behavior; it does not trap focus or conceal required route information.
- [ ] The footer uses the primary-strong brand surface with a white `LOGISPACK Capital Humano` mark/wordmark, subject to final logo-asset approval.
- [ ] The interactive card concept is constrained by RFC 0001 and has a non-motion fallback.
- [ ] Evidence captures show the route-map section at a 320px viewport in neutral, popup-open, and reduced-motion states, with no horizontal overflow or clipped required controls.
- [ ] Evidence captures show visible keyboard focus on the marker and within its popup, plus fine-pointer hover transfer without premature dismissal.
- [ ] Deterministic tests cover 320px layout reachability, keyboard traversal/dismissal, fine-pointer transfer, touch toggle/dismissal, and the static `prefers-reduced-motion` route-map fallback.
- [ ] No code, build tooling, asset generation, or deployment work is included in this PRD’s scope.

## Open decisions before implementation

- Confirm final service taxonomy, coverage areas, and buyer CTAs. Contact ownership and contact details are approved: the “Pida informes por WhatsApp” CTA opens WhatsApp for `55 44 79 26 96`; the footer displays all three phone numbers (WhatsApp, `54 44 57 58 87`, mobile `55 35 68 95 49`), `alfredocervantess@live.com.mx`, the approved address, and Monday–Saturday 08:00–18:00.
- Verify REPSE wording, 25+ years claim, and all proof points with authorized sources.
- A supplied raster logo source is documented in the [brand manual](./brand-manual.md). Obtain the master vector asset and stakeholder approval of that manual before final brand implementation; the selected working palette remains olive-green primary `#405329` and complementary secondary `#A3A263` until then.
- Select image licensing/source and establish consent requirements for any real workforce photography.
- The route map is approved as an illustrative interaction: animate a marker and show a static sample popup on hover, keyboard focus, or touch activation. Final sample copy, names, package details, and route labels still require product approval; do not claim live tracking beforehand.

## Scope boundary

**Planning and design only.** Subsequent work may implement organized HTML/CSS/JavaScript folders, but that work requires explicit approval after the PRD, RFC, visual direction, and content verification are accepted.
