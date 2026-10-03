import caretRight from '@phosphor-icons/core/assets/regular/caret-right.svg?raw';
import check from '@phosphor-icons/core/assets/regular/check.svg?raw';
import info from '@phosphor-icons/core/assets/regular/info.svg?raw';
import mapPin from '@phosphor-icons/core/assets/regular/map-pin.svg?raw';
import motorcycle from '@phosphor-icons/core/assets/regular/motorcycle.svg?raw';
import packageIcon from '@phosphor-icons/core/assets/regular/package.svg?raw';
import user from '@phosphor-icons/core/assets/regular/user.svg?raw';
import users from '@phosphor-icons/core/assets/regular/users.svg?raw';
import x from '@phosphor-icons/core/assets/regular/x.svg?raw';

/**
 * Phosphor Icons (MIT), Regular weight, inlined at build time. Register an icon
 * here only when a component uses it, so no unused SVG ships.
 */
const icons = {
  check,
  'caret-right': caretRight,
  info,
  'map-pin': mapPin,
  motorcycle,
  package: packageIcon,
  user,
  users,
  x,
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
