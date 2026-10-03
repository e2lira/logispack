import { describe, expect, it } from 'vitest';
import { contact } from '../../src/lib/contact';
import {
  OG_IMAGE,
  absoluteUrl,
  buildOrganizationJsonLd,
} from '../../src/lib/seo';

const SITE = 'https://logispack.capitalhumano.com.mx';

describe('absoluteUrl', () => {
  it('resolves a path against the site origin', () => {
    expect(absoluteUrl('/servicios/', SITE)).toBe(`${SITE}/servicios/`);
  });

  it('accepts a URL object as the site', () => {
    expect(absoluteUrl('/og-image.jpg', new URL(SITE))).toBe(
      `${SITE}/og-image.jpg`,
    );
  });
});

describe('OG_IMAGE', () => {
  it('declares the 1200x630 social card with alt text', () => {
    expect(OG_IMAGE.width).toBe(1200);
    expect(OG_IMAGE.height).toBe(630);
    expect(OG_IMAGE.path).toMatch(/^\/.+\.(jpg|png)$/);
    expect(OG_IMAGE.alt.length).toBeGreaterThan(10);
  });
});

describe('buildOrganizationJsonLd', () => {
  const data = buildOrganizationJsonLd(SITE) as Record<string, unknown>;

  it('survives a JSON round trip with the schema.org context', () => {
    const parsed = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('LocalBusiness');
  });

  it('uses only data from the contact module', () => {
    expect(data['name']).toBe(contact.brand);
    expect(data['url']).toBe(`${SITE}/`);
    expect(data['email']).toBe(contact.email);
    expect(data['telephone']).toEqual(
      contact.phones.map((p) => p.href.slice(4)),
    );
    expect(data['address']).toEqual({
      '@type': 'PostalAddress',
      streetAddress: contact.address,
      addressCountry: 'MX',
    });
  });

  it('points the logo and image at absolute URLs on the site', () => {
    expect(String(data['logo']).startsWith(`${SITE}/`)).toBe(true);
    expect(data['image']).toBe(`${SITE}${OG_IMAGE.path}`);
  });

  it('declares opening hours Monday to Saturday 08:00-18:00', () => {
    expect(data['openingHoursSpecification']).toEqual({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      opens: '08:00',
      closes: '18:00',
    });
  });

  it('does not invent fields beyond the allowed set', () => {
    expect(Object.keys(data).sort()).toEqual(
      [
        '@context',
        '@type',
        'name',
        'url',
        'logo',
        'image',
        'telephone',
        'email',
        'address',
        'openingHoursSpecification',
      ].sort(),
    );
  });
});
