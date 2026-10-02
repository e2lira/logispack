import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  parseHex,
  relativeLuminance,
} from '../../src/lib/contrast';

describe('parseHex', () => {
  it('parses 6-digit hex colors', () => {
    expect(parseHex('#FFFFFF')).toEqual([255, 255, 255]);
    expect(parseHex('#405329')).toEqual([64, 83, 41]);
  });

  it('parses 3-digit hex colors and lowercase', () => {
    expect(parseHex('#fff')).toEqual([255, 255, 255]);
  });

  it('throws on invalid input', () => {
    expect(() => parseHex('olive')).toThrow();
  });
});

describe('relativeLuminance', () => {
  it('is 1 for white and 0 for black', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
  });
});

describe('contrastRatio', () => {
  it('is 21 for black on white and symmetric', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 2);
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 2);
  });

  it('is 1 for identical colors', () => {
    expect(contrastRatio('#405329', '#405329')).toBeCloseTo(1, 5);
  });

  it('matches the documented olive primary on white (8.44:1)', () => {
    expect(contrastRatio('#405329', '#FFFFFF')).toBeCloseTo(8.44, 1);
  });
});
