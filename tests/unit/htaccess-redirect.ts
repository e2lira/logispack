import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Approximate evaluator for the canonical host / HTTPS redirect in
 * public/.htaccess. It is NOT Apache: it reads the real RewriteCond and
 * RewriteRule lines of the file and applies them with JS regexes, covering only
 * the subset of syntax that block uses (%{VAR} test strings, "!" negation,
 * [NC] flag, AND-ed conditions, one R=301 rule).
 */
export interface Request {
  host: string;
  https: boolean;
  path: string;
  query?: string;
  xForwardedProto?: string;
}

export interface Outcome {
  redirect: boolean;
  status?: number;
  location?: string;
}

const htaccess = readFileSync(
  resolve(__dirname, '../../public/.htaccess'),
  'utf8',
);

const directives = htaccess
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));

export const redirectConds = directives.filter((l) =>
  l.startsWith('RewriteCond'),
);
export const redirectRule = directives.find(
  (l) => l.startsWith('RewriteRule') && /R=301/.test(l),
);

function variable(name: string, req: Request): string {
  switch (name) {
    case 'HTTP_HOST':
      return req.host;
    case 'HTTPS':
      return req.https ? 'on' : 'off';
    case 'HTTP:X-Forwarded-Proto':
      return req.xForwardedProto ?? '';
    case 'REQUEST_URI':
      return req.path;
    default:
      throw new Error(`Unsupported server variable: ${name}`);
  }
}

function condMatches(line: string, req: Request): boolean {
  const m = /^RewriteCond\s+(\S+)\s+(\S+)(?:\s+\[([^\]]*)\])?$/.exec(line);
  if (!m) throw new Error(`Unparseable RewriteCond: ${line}`);
  const [, testString, rawPattern, flags = ''] = m as unknown as [
    string,
    string,
    string,
    string | undefined,
  ];
  const value = testString.replace(/%\{([^}]+)\}/g, (_, n: string) =>
    variable(n, req),
  );
  const negate = rawPattern.startsWith('!');
  const pattern = negate ? rawPattern.slice(1) : rawPattern;
  const re = new RegExp(pattern, /\bNC\b/.test(flags) ? 'i' : '');
  return re.test(value) !== negate;
}

export function evaluate(req: Request): Outcome {
  if (!redirectRule) throw new Error('No R=301 RewriteRule found');
  // Every RewriteCond is AND-ed (the block uses no [OR]).
  if (!redirectConds.every((c) => condMatches(c, req))) {
    return { redirect: false };
  }
  const target = /^RewriteRule\s+\S+\s+(\S+)/.exec(redirectRule)?.[1] ?? '';
  const location = target.replace(/%\{REQUEST_URI\}/g, req.path);
  return { redirect: true, status: 301, location };
}
