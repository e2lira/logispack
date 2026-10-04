/**
 * Release gate: `pnpm release:check` builds the site and verifies dist/ before
 * it is uploaded by SFTP (`--verify-only` skips the build, used by CI). Exits
 * with code 1 and a list of problems otherwise.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REQUIRED_FILES = [
  'index.html',
  '404.html',
  '.htaccess',
  'robots.txt',
  'sitemap-index.xml',
  'sitemap-0.xml',
  'og-image.jpg',
  'favicon.ico',
  'apple-touch-icon.png',
];

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/**
 * @param {string} distDir
 * @returns {string[]} human-readable problems; empty when the release is valid
 */
export function verifyDist(distDir) {
  /** @type {string[]} */
  const problems = [];
  for (const rel of REQUIRED_FILES)
    if (!existsSync(join(distDir, rel))) problems.push(`missing ${rel}`);

  for (const file of walk(distDir)) {
    const rel = relative(distDir, file).split(sep).join('/');
    if (rel.endsWith('.map')) problems.push(`source map shipped: ${rel}`);
    if (/-high-res\./i.test(rel))
      problems.push(`owner-only high-res original shipped: ${rel}`);
    if (
      /\.(js|css)$/.test(rel) &&
      /sourceMappingURL=/.test(readFileSync(file, 'utf8'))
    )
      problems.push(`sourceMappingURL reference in ${rel}`);
  }
  return problems;
}

function main() {
  const dist = join(process.cwd(), 'dist');
  if (!process.argv.includes('--verify-only')) {
    const build = spawnSync('pnpm', ['build'], {
      stdio: 'inherit',
      shell: true,
    });
    if (build.status !== 0) process.exit(build.status ?? 1);
  }

  const problems = verifyDist(dist);
  if (problems.length > 0) {
    console.error('\nrelease:check FAILED');
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log('\nrelease:check OK: dist/ is ready to upload.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
