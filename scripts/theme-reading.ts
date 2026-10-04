/**
 * Reading theme CSS from the scripts (the index and the check): each block's
 * variables, already resolved against «papel», which is what a theme inherits
 * for anything it does not redefine.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { minifyCss } from '../styles/themes/minify';

export type Vars = Record<string, string>;
const ROOT = join(import.meta.dirname, '..');

export function block(css: string, selector: string): Vars | null {
  const i = css.indexOf(selector + '{');
  if (i < 0) return null;
  const body = css.slice(i + selector.length + 1, css.indexOf('}', i));
  const vars: Vars = {};
  for (const decl of body.split(/;(?![^(]*\))/)) {
    const m = decl.match(/^\s*(--[\w-]+)\s*:\s*([\s\S]+?)\s*$/);
    if (m) vars[m[1]!] = m[2]!;
  }
  return vars;
}

const base = minifyCss(readFileSync(join(ROOT, 'styles/temas.css'), 'utf8'));
export const PAPEL = {
  light: block(base, ":root,[data-tema='papel']")!,
  dark: block(base, ".dark[data-tema='papel'],.dark:not([data-tema])")!,
};

export const hasThemeFile = (theme: string) => theme === 'papel' || existsSync(join(ROOT, `styles/themes/${theme}.ts`));

/** A theme's CSS, minified, or null if it has no file yet. */
export async function cssOf(theme: string): Promise<string | null> {
  if (theme === 'papel') return '';
  if (!hasThemeFile(theme)) return null;
  return minifyCss((await import(join(ROOT, `styles/themes/${theme}.ts`))).default);
}

/** Each mode's variables as the browser sees them, or null if a block is missing. */
export function resolve(theme: string, css: string): { light: Vars; dark: Vars } | null {
  if (theme === 'papel') return { light: PAPEL.light, dark: { ...PAPEL.light, ...PAPEL.dark } };
  const light = block(css, `html[data-tema='${theme}']`);
  const dark = block(css, `html.dark[data-tema='${theme}']`);
  if (!light || !dark) return null;
  return { light: { ...PAPEL.light, ...light }, dark: { ...PAPEL.light, ...light, ...dark } };
}
