import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  faqSchema,
  familySchema,
  processSchema,
  serviceSchema,
  trustSchema,
} from '../../src/content/schemas';
import families from '../../src/content/families.json';
import faq from '../../src/content/faq.json';
import process_ from '../../src/content/process.json';
import services from '../../src/content/services.json';
import trust from '../../src/content/trust.json';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe('families', () => {
  it('has exactly 3 valid families with unique ids', () => {
    expect(families).toHaveLength(3);
    for (const f of families)
      expect(familySchema.safeParse(f).success).toBe(true);
    expect(new Set(families.map((f) => f.id)).size).toBe(3);
  });
});

describe('services', () => {
  it('has exactly 11 valid services', () => {
    expect(services).toHaveLength(11);
    for (const s of services) {
      const result = serviceSchema.safeParse(s);
      expect(result.success, `${s.id}`).toBe(true);
    }
  });

  it('uses unique, URL-safe slugs', () => {
    const slugs = services.map((s) => s.id);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(SLUG);
  });

  it('assigns every service to an existing family', () => {
    const familyIds = new Set(families.map((f) => f.id));
    for (const s of services) expect(familyIds.has(s.family), s.id).toBe(true);
  });

  it('has no empty family', () => {
    for (const f of families) {
      expect(
        services.some((s) => s.family === f.id),
        f.id,
      ).toBe(true);
    }
  });

  it('keeps summaries within the meta description budget and has scope bullets', () => {
    for (const s of services) {
      expect(s.summary.length, s.id).toBeLessThanOrEqual(155);
      expect(s.scope.length, s.id).toBeGreaterThan(0);
    }
  });

  it('rejects an invalid service', () => {
    expect(
      serviceSchema.safeParse({
        id: 'Bad Slug',
        family: 'x',
        name: '',
        summary: '',
        scope: [],
      }).success,
    ).toBe(false);
  });
});

describe('faq, trust and process', () => {
  it('validates every entry', () => {
    for (const q of faq) expect(faqSchema.safeParse(q).success).toBe(true);
    for (const t of trust) expect(trustSchema.safeParse(t).success).toBe(true);
    for (const p of process_)
      expect(processSchema.safeParse(p).success).toBe(true);
  });

  it('has sourced FAQ entries only (4), the 4-step process and the approved trust items', () => {
    expect(faq).toHaveLength(4);
    expect(process_.map((p) => p.title)).toEqual([
      'Diagnóstico',
      'Propuesta',
      'Arranque',
      'Seguimiento',
    ]);
    const titles = trust.map((t) => t.title);
    for (const required of [
      'Certificación REPSE',
      '25+ años de experiencia',
      'Personal certificado',
      'Atención personalizada',
    ]) {
      expect(titles).toContain(required);
    }
  });
});

describe('forbidden copy', () => {
  const FORBIDDEN = [
    /tiempo real/i,
    /rastrea/i,
    /\bETA\b/,
    /pendiente/i,
    /\[PENDING/i,
    /\[VERIFY/i,
  ];
  const srcDir = fileURLToPath(new URL('../../src', import.meta.url));

  function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      return statSync(full).isDirectory() ? walk(full) : [full];
    });
  }

  const files = walk(srcDir).filter((f) => /\.(json|astro|ts)$/.test(f));

  it('scans content, pages and components', () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it('contains no live-tracking claims or pending placeholders', () => {
    const offenders = files.flatMap((f) => {
      const text = readFileSync(f, 'utf8');
      return FORBIDDEN.filter((re) => re.test(text)).map(
        (re) => `${relative(srcDir, f)}: ${re}`,
      );
    });
    expect(offenders).toEqual([]);
  });
});
