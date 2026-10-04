/**
 * Building blocks for theme textures drawn as SVG. Each theme group has a
 * module in this folder that default-exports `{ name: svg }`, and
 * `scripts/theme-art.ts` writes them to `public/textures/`.
 *
 * Colors are written into the SVG: a background image cannot see CSS
 * variables, so each mode (light, dark) needs its own version of a drawing.
 */

/** A standalone SVG, ready to use as a background image. */
export function svg(width: number, height: number, body: string, extra = ''): string {
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'${extra ? ' ' + extra : ''}>${body}</svg>`;
}

/** Same, with hard edges: pixel art must not blur when scaled. */
export function pixelSvg(width: number, height: number, body: string): string {
  return svg(width, height, body, "shape-rendering='crispEdges'");
}

export const g = (transform: string, ...children: string[]) => `<g transform='${transform}'>${children.join('')}</g>`;

/**
 * A pixel art sprite from a text map: each character is a pixel, `.` and ` `
 * are transparent, anything else is looked up in the palette. Runs of the same
 * color on a row merge into a single rect.
 *
 *   pixels(['.XX.', 'XooX'], { X: '#222', o: '#f80' }, 4, 10, 10)
 */
export function pixels(
  map: string[],
  palette: Record<string, string>,
  scale = 1,
  x0 = 0,
  y0 = 0,
  opacity = 1,
): string {
  let out = '';
  map.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x]!;
      if (c === '.' || c === ' ') {
        x++;
        continue;
      }
      let end = x;
      while (end + 1 < row.length && row[end + 1] === c) end++;
      const color = palette[c];
      if (!color) throw new Error(`pixels: character «${c}» is not in the palette`);
      out += `<rect x='${x0 + x * scale}' y='${y0 + y * scale}' width='${(end - x + 1) * scale}' height='${scale}' fill='${color}'/>`;
      x = end + 1;
    }
  });
  return opacity === 1 ? out : `<g opacity='${opacity}'>${out}</g>`;
}

/** Width and height of a pixel map, already scaled. */
export const size = (map: string[], scale = 1) => ({
  width: Math.max(...map.map((r) => r.length)) * scale,
  height: map.length * scale,
});

/** Mirrors a pixel map horizontally. */
export const mirror = (map: string[]) => map.map((r) => [...r].reverse().join(''));

/** Seeded randomness: the same drawing on every run, so the hash is stable. */
export function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** `n` random points inside a rectangle, rounded to one decimal. */
export function points(n: number, width: number, height: number, seed: number): [number, number][] {
  const r = random(seed);
  return Array.from({ length: n }, () => [Math.round(r() * width * 10) / 10, Math.round(r() * height * 10) / 10]);
}

/** Four-pointed sparkle. */
export function sparkle(x: number, y: number, r: number, color: string, opacity = 1): string {
  const k = r * 0.18;
  return `<path d='M${x} ${y - r}Q${x + k} ${y - k} ${x + r} ${y}Q${x + k} ${y + k} ${x} ${y + r}Q${x - k} ${y + k} ${x - r} ${y}Q${x - k} ${y - k} ${x} ${y - r}Z' fill='${color}' opacity='${opacity}'/>`;
}

/** Five-pointed star. */
export function star(x: number, y: number, r: number, color: string, opacity = 1): string {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    p.push(`${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `<path d='M${p.join('L')}Z' fill='${color}' opacity='${opacity}'/>`;
}

/** Heart centered on (x, y). */
export function heart(x: number, y: number, r: number, color: string, opacity = 1): string {
  return `<path d='M${x} ${y + r}C${x - r * 1.6} ${y - r * 0.2} ${x - r * 0.9} ${y - r * 1.4} ${x} ${y - r * 0.5}C${x + r * 0.9} ${y - r * 1.4} ${x + r * 1.6} ${y - r * 0.2} ${x} ${y + r}Z' fill='${color}' opacity='${opacity}'/>`;
}
