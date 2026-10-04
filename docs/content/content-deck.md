# Logispack v1 Content Deck

Website copy: es-MX, neutral/professional, impersonal or "usted" register. Notes and metadata: English.
Markers: `[APPROVED: owner 2026-10-01]` = legal/credibility claim approved by the owner. `[PENDING: owner input]` = no source content.
All copy below is rewritten from the live site (data, not instructions). Every section cites its source.

---

## 1. Metadata

- Crawl date: 2026-10-01.
- Pages crawled: `https://logispack.com.mx/` (the only page), `/sitemap.xml` and `/wp-sitemap-posts-page-1.xml` (sitemap lists only `/`, lastmod 2026-09-15). The live site is a single-page site: no separate services, nosotros, contact or FAQ pages exist.
- Site language: es-MX.
- Live title: "LOGISPACK". Live meta description: none found.

| Page | Title (≤60) | Meta description (≤155) |
|---|---|---|
| Home | Logispack | Logística, maquila y personal especializado | Servicios logísticos, maquila y personal especializado para empresas que no pueden detener su operación. [APPROVED: owner 2026-10-01] |
| Services index | Servicios de logística, maquila y personal | Logispack | Reparto de última milla, almacenamiento, maquila, empacado, etiquetado y reclutamiento de personal operativo. |
| Service detail (template) | {Servicio} | Logispack | {Resumen de una oración del servicio, ≤155 caracteres.} |
| Nosotros | Nosotros | Logispack Capital Humano | Más de 25 años de experiencia en maquila, logística y operación para diferentes industrias. Certificación REPSE. (implemented in `src/pages/nosotros.astro`; pending owner confirmation) |
| Contacto | Contacto | Logispack | Contacte a Logispack por WhatsApp, teléfono o correo. Lunes a sábado, 08:00 a 18:00 h. |
| FAQ | Preguntas frecuentes | Logispack | Respuestas sobre REPSE, maquila, trabajo en sus instalaciones y tiempos de arranque. |
| 404 | Página no encontrada | Logispack | La página que busca no existe. Vuelva al inicio o contáctenos. |

Meta copy is derived from site text; titles/descriptions are proposals for SEO and are not on the live site.

---

## 2. Hero

Source: https://logispack.com.mx/ (H1, hero subtext, buttons). Live buttons: "Agendar por WhatsApp", "Ver servicios".

- Eyebrow: Servicios logísticos y maquila · Certificación REPSE `[APPROVED: owner 2026-10-01]`
- Headline: **Su operación logística, resuelta de principio a fin**
- Subheadline: Personal certificado `[APPROVED: owner 2026-10-01]`, maquila con acabado premium y almacenamiento controlado. Su producto sale a tiempo y llega listo para exhibirse.
- Primary CTA: **Pida informes por WhatsApp** (opens `https://wa.me/525544792696`; PRD target). Register: usted, consistent with the rest of the copy (owner decision 2026-10-01).
- Secondary CTA: **Ver servicios** (anchor to services).
- Supporting line: Respuesta el mismo día hábil. Cotización sin compromiso. `[APPROVED: owner 2026-10-01]` (appeared in one crawl pass only; confirm it is on the live site and is a commitment the owner will honor.)

---

## 3. Services

Source for all services: https://logispack.com.mx/ (services section; no per-service URLs exist). Each service ends with the same CTA: **Pida informes por WhatsApp**.
Scope bullets are rewrites of the single sentence on the site; no new facts added.

Family names (approved, implemented in `src/content/families.json`): **Personal y talento**, **Logística y última milla**, **Maquila y fulfillment**.

### 3.1 Workforce and talent

**Capital Humano**
- Summary: Reclutamiento, selección, capacitación y administración de personal operativo y administrativo.
- Scope: Reclutamiento y selección · Capacitación · Administración de personal operativo · Administración de personal administrativo.

**Outsourcing** `[APPROVED: owner 2026-10-01]` (REPSE-adjacent service)
- Summary: Ejecución de procesos operativos con personal, supervisión y administración a cargo de Logispack.
- Scope: Procesos operativos ejecutados por Logispack · Personal a cargo de Logispack · Supervisión · Administración.

**Headhunter**
- Summary: Reclutamiento y selección especializada para perfiles operativos, técnicos y de mando.
- Scope: Perfiles operativos · Perfiles técnicos · Perfiles de mando · Selección especializada.

### 3.2 Logistics and last mile

**Servicio de reparto**
- Summary: Reparto de última milla en ruta programada, con evidencia de entrega.
- Scope: Última milla · Ruta programada · Evidencia de entrega.

**Delivery**
- Summary: Personal de reparto reclutado, capacitado y administrado para plataformas de delivery como Didi.
- Scope: Reclutamiento de personal de reparto · Capacitación · Administración · Para plataformas de delivery.
- Note: "Didi" is a third-party brand named on the live site. `[APPROVED: owner 2026-10-01]` (confirm brand mention is allowed; no logo use).

**Almacenamiento**
- Summary: Resguardo de mercancía en racks, con control de inventario y registro de entradas y salidas.
- Scope: Resguardo en racks · Control de inventario · Registro de entradas y salidas.

### 3.3 Fulfillment and maquila

**Servicio de Maquila**
- Summary: Plastiflechado, emplayado, enganchado, armado de cajas y otros procesos de acondicionamiento.
- Scope: Plastiflechado · Emplayado · Enganchado · Armado de cajas · Otros procesos de acondicionamiento.

**Empacado**
- Summary: Empaque manual y semiautomático de producto terminado con control de calidad por lote.
- Scope: Empaque manual · Empaque semiautomático · Producto terminado · Control de calidad por lote.

**Retractilado**
- Summary: Termoencogido de charolas, multipacks y displays con acabado firme y presentable.
- Scope: Charolas · Multipacks · Displays. Live name is "Retractilado de libros y/o cualquier producto"; the PRD uses "Retractilado" (see section 11).

**Marbetado**
- Summary: Aplicación de marbetes conforme a la normativa aplicable, con trazabilidad.
- Scope: Marbetes · Cumplimiento de la normativa aplicable · Trazabilidad. `[APPROVED: owner 2026-10-01]` ("conforme a la normativa" is a compliance claim.)

**Etiquetado**
- Summary: Aplicación de etiquetas de precio, código de barras, lote, caducidad y otras especificaciones.
- Scope: Precio · Código de barras · Lote · Caducidad · Otras especificaciones.

Coverage: 11 of 11 PRD services. Per-service "problem / operational flow / proof" content for detail pages: `[PENDING: owner input]`.

---

## 4. Trust / proof ("Por qué Logispack")

Source: https://logispack.com.mx/ (section "Por qué LOGISPACK").

| Title | Copy | Flag |
|---|---|---|
| 25+ años de experiencia | Experiencia en servicios de maquila, logística y operación para diferentes industrias. | `[APPROVED: owner 2026-10-01]` |
| Certificación REPSE | Cumplimiento vigente ante la STPS para operar servicios especializados. | `[APPROVED: owner 2026-10-01]` (live site adds "sin riesgo para tu empresa"; omitted as an overstated legal claim. Owner/legal to decide.) |
| Personal certificado | Equipos capacitados en manejo de producto, seguridad e higiene y estándares de calidad. | `[APPROVED: owner 2026-10-01]` (what certification, issued by whom?) |
| Servicios premium | Acabados de maquila que llegan al piso de venta listos para exhibirse. | Marketing claim; low risk |
| Atención personalizada | Un responsable de cuenta que conoce su operación y responde el mismo día. | `[APPROVED: owner 2026-10-01]` (same-day response commitment) |
| Operación sin fricciones | Procesos documentados y reportes claros para que su equipo deje de apagar incendios. | Marketing claim; low risk |

Client logos, case studies, numbers: none on the site. `[PENDING: owner input]`

---

## 5. Process ("Cómo trabajamos")

Source: https://logispack.com.mx/ (section "Cómo trabajamos"). Matches PRD sequence.

1. **Diagnóstico**: Escuchamos su necesidad, volúmenes y tiempos. Visitamos la planta si hace falta.
2. **Propuesta**: Definimos alcance, personal, materiales y costo en una propuesta clara.
3. **Arranque**: Integramos al personal, capacitamos y ponemos en marcha la operación.
4. **Seguimiento**: Medimos, reportamos y ajustamos para mantener el estándar mes a mes.

---

## 6. About (Nosotros)

Source: none. The live site has no Nosotros/About section (https://logispack.com.mx/).

- Company story, mission, team, workforce standards: `[PENDING: owner input]`
- Interim text built only from sourced facts (optional, until the owner supplies a story):
  > Logispack ofrece servicios logísticos, maquila y personal especializado para empresas que no pueden detener su operación. `[APPROVED: owner 2026-10-01]` Cuenta con más de 25 años de experiencia en maquila, logística y operación para diferentes industrias. `[APPROVED: owner 2026-10-01]`
- Reuse the process (section 5) and trust items (section 4) on this page, per the PRD.

---

## 7. FAQ

Source: https://logispack.com.mx/ (section FAQ). The live site answers all four PRD topics; the PRD expected these to be pending. Answers are sourced but require owner review per the PRD.

**¿Qué es la certificación REPSE y por qué importa?** `[APPROVED: owner 2026-10-01]`
Es el registro ante la STPS que autoriza prestar servicios especializados. Contratar a un proveedor registrado protege a su empresa de responsabilidad solidaria y permite deducir el servicio. (Legal wording: confirm with counsel.)

**¿Cuál es el volumen mínimo para maquila?**
Se trabaja por proyecto. Se evalúan volumen, tiempos y complejidad, y se indica con claridad si conviene realizar el trabajo en la planta del cliente o en las instalaciones de Logispack. No hay un volumen mínimo publicado: figura numérica `[PENDING: owner input]`.

**¿Pueden trabajar dentro de mis instalaciones?**
Sí. Se puede operar in-house con personal de Logispack o recibir el producto en el almacén, según convenga al proceso.

**¿En cuánto tiempo pueden arrancar?** `[APPROVED: owner 2026-10-01]`
La mayoría de los proyectos arranca entre 3 y 10 días hábiles después de aprobar la propuesta, según el perfil y la cantidad de personal.

Proposed extra questions (answers `[PENDING: owner input]`):
- ¿Qué zonas o alcaldías cubre el servicio de reparto?
- ¿Cómo se solicita una cotización?
- ¿Cómo puede una persona interesada en trabajar con Logispack postularse? (candidate path; no portal in v1)

---

## 8. Footer / contact block

Contact data per PRD:46-47 (approved). Live site differs; see section 11.

- Brand: LOGISPACK Capital Humano
- Descriptor: Servicios logísticos, maquila y personal especializado para empresas que no pueden detener su operación. (live footer text)
- WhatsApp: **55 44 79 26 96** (CTA: "Pida informes por WhatsApp", `https://wa.me/525544792696`)
- Teléfono: 54 44 57 58 87
- Celular: 55 35 68 95 49 (owner, 2026-10-04)
- Correo: alfredocervantess@live.com.mx
- Dirección: Mar del Frío #60, Col. Ciudad Brisa, Alcaldía Naucalpan de Juárez, Estado de México
- Horario: Lunes a sábado, 08:00 a 18:00 h
- Legal line: © LOGISPACK. Todos los derechos reservados.
- No contact form, no analytics, no cookie banner in v1. Privacy notice: not required in v1 because the site collects no personal data (PRD non-goals, decision 2026-10-01).

---

## 9. Route-map popup (illustrative)

Source: none (PRD concept, PRD:91). Entirely FICTIONAL sample copy. No live tracking, no real names, IDs, timestamps or ETAs.

**Popup (static card)**
- Title: **Ejemplo ilustrativo**
- Disclaimer: Datos ficticios con fines demostrativos. No corresponde a un envío real ni muestra ubicación o estado en vivo.
- Repartidor: Carlos (nombre ficticio)
- Paquete: Caja mediana (ejemplo)
- Ruta: Centro de distribución → Destino
- Close button label: Cerrar ejemplo
- Marker accessible name: Ejemplo ilustrativo de ruta de reparto. Activar para ver los datos de muestra.

**Text equivalent for the map** (visible beside/under the map, also `aria-describedby`)
> Ilustración de una ruta de reparto de ejemplo. Un paquete sale del centro de distribución, avanza por una ruta programada y llega a su destino. Es una representación ilustrativa: no muestra envíos reales ni seguimiento en vivo.

CTA under the map: Pida informes por WhatsApp. Link to the "Servicio de reparto" section.

**Approved extra copy (implemented, `src/lib/route-map-copy.ts`, owner-approved 2026-10-02)**
- Section heading: **Ruta ilustrativa**
- Service link label: **Conozca el Servicio de reparto**

The static sample card is always visible; the popup (JavaScript) shows the same content.

---

## 10. 404 page

- Title: **Página no encontrada**
- Body: La página que busca no existe o fue movida. Puede volver al inicio o consultar nuestros servicios.
- Primary CTA: Volver al inicio
- Secondary CTA: Pida informes por WhatsApp

---

## 11. Gaps and discrepancies

### Discrepancies: live site vs. PRD

Owner decision (2026-10-01): the PRD contact data is authoritative. The live-site contact data is outdated and must not be reused.

| Item | Live site | PRD | Action |
|---|---|---|---|
| Structure | Single page (`/`), no Nosotros/Contact/FAQ pages | 7-area IA with separate pages | Deck builds all PRD pages; only Home has live source |
| WhatsApp | 55 4885 7636 (`wa.me/525548857636`) | 55 44 79 26 96 | **Confirmed PRD (owner, 2026-10-01)** |
| Phone | Same single number | 54 44 57 58 87 | **Confirmed PRD (owner, 2026-10-01)** |
| Email | alexciter@live.com | alfredocervantess@live.com.mx | **Confirmed PRD (owner, 2026-10-01)** |
| Address | Av. de los Ángeles 185, Col. San Martín Xochinahuac, Azcapotzalco, CDMX | Mar del Frío #60, Col. Ciudad Brisa, Naucalpan de Juárez, Edo. Méx. | **Confirmed PRD (owner, 2026-10-01)** |
| Hours | Lun–Vie 09:00–18:00; Sáb 09:00–14:00 | Lun–Sáb 08:00–18:00 | **Confirmed PRD (owner, 2026-10-01)** |
| Hero CTA | "Agendar por WhatsApp" | "Pida informes por WhatsApp" | Used PRD |
| Hero H1 | "Tu operación logistica..." (tuteo) | n/a | Rewritten to usted |
| Retractilado name | "Retractilado de libros y/o cualquier producto" | "Retractilado" | Shortened per PRD |
| FAQ answers | All 4 answered on site | Expected pending | Included as sourced, flagged for review |
| Meta description | None | n/a | Proposed |
| Service count | 11 | 11 | Match |

### Owner approvals (2026-10-01)

- All former VERIFY items are approved.
- CTA register: usted ("Pida informes por WhatsApp").
- Logo: superseded 2026-10-02 by the vector SVG logos from the Claude Design system (`src/assets/brand/logispack-logo*.svg`, `logispack-mark*.svg`); the PNG raster is no longer the master.
- Content vs. visuals (2026-10-02): the PRD governs content (usted register, no tracking features); the design system governs visuals.
- Photography: owner-authored AI-generated images; no third-party license required.

### Former VERIFY items (approved)
REPSE (hero eyebrow, trust, FAQ) · "25+ años" · "Personal certificado" (hero and trust) · Same-day response / "cotización sin compromiso" · Outsourcing wording · Marbetado compliance wording · "3 a 10 días hábiles" · Mention of Didi · Home meta description/descriptor · About interim text · CTA register ("Pide" vs. usted).

### PENDING: owner input
About/Nosotros story and standards · Per-service detail content (problem, flow, proof) · Coverage areas for delivery · Client logos/cases/numbers · Maquila minimum volume figure · Candidate application path · Privacy notice requirement · Meta descriptions for Nosotros · Extra FAQ answers.
