import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { routeMapCopy } from '../../src/lib/route-map-copy';

const css = readFileSync(
  new URL('../../src/styles/route-map.css', import.meta.url),
  'utf8',
);

/** Disclaimer sentences are the only place "en vivo" may appear (they deny it). */
const ALLOWED_DENIALS = [routeMapCopy.disclaimer, routeMapCopy.textEquivalent];

const PROHIBITED = [
  /tiempo real/i,
  /rastre/i,
  /\bETA\b/,
  /\bLP-?\d+/i,
  /#LP/i,
  /\b\d{1,2}:\d{2}\b/,
  /\b\d{4}-\d{2}-\d{2}\b/,
  /\bpedido\s*#?\d+/i,
  /en vivo/i,
];

function visibleCopy(): string {
  const all = Object.values(routeMapCopy)
    .flatMap((value) =>
      typeof value === 'string'
        ? [value]
        : value.flatMap((row) => [row.label, row.value]),
    )
    .join('\n');
  return ALLOWED_DENIALS.reduce(
    (text, sentence) => text.replace(sentence, ''),
    all,
  );
}

describe('route-map copy (content deck section 9)', () => {
  it('uses the approved popup copy verbatim', () => {
    expect(routeMapCopy.title).toBe('Ejemplo ilustrativo');
    expect(routeMapCopy.disclaimer).toBe(
      'Datos ficticios con fines demostrativos. No corresponde a un envío real ni muestra ubicación o estado en vivo.',
    );
    expect(routeMapCopy.closeLabel).toBe('Cerrar ejemplo');
    expect(routeMapCopy.markerLabel).toBe(
      'Ejemplo ilustrativo de ruta de reparto. Activar para ver los datos de muestra.',
    );
    expect(routeMapCopy.textEquivalent).toBe(
      'Ilustración de una ruta de reparto de ejemplo. Un paquete sale del centro de distribución, avanza por una ruta programada y llega a su destino. Es una representación ilustrativa: no muestra envíos reales ni seguimiento en vivo.',
    );
  });

  it('lists the three fictional rows', () => {
    expect(routeMapCopy.rows).toEqual([
      { label: 'Repartidor', value: 'Carlos (nombre ficticio)' },
      { label: 'Paquete', value: 'Caja mediana (ejemplo)' },
      { label: 'Ruta', value: 'Centro de distribución → Destino' },
    ]);
  });

  it.each(PROHIBITED.map((re) => [String(re), re] as const))(
    'never contains %s outside the denial sentences',
    (_name, re) => {
      expect(visibleCopy()).not.toMatch(re);
    },
  );
});

describe('route-map.css', () => {
  it('only animates inside prefers-reduced-motion: no-preference', () => {
    const noPref = css.match(
      /@media \(prefers-reduced-motion: no-preference\)\s*\{/g,
    );
    expect(noPref?.length).toBeGreaterThanOrEqual(1);
    // strip every no-preference block (balanced braces), then no motion may remain
    let rest = css;
    for (;;) {
      const start = rest.search(
        /@media \(prefers-reduced-motion: no-preference\)\s*\{/,
      );
      if (start < 0) break;
      let depth = 0;
      let end = start;
      for (let i = rest.indexOf('{', start); i < rest.length; i++) {
        if (rest[i] === '{') depth++;
        if (rest[i] === '}') depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
      rest = rest.slice(0, start) + rest.slice(end);
    }
    expect(rest).not.toMatch(/\banimation(-[a-z-]+)?\s*:/);
    expect(rest).not.toMatch(/@keyframes/);
    expect(rest).not.toMatch(/\btransition\s*:/);
  });

  it('reads colors from design tokens only', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).not.toMatch(/\b(?:rgb|hsl)a?\(/i);
    for (const token of [
      '--map-land',
      '--map-park',
      '--map-water',
      '--map-street',
      '--forest-900',
      '--forest-800',
      '--pin-origin',
      '--pin-destination',
      '--halo-hover',
      '--halo-tap',
      '--shadow-pop',
      '--marker',
      '--tap-min',
    ]) {
      expect(css).toContain(`var(${token})`);
    }
  });
});
