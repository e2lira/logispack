import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Media from '../../src/components/Media.astro';
import logo from '../../src/assets/photos/courier-hero.jpg';

async function render(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(Media, { props });
}

describe('Media.astro (real component output)', () => {
  it('renders a figure with the reserved aspect ratio', async () => {
    const html = await render({ image: logo, alt: 'Logotipo de Logispack' });
    expect(html).toMatch(/<figure[^>]*class="media"/);
    expect(html).toContain(`--media-ratio: ${logo.width} / ${logo.height}`);
  });

  it('renders a picture with avif and webp sources and an img with dimensions and alt', async () => {
    const html = await render({
      image: logo,
      alt: 'Logotipo de Logispack',
      width: 400,
      height: 300,
    });
    expect(html).toMatch(/<picture[\s>]/);
    expect(html).toMatch(/<source[^>]*type="image\/avif"/);
    expect(html).toMatch(/<source[^>]*type="image\/webp"/);
    const img = html.match(/<img[^>]*>/)?.[0] ?? '';
    expect(img).toMatch(/\bwidth="400"/);
    expect(img).toMatch(/\bheight="300"/);
    expect(img).toContain('alt="Logotipo de Logispack"');
    expect(img).toContain('loading="lazy"');
    expect(html).toContain('--media-ratio: 400 / 300');
  });

  it('refuses to render without alt text', async () => {
    await expect(render({ image: logo, alt: '  ' })).rejects.toThrow(/alt/);
  });
});
