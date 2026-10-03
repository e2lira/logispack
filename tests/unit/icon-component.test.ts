import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Button from '../../src/components/Button.astro';
import Icon from '../../src/components/Icon.astro';
import { iconNames } from '../../src/lib/icons';

async function render(
  component: Parameters<AstroContainer['renderToString']>[0],
  props: Record<string, unknown>,
  slots?: Record<string, string>,
) {
  const container = await AstroContainer.create();
  return container.renderToString(component, {
    props,
    ...(slots ? { slots } : {}),
  });
}

describe('Icon.astro', () => {
  it('inlines a Phosphor Regular SVG that is decorative and inherits color', async () => {
    const html = await render(Icon, { name: 'info' });
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
    expect(html).toMatch(/<svg[^>]*focusable="false"/);
    expect(html).toContain('fill="currentColor"');
    expect(html).toContain('viewBox="0 0 256 256"');
    expect(html).not.toMatch(/<svg[^>]*\b(width|height)=/);
  });

  it('applies the requested size class', async () => {
    const html = await render(Icon, { name: 'caret-right', size: 'sm' });
    expect(html).toMatch(/<svg[^>]*class="icon icon--sm"/);
  });

  it('throws on an unregistered icon name', async () => {
    await expect(render(Icon, { name: 'nope' })).rejects.toThrow(/nope/);
  });
});

describe('icon registry', () => {
  const srcDir = fileURLToPath(new URL('../../src', import.meta.url));
  function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      return statSync(full).isDirectory() ? walk(full) : [full];
    });
  }
  const sources = walk(srcDir)
    .filter((f) => /\.(astro|ts)$/.test(f) && !f.endsWith('icons.ts'))
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');

  it('only ships icons that are used', () => {
    const unused = iconNames.filter(
      (name) => !new RegExp(`['"]${name}['"]`).test(sources),
    );
    expect(unused).toEqual([]);
  });
});

describe('Button.astro', () => {
  it('renders a primary link button with a decorative arrow', async () => {
    const html = await render(Button, { href: '/x/' }, { default: 'Etiqueta' });
    expect(html).toMatch(
      /<a[^>]*class="button"[^>]*href="\/x\/"|<a[^>]*href="\/x\/"[^>]*class="button"/,
    );
    expect(html).toContain('Etiqueta');
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
  });

  it('renders the outline variant', async () => {
    const html = await render(
      Button,
      { href: '/x/', variant: 'outline' },
      { default: 'Etiqueta' },
    );
    expect(html).toContain('button button--outline');
  });
});
