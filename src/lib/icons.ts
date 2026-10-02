import caretRight from '@phosphor-icons/core/assets/regular/caret-right.svg?raw';
import info from '@phosphor-icons/core/assets/regular/info.svg?raw';

/**
 * Phosphor Icons (MIT), Regular weight, inlined at build time. Register an icon
 * here only when a component uses it, so no unused SVG ships.
 */
const icons = {
  'caret-right': caretRight,
  info,
} as const;

export type IconName = keyof typeof icons;
export type IconSize = 'md' | 'sm';

export const iconNames = Object.keys(icons) as IconName[];

/** Decorative inline SVG: hidden from assistive tech and colored by `currentColor`. */
export function iconSvg(name: string, size: IconSize = 'md'): string {
  const raw = (icons as Record<string, string>)[name];
  if (!raw) throw new Error(`Unknown icon: ${name}`);
  const className = size === 'sm' ? 'icon icon--sm' : 'icon';
  return raw.replace(
    '<svg ',
    `<svg aria-hidden="true" focusable="false" class="${className}" `,
  );
}
