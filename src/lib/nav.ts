export const navItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios', href: '/servicios/' },
  { label: 'Nosotros', href: '/nosotros/' },
  { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes/' },
  { label: 'Contacto', href: '/contacto/' },
] as const;

export function normalizePath(path: string): string {
  if (!path.startsWith('/')) return '/';
  return path.endsWith('/') ? path : `${path}/`;
}

/** `page` for the exact page, `true` for a parent section, otherwise undefined. */
export function navCurrent(
  href: string,
  currentPath: string,
): 'page' | 'true' | undefined {
  const current = normalizePath(currentPath);
  if (current === href) return 'page';
  if (href !== '/' && current.startsWith(href)) return 'true';
  return undefined;
}
