/**
 * What every theme has to satisfy, checked instead of promised:
 *
 *   npm run themes:test
 *   npm run themes:test -- --only arcade,bolsillo   # while drawing a few
 *
 * - its CSS exists, with a light and a dark block;
 * - the contrasts `styles/temas.css` promises, in both modes;
 * - the swatch hex in `lib/theme-swatches.ts` match the CSS;
 * - every texture points to a file that exists in `public/`;
 * - every font it uses is declared in the layout.
 */
import { existsSync, readFileSync } from 'node:fs';
import { PALETAS, TEMAS, type Tema } from '../lib/temas';
import { cssOf, resolve, type Vars } from './theme-reading';

const flag = process.argv.indexOf('--only');
const only = flag > 0 ? process.argv[flag + 1]!.split(',') : null;

function rgb(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1]!.length === 3 ? [...m[1]!].map((c) => c + c).join('') : m[1]!;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function luminance([r, g, b]: [number, number, number]) {
  const c = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
}

function contrast(a: string, b: string): number | null {
  const x = rgb(a);
  const y = rgb(b);
  if (!x || !y) return null;
  const [l1, l2] = [luminance(x), luminance(y)].sort((p, q) => q - p);
  return (l1! + 0.05) / (l2! + 0.05);
}

const RULES: [string, string, number][] = [
  ['--tinta', '--fondo', 12],
  ['--tinta', '--superficie', 12],
  ['--tinta-suave', '--superficie', 6],
  ['--acento', '--superficie', 4.5],
  ['--durazno', '--superficie', 4.5],
  ['--menta', '--superficie', 4.5],
  ['--sobre-acento', '--acento', 5],
  ['--sobre-persona', '--durazno', 4.5],
  ['--sobre-persona', '--menta', 4.5],
];

const layout = readFileSync('app/layout.tsx', 'utf8');
const fonts = new Set([...layout.matchAll(/variable: '(--font-[\w-]+)'/g)].map((m) => m[1]));

const errors: string[] = [];
const fail = (theme: string, text: string) => errors.push(`${theme}: ${text}`);

for (const theme of only ?? TEMAS) {
  if (!TEMAS.includes(theme as Tema)) { fail(theme, 'not in TEMAS (lib/temas.ts)'); continue; }
  const css = await cssOf(theme);
  if (css === null) { fail(theme, `no styles/themes/${theme}.ts`); continue; }
  const modes = resolve(theme, css);
  if (!modes) { fail(theme, "missing the light (html[data-tema='…']) or dark (html.dark[data-tema='…']) block"); continue; }

  for (const [mode, v] of Object.entries(modes) as ['light' | 'dark', Vars][]) {
    for (const [a, b, min] of RULES) {
      const c = contrast(v[a] ?? '', v[b] ?? '');
      if (c === null) fail(theme, `${mode}: ${a} or ${b} is not a hex (${v[a]}, ${v[b]})`);
      else if (c < min) fail(theme, `${mode}: ${a} on ${b} is ${c.toFixed(2)}, needs ${min}`);
    }
    const swatch = PALETAS[theme as Tema][mode === 'light' ? 'claro' : 'oscuro'];
    for (const k of ['fondo', 'acento', 'tinta'] as const)
      if (swatch[k].toLowerCase() !== v[`--${k}`]?.toLowerCase())
        fail(theme, `${mode}: swatch ${k} is ${swatch[k]} but the CSS says ${v[`--${k}`]} (run npm run themes:index)`);
  }

  for (const m of css.matchAll(/url\('([^']+)'\)/g))
    if (!existsSync('public' + m[1])) fail(theme, `missing texture ${m[1]}`);
  for (const m of css.matchAll(/var\((--font-[\w-]+)\)/g))
    if (!fonts.has(m[1])) fail(theme, `uses ${m[1]}, which the layout does not declare`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n✗ ${errors.length} problems in ${(only ?? TEMAS).length} themes`);
  process.exit(1);
}
console.log(`✓ ${(only ?? TEMAS).length} themes: contrast, swatches, textures and fonts OK`);
