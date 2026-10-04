/**
 * Textures for the «Dragones y reinos» group: fire, ice, wyvern, hoard, map,
 * tournament, grimoire and forge. Each theme gets corner pieces (big, fixed to
 * the screen corners) and one small repeating pattern, in a light and a dark
 * version.
 */
import { points, random, sparkle, star, svg } from './shared';

type Art = Record<string, string>;

/* ------------------------------- helpers -------------------------------- */

type P = [number, number];

/** A point on a cubic Bézier, and the direction it is heading. */
function bezier(p0: P, p1: P, p2: P, p3: P, t: number): { at: P; dir: P } {
  const u = 1 - t;
  const at: P = [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
  const dir: P = [
    3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]),
    3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]),
  ];
  return { at, dir };
}

const f1 = (n: number) => Math.round(n * 10) / 10;

/** Triangular spikes along one side of a Bézier: a dragon's spine. */
function spikes(curve: [P, P, P, P], n: number, height: number, offset: number, color: string, from = 0.05, to = 0.95) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const t = from + ((to - from) * i) / Math.max(1, n - 1);
    const { at, dir } = bezier(...curve, t);
    const len = Math.hypot(dir[0], dir[1]) || 1;
    const [tx, ty] = [dir[0] / len, dir[1] / len];
    const [nx, ny] = [-ty, tx];
    const base: P = [at[0] + nx * offset, at[1] + ny * offset];
    const w = height * 0.45;
    const h = height * (0.6 + 0.4 * Math.sin(Math.PI * t));
    d += `M${f1(base[0] - tx * w)} ${f1(base[1] - ty * w)}L${f1(base[0] + nx * h)} ${f1(base[1] + ny * h)}L${f1(base[0] + tx * w)} ${f1(base[1] + ty * w)}Z`;
  }
  return `<path d='${d}' fill='${color}'/>`;
}

/** A flame tongue, base centered at (x, y), pointing up. */
function flame(x: number, y: number, w: number, h: number, color: string, opacity = 1) {
  return `<path d='M${x - w / 2} ${y}C${x - w / 2} ${y - h * 0.45} ${x - w * 0.1} ${y - h * 0.55} ${x} ${y - h}C${x + w * 0.05} ${y - h * 0.6} ${x + w / 2} ${y - h * 0.5} ${x + w / 2} ${y - h * 0.15}C${x + w / 2} ${y} ${x + w * 0.2} ${y} ${x} ${y}Z' fill='${color}' opacity='${opacity}'/>`;
}

/** Six-armed snowflake. */
function snowflake(x: number, y: number, r: number, color: string, width = 1.2, opacity = 1) {
  let d = '';
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    const [cx, cy] = [Math.cos(a), Math.sin(a)];
    d += `M${x} ${y}L${f1(x + cx * r)} ${f1(y + cy * r)}`;
    for (const k of [0.45, 0.7]) {
      const [bx, by] = [x + cx * r * k, y + cy * r * k];
      for (const s of [-1, 1]) {
        const b = a + (s * Math.PI) / 4;
        d += `M${f1(bx)} ${f1(by)}L${f1(bx + Math.cos(b) * r * 0.28)} ${f1(by + Math.sin(b) * r * 0.28)}`;
      }
    }
  }
  return `<path d='${d}' stroke='${color}' stroke-width='${width}' stroke-linecap='round' fill='none' opacity='${opacity}'/>`;
}

/** A gold coin seen slightly from above. */
function coin(x: number, y: number, r: number, face: string, edge: string, shine: string) {
  return (
    `<ellipse cx='${x}' cy='${y + r * 0.18}' rx='${r}' ry='${f1(r * 0.62)}' fill='${edge}'/>` +
    `<ellipse cx='${x}' cy='${y}' rx='${r}' ry='${f1(r * 0.62)}' fill='${face}'/>` +
    `<ellipse cx='${x}' cy='${y}' rx='${f1(r * 0.66)}' ry='${f1(r * 0.4)}' fill='none' stroke='${edge}' stroke-width='${f1(r * 0.12)}'/>` +
    `<ellipse cx='${f1(x - r * 0.35)}' cy='${f1(y - r * 0.2)}' rx='${f1(r * 0.18)}' ry='${f1(r * 0.08)}' fill='${shine}'/>`
  );
}

/** A faceted gem. */
function gem(x: number, y: number, r: number, color: string, light: string, dark: string) {
  return (
    `<path d='M${x - r} ${y - r * 0.3}L${x - r * 0.5} ${y - r * 0.8}L${x + r * 0.5} ${y - r * 0.8}L${x + r} ${y - r * 0.3}L${x} ${y + r}Z' fill='${color}'/>` +
    `<path d='M${x - r} ${y - r * 0.3}L${x + r} ${y - r * 0.3}L${x} ${y + r}Z' fill='${dark}' opacity='.35'/>` +
    `<path d='M${x - r * 0.5} ${y - r * 0.8}L${x - r * 0.15} ${y - r * 0.3}L${x - r} ${y - r * 0.3}Z' fill='${light}' opacity='.7'/>`
  );
}

/* ------------------------------- dragons --------------------------------- */

/**
 * A dragon head in profile, facing left, its neck running into the bottom
 * right corner. 220×200.
 */
function dragonHead(c: { skin: string; dark: string; eye: string; horn: string }) {
  const head =
    `<path d='M220 200L220 150C205 135 185 115 170 95L188 88L168 84L184 72L163 72` +
    `C166 60 178 38 206 10C176 28 156 40 140 47C120 46 100 50 80 58C60 64 40 66 22 71L12 79` +
    `C28 84 44 86 58 88L72 96C54 100 36 104 22 112C42 119 70 121 96 118` +
    `C112 136 122 162 116 200Z' fill='${c.skin}'/>`;
  const horn = `<path d='M148 47C168 34 186 22 206 10C190 30 174 44 160 54Z' fill='${c.horn}'/>`;
  const brow = `<path d='M84 60C96 52 112 50 124 54C112 56 100 60 90 66Z' fill='${c.dark}'/>`;
  const eye = `<path d='M96 66C102 61 112 61 116 66C110 70 102 70 96 66Z' fill='${c.eye}'/><circle cx='107' cy='66' r='2' fill='${c.dark}'/>`;
  const nostril = `<path d='M28 74l8-2' stroke='${c.dark}' stroke-width='2.4' stroke-linecap='round'/>`;
  const teeth = `<path d='M30 87l4 5l3-5M42 88l4 5l3-5M50 101l3-6l4 5M38 104l3-6l4 5' fill='${c.horn}'/>`;
  let scales = '';
  for (const [x, y] of [[150, 120], [165, 140], [150, 158], [178, 160], [165, 180], [190, 182], [140, 178], [200, 140]] as P[])
    scales += `M${x - 8} ${y}Q${x} ${y + 9} ${x + 8} ${y}`;
  return head + horn + brow + eye + nostril + teeth + `<path d='${scales}' stroke='${c.dark}' stroke-width='1.6' fill='none' opacity='.55'/>`;
}

/** A dragon in flight, facing left, wings up. 260×170. */
function flyingDragon(c: { body: string; wing: string; ribs: string; belly: string }) {
  const backWing = `<path d='M108 92C104 66 96 44 80 20C84 40 80 48 66 50C76 60 72 68 60 72C78 78 92 86 108 92Z' fill='${c.wing}' opacity='.75'/>`;
  const wing = `<path d='M116 94C128 62 138 32 150 2L160 10C166 30 176 40 198 44C186 52 186 62 198 70C182 72 176 78 180 88C165 86 150 90 138 96Z' fill='${c.wing}'/>`;
  const ribs = `<path d='M120 92L152 8M128 92L194 46M136 94L194 70M142 95L178 88' stroke='${c.ribs}' stroke-width='1.6' fill='none' opacity='.7'/>`;
  const body =
    `<path d='M70 100C95 88 135 84 165 92C190 99 210 112 235 108C245 106 250 100 252 94L259 105L249 107L255 118L244 112` +
    `C230 122 205 122 180 116C150 110 120 116 92 116C82 116 74 110 70 100Z' fill='${c.body}'/>`;
  const head =
    `<path d='M78 108C62 96 52 86 42 81L38 68L36 79C26 77 16 80 6 86L20 90L10 97C24 98 36 97 48 99C58 105 66 113 82 115Z' fill='${c.body}'/>`;
  const legs = `<path d='M100 114L94 132L106 132L110 116ZM162 112L158 132L170 132L172 114Z' fill='${c.body}'/>`;
  const belly = `<path d='M84 112C110 108 140 106 170 110' stroke='${c.belly}' stroke-width='3' fill='none' stroke-linecap='round' opacity='.6'/>`;
  return backWing + body + head + legs + wing + ribs + belly;
}

/** A coiled, sleeping dragon, head resting bottom left. 240×160. */
function coiledDragon(c: { body: string; spine: string; belly: string; eye: string }) {
  const curve: [P, P, P, P] = [[46, 128], [40, 40], [190, 20], [214, 92]];
  const curve2: [P, P, P, P] = [[214, 92], [232, 150], [130, 160], [120, 112]];
  const body =
    `<path d='M46 128C40 40 190 20 214 92C232 150 130 160 120 112' stroke='${c.body}' stroke-width='26' fill='none' stroke-linecap='round'/>` +
    `<path d='M50 126C46 56 180 36 204 94C218 138 140 146 128 112' stroke='${c.belly}' stroke-width='5' fill='none' stroke-linecap='round' opacity='.55'/>`;
  const spine = spikes(curve, 9, 16, -12, c.spine, 0.08, 0.98) + spikes(curve2, 4, 12, -12, c.spine, 0.05, 0.6);
  const tail = `<path d='M120 112L104 96L112 116L100 124Z' fill='${c.body}'/>`;
  const head =
    `<path d='M60 120C46 112 26 112 10 120L4 128C18 132 30 134 44 140C56 144 64 138 62 128Z' fill='${c.body}'/>` +
    `<path d='M48 116L64 98L56 118Z' fill='${c.spine}'/>` +
    `<path d='M28 122q6 3 12 0' stroke='${c.eye}' stroke-width='2' fill='none' stroke-linecap='round'/>`;
  return body + spine + tail + head;
}

/* -------------------------------- fuego --------------------------------- */

function fuego(mode: 'light' | 'dark'): Art {
  const k =
    mode === 'light'
      ? { skin: '#3a1410', dark: '#1a0806', eye: '#ffb02e', horn: '#e9d7b8', f1: '#d9381e', f2: '#f28c28', f3: '#ffd25a', ember: '#d9381e', ash: '#7a4a3a' }
      : { skin: '#5a1a12', dark: '#120504', eye: '#ffd25a', horn: '#d8c3a0', f1: '#c2301b', f2: '#ff7b2e', f3: '#ffd25a', ember: '#ff7b2e', ash: '#5a3328' };
  const fire =
    flame(-6, 112, 70, 112, k.f1, 0.9) +
    flame(40, 112, 54, 86, k.f2) +
    flame(14, 112, 40, 60, k.f3) +
    flame(78, 112, 44, 70, k.f1, 0.85) +
    flame(108, 112, 34, 48, k.f2) +
    flame(62, 112, 26, 34, k.f3);
  const sparks = points(16, 140, 60, 11)
    .map(([x, y]) => `<circle cx='${x}' cy='${y}' r='${f1(1 + (x % 3) * 0.6)}' fill='${k.f3}' opacity='.8'/>`)
    .join('');
  const embers = points(22, 200, 200, 7)
    .map(([x, y], i) =>
      i % 3 === 0
        ? flame(x, y, 6, 12, k.ember, 0.35)
        : `<circle cx='${x}' cy='${y}' r='${i % 2 ? 1.6 : 1}' fill='${i % 4 ? k.ember : k.ash}' opacity='.45'/>`,
    )
    .join('');
  return {
    [`fuego-head-${mode}`]: svg(220, 200, dragonHead(k)),
    [`fuego-flames-${mode}`]: svg(140, 112, fire + sparks),
    [`fuego-embers-${mode}`]: svg(200, 200, embers),
  };
}

/* -------------------------------- hielo --------------------------------- */

function hielo(mode: 'light' | 'dark'): Art {
  const k =
    mode === 'light'
      ? { body: '#7fb3d6', spine: '#d9eef9', belly: '#ffffff', eye: '#1d3a52', ice: '#a9d3ec', iceDark: '#5f97bf', flake: '#7fb3d6' }
      : { body: '#3f6f94', spine: '#a9d3ec', belly: '#d9eef9', eye: '#d9eef9', ice: '#3f6f94', iceDark: '#28506f', flake: '#5f97bf' };
  let icicles = '';
  const rr = random(5);
  for (let x = 0; x < 200; x += 12) {
    const h = 10 + rr() * 26;
    icicles += `<path d='M${x} 0L${x + 12} 0L${f1(x + 6 + (rr() - 0.5) * 3)} ${f1(h)}Z' fill='${rr() > 0.5 ? k.ice : k.iceDark}'/>`;
  }
  icicles = `<rect width='200' height='6' fill='${k.ice}'/>` + icicles;
  const flakes =
    snowflake(40, 40, 30, k.flake, 2.2) + snowflake(96, 80, 18, k.flake, 1.6, 0.8) + snowflake(30, 108, 12, k.flake, 1.4, 0.7);
  const pattern = points(9, 180, 180, 21)
    .map(([x, y], i) => snowflake(x, y, i % 3 ? 5 : 9, k.flake, 1, 0.5))
    .join('') + points(14, 180, 180, 4).map(([x, y]) => sparkle(x, y, 2.5, k.flake, 0.5)).join('');
  return {
    [`hielo-dragon-${mode}`]: svg(240, 160, coiledDragon(k)),
    [`hielo-icicles-${mode}`]: svg(200, 64, icicles),
    [`hielo-flakes-${mode}`]: svg(130, 130, flakes),
    [`hielo-pattern-${mode}`]: svg(180, 180, pattern),
  };
}

/* -------------------------------- wyvern -------------------------------- */

function wyvern(mode: 'light' | 'dark'): Art {
  const k =
    mode === 'light'
      ? { body: '#1f5a3d', wing: '#2f7a52', ribs: '#0f3323', belly: '#9fd3a8', tree: '#2c5e40', tree2: '#3f7a52', scale: '#bfdcc6' }
      : { body: '#0c2a1c', wing: '#164430', ribs: '#5fae7f', belly: '#5fae7f', tree: '#0f2e20', tree2: '#164430', scale: '#1b3a2b' };
  const pine = (x: number, base: number, h: number, c: string) =>
    `<path d='M${x} ${base - h}L${x + h * 0.32} ${base - h * 0.55}L${x + h * 0.18} ${base - h * 0.55}L${x + h * 0.4} ${base - h * 0.2}L${x + h * 0.22} ${base - h * 0.2}L${x + h * 0.44} ${base}L${x - h * 0.44} ${base}L${x - h * 0.22} ${base - h * 0.2}L${x - h * 0.4} ${base - h * 0.2}L${x - h * 0.18} ${base - h * 0.55}L${x - h * 0.32} ${base - h * 0.55}Z' fill='${c}'/>`;
  const forest =
    pine(30, 150, 90, k.tree2) + pine(80, 150, 130, k.tree) + pine(140, 150, 100, k.tree2) + pine(190, 150, 140, k.tree) + pine(236, 150, 96, k.tree2) +
    `<rect y='146' width='260' height='4' fill='${k.tree}'/>`;
  // Overlapping scale arcs: a seamless 32×24 tile.
  const arcs = [[16, 0], [0, 12], [32, 12], [16, 24], [0, -12], [32, -12]] as P[];
  const scales = arcs.map(([x, y]) => `<path d='M${x - 16} ${y}A16 16 0 0 0 ${x + 16} ${y}' fill='none' stroke='${k.scale}' stroke-width='1.4'/>`).join('');
  return {
    [`wyvern-flying-${mode}`]: svg(260, 170, flyingDragon(k)),
    [`wyvern-forest-${mode}`]: svg(260, 150, forest),
    [`wyvern-scales-${mode}`]: svg(32, 24, scales),
  };
}

/* -------------------------------- tesoro -------------------------------- */

function tesoro(mode: 'light' | 'dark'): Art {
  const k =
    mode === 'light'
      ? { face: '#e8b730', edge: '#a0700c', shine: '#fff6c8', ruby: '#b3203c', emerald: '#1f8a5a', sapph: '#2f4fb8', light: '#ffffff', dark: '#1b1030', cup: '#c9961c', body: '#4b2a6b', spine: '#e8b730', belly: '#8a63ad', eye: '#e8b730' }
      : { face: '#d9a62a', edge: '#7a520a', shine: '#fff1b0', ruby: '#d1384f', emerald: '#2fae73', sapph: '#5274e0', light: '#ffffff', dark: '#000000', cup: '#b8861a', body: '#2a1640', spine: '#d9a62a', belly: '#5e3b80', eye: '#d9a62a' };
  let pile = `<path d='M0 170C30 120 80 92 130 90C180 92 220 120 240 170Z' fill='${k.edge}'/>`;
  const r = random(9);
  for (let i = 0; i < 28; i++) {
    const t = r();
    const x = 14 + t * 212;
    const top = 170 - Math.sin(t * Math.PI) * 76;
    const y = top + r() * (170 - top);
    pile += coin(f1(x), f1(y), 11 + r() * 4, k.face, k.edge, k.shine);
  }
  const goblet =
    `<path d='M150 40H190C190 64 182 76 170 78C158 76 150 64 150 40Z' fill='${k.cup}'/>` +
    `<path d='M167 78H173V98H184V104H156V98H167Z' fill='${k.cup}'/>` +
    `<circle cx='170' cy='56' r='5' fill='${k.ruby}'/>` +
    `<path d='M155 46q4 18 10 24' stroke='${k.shine}' stroke-width='2' fill='none' opacity='.7'/>`;
  const gems = gem(70, 108, 12, k.ruby, k.light, k.dark) + gem(110, 92, 10, k.emerald, k.light, k.dark) + gem(206, 128, 11, k.sapph, k.light, k.dark) + gem(40, 140, 9, k.emerald, k.light, k.dark);
  const glints = sparkle(120, 70, 9, k.shine) + sparkle(60, 86, 6, k.shine) + sparkle(214, 100, 7, k.shine);
  // The tail of the dragon sleeping on the hoard, curling in from the left.
  const tailCurve: [P, P, P, P] = [[-20, 120], [60, 60], [150, 150], [90, 150]];
  const tail =
    `<path d='M-20 120C60 60 150 150 90 150' stroke='${k.body}' stroke-width='18' fill='none' stroke-linecap='round'/>` +
    spikes(tailCurve, 6, 12, -9, k.spine, 0.1, 0.85) +
    `<path d='M90 150L70 136L78 154L66 166Z' fill='${k.body}'/>`;
  const pattern =
    points(8, 160, 160, 31).map(([x, y]) => coin(x, y, 5, k.face, k.edge, k.shine)).join('') +
    points(6, 160, 160, 32).map(([x, y], i) => gem(x, y, 4, [k.ruby, k.emerald, k.sapph][i % 3]!, k.light, k.dark)).join('');
  return {
    [`tesoro-hoard-${mode}`]: svg(240, 170, pile + gems + goblet + glints),
    [`tesoro-tail-${mode}`]: svg(170, 170, tail),
    [`tesoro-pattern-${mode}`]: `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160' opacity='.4'>${pattern}</svg>`,
  };
}

/* --------------------------------- mapa --------------------------------- */

function mapa(mode: 'light' | 'dark'): Art {
  const k =
    mode === 'light'
      ? { ink: '#5a3d22', red: '#9c2b1c', sea: '#7d9aa0', paper: '#e9d6ad' }
      : { ink: '#c9a978', red: '#e0705a', sea: '#4f6a70', paper: '#2a2116' };
  let rose = `<circle cx='80' cy='80' r='62' fill='none' stroke='${k.ink}' stroke-width='1.4'/><circle cx='80' cy='80' r='56' fill='none' stroke='${k.ink}' stroke-width='.8' stroke-dasharray='2 3'/>`;
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i - Math.PI / 2;
    const long = i % 2 === 0;
    const L = long ? 58 : 34;
    const w = long ? 9 : 6;
    const tip: P = [80 + Math.cos(a) * L, 80 + Math.sin(a) * L];
    const s1: P = [80 + Math.cos(a + Math.PI / 2) * w, 80 + Math.sin(a + Math.PI / 2) * w];
    const s2: P = [80 + Math.cos(a - Math.PI / 2) * w, 80 + Math.sin(a - Math.PI / 2) * w];
    rose += `<path d='M80 80L${f1(s1[0])} ${f1(s1[1])}L${f1(tip[0])} ${f1(tip[1])}Z' fill='${i === 0 ? k.red : k.ink}'/>`;
    rose += `<path d='M80 80L${f1(s2[0])} ${f1(s2[1])}L${f1(tip[0])} ${f1(tip[1])}Z' fill='${k.paper}' stroke='${i === 0 ? k.red : k.ink}' stroke-width='.8'/>`;
  }
  rose += `<text x='80' y='14' text-anchor='middle' font-family='Georgia,serif' font-size='13' font-weight='bold' fill='${k.red}'>N</text>`;
  // Sea serpent humps among waves, with the warning every old map has.
  let waves = '';
  for (let y = 108; y <= 150; y += 14)
    for (let x = (y / 14) % 2 ? 0 : 14; x < 240; x += 28) waves += `M${x} ${y}q7 -6 14 0`;
  const serpent =
    `<path d='M30 104C40 70 64 70 70 100M96 104C104 76 126 76 132 104M156 104C164 82 182 82 188 104' stroke='${k.ink}' stroke-width='9' fill='none' stroke-linecap='round'/>` +
    `<path d='M30 104C22 84 8 80 0 86C8 88 12 92 14 98Z' fill='${k.ink}'/>` +
    `<path d='M4 80L10 70L12 82Z' fill='${k.ink}'/>` +
    `<path d='M188 104C196 92 206 90 214 80L210 98Z' fill='${k.ink}'/>` +
    `<path d='M40 82l4-8l3 9M104 82l4-8l3 9M164 86l4-8l3 9' fill='${k.ink}'/>` +
    `<path d='${waves}' stroke='${k.sea}' stroke-width='1.6' fill='none'/>` +
    `<text x='120' y='176' text-anchor='middle' font-family='Georgia,serif' font-style='italic' font-size='15' fill='${k.red}'>Aquí hay dragones</text>`;
  // Mountains, a castle and the dotted road between them.
  let mountains = '';
  for (const [x, h] of [[30, 60], [70, 84], [112, 66], [150, 50]] as P[])
    mountains += `<path d='M${x - h * 0.7} 150L${x} ${150 - h}L${x + h * 0.7} 150' fill='${k.paper}' stroke='${k.ink}' stroke-width='1.8'/><path d='M${x} ${150 - h}L${f1(x - h * 0.2)} ${f1(150 - h * 0.6)}M${x} ${150 - h}L${f1(x + h * 0.15)} ${f1(150 - h * 0.55)}' stroke='${k.ink}' stroke-width='1.2' fill='none'/>`;
  const castle =
    `<path d='M180 150V112H186V104H192V112H202V96H208V88H214V96H220V112H228V104H234V112H240V150Z' fill='${k.paper}' stroke='${k.ink}' stroke-width='1.8'/>` +
    `<path d='M206 150V136Q211 128 216 136V150' fill='${k.ink}'/><path d='M214 88V74L226 79L214 84' fill='${k.red}' stroke='${k.ink}' stroke-width='1'/>`;
  const road = `<path d='M0 170C40 160 80 172 120 162S170 150 196 156' stroke='${k.red}' stroke-width='2' stroke-dasharray='5 5' fill='none'/><path d='M190 150l12 12M202 150l-12 12' stroke='${k.red}' stroke-width='2.4'/>`;
  // Faint map grid with tiny trees: the repeating paper.
  let trees = '';
  for (const [x, y] of points(7, 220, 220, 41)) trees += `M${x} ${y}l-4 8h8z`;
  const grid = `<path d='M0 0H220M0 110H220M0 0V220M110 0V220' stroke='${k.ink}' stroke-width='.6' opacity='.25'/><path d='${trees}' fill='${k.ink}' opacity='.18'/>`;
  return {
    [`mapa-rose-${mode}`]: svg(160, 160, rose),
    [`mapa-serpent-${mode}`]: svg(240, 184, serpent),
    [`mapa-land-${mode}`]: svg(240, 176, mountains + castle + road),
    [`mapa-grid-${mode}`]: svg(220, 220, grid),
  };
}

/* -------------------------------- torneo -------------------------------- */

function torneo(mode: 'light' | 'dark'): Art {
  const k =
    mode === 'light'
      ? { red: '#b3202c', blue: '#1f4e9c', gold: '#d9a62a', white: '#fbf6ea', rope: '#5a3d22', wood: '#8a5a2b', diamond: '#e8dcc2' }
      : { red: '#a3202b', blue: '#2a5bb0', gold: '#c99a26', white: '#e8dcc2', rope: '#8a6a44', wood: '#6b4520', diamond: '#1c1a26' };
  const colors = [k.red, k.white, k.blue, k.gold];
  let bunting = `<path d='M0 6Q120 40 260 4' stroke='${k.rope}' stroke-width='2' fill='none'/>`;
  for (let i = 0; i < 10; i++) {
    const x = 6 + i * 25;
    const y = 6 + Math.sin(((x + 10) / 260) * Math.PI) * 18;
    bunting += `<path d='M${x} ${f1(y)}L${x + 22} ${f1(y + 1)}L${x + 11} ${f1(y + 34)}Z' fill='${colors[i % 4]}'/>`;
  }
  const shield = (x: number, y: number, a: string, b: string, charge: string) =>
    `<g transform='translate(${x} ${y})'><path d='M-30 -34H30V0C30 24 12 36 0 44C-12 36 -30 24 -30 0Z' fill='${a}' stroke='${k.rope}' stroke-width='3'/>` +
    `<path d='M0 -34H30V0C30 24 12 36 0 44Z' fill='${b}'/>` +
    `<path d='M-30 -6H30' stroke='${k.gold}' stroke-width='6'/>` +
    star(0, -16, 9, charge) + `</g>`;
  const lances =
    `<path d='M20 170L200 10' stroke='${k.wood}' stroke-width='7' stroke-linecap='round'/><path d='M200 10L214 0L206 16Z' fill='${k.white}'/>` +
    `<path d='M220 170L40 10' stroke='${k.wood}' stroke-width='7' stroke-linecap='round'/><path d='M40 10L26 0L34 16Z' fill='${k.white}'/>` +
    `<path d='M160 46l22 -4l-8 14z' fill='${k.red}'/><path d='M80 46l-22 -4l8 14z' fill='${k.blue}'/>`;
  const shields = svg(240, 180, lances + shield(120, 110, k.red, k.blue, k.gold));
  const tent =
    `<path d='M90 20L170 120H10Z' fill='${k.white}'/>` +
    `<path d='M90 20L110 120H70Z' fill='${k.red}'/><path d='M90 20L150 120H130Z' fill='${k.red}'/><path d='M90 20L50 120H30Z' fill='${k.red}'/>` +
    `<path d='M90 20V2' stroke='${k.rope}' stroke-width='2'/><path d='M90 2L108 7L90 12Z' fill='${k.blue}'/>` +
    `<path d='M80 120L90 84L100 120Z' fill='${k.rope}'/>`;
  // Harlequin diamonds: a seamless 40×60 tile.
  const harlequin = `<path d='M20 0L40 30L20 60L0 30Z' fill='${k.diamond}'/>`;
  return {
    [`torneo-bunting-${mode}`]: svg(260, 48, bunting),
    [`torneo-shields-${mode}`]: shields,
    [`torneo-tent-${mode}`]: svg(180, 122, tent),
    [`torneo-harlequin-${mode}`]: svg(40, 60, harlequin),
  };
}

/* ------------------------------- grimorio ------------------------------- */

const RUNES = ['M0 -6V6M0 -6L4 -2M0 0L4 4', 'M-3 -6V6M-3 -6L3 0L-3 6', 'M0 -6V6M-4 -2L4 2', 'M-4 6L0 -6L4 6M-2 1H2', 'M-3 -6V6M3 -6V6M-3 0L3 -3', 'M-4 -6L4 6M4 -6L-4 6M0 -6V6', 'M0 -6L4 0L0 6L-4 0Z', 'M-3 -6V6H3'];

function grimorio(mode: 'light' | 'dark'): Art {
  const k =
    mode === 'light'
      ? { glow: '#7c3fc0', glow2: '#b88ae8', wax: '#efe3c8', flame: '#f2a531', flame2: '#ffe08a', holder: '#4a2a5e', body: '#3b2257', wing: '#5b3a85', ribs: '#2a1540', belly: '#b88ae8', rune: '#7c3fc0' }
      : { glow: '#b98cff', glow2: '#e2cfff', wax: '#d9ccb0', flame: '#ffb347', flame2: '#fff0b0', holder: '#2a1838', body: '#7c5ab0', wing: '#9b7ad0', ribs: '#e2cfff', belly: '#e2cfff', rune: '#b98cff' };
  let circle =
    `<circle cx='110' cy='110' r='100' fill='none' stroke='${k.glow}' stroke-width='3'/>` +
    `<circle cx='110' cy='110' r='86' fill='none' stroke='${k.glow}' stroke-width='1.4'/>` +
    `<circle cx='110' cy='110' r='100' fill='none' stroke='${k.glow2}' stroke-width='9' opacity='.25'/>`;
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI * 2 * i) / 16;
    circle += `<path d='${RUNES[i % RUNES.length]}' transform='translate(${f1(110 + Math.cos(a) * 93)} ${f1(110 + Math.sin(a) * 93)}) rotate(${f1((a * 180) / Math.PI + 90)})' stroke='${k.glow}' stroke-width='1.6' fill='none' stroke-linecap='round'/>`;
  }
  // Two interlaced triangles inside the circle.
  const tri = (rot: number) => {
    const p = [0, 1, 2].map((i) => {
      const a = rot + (Math.PI * 2 * i) / 3;
      return `${f1(110 + Math.cos(a) * 82)} ${f1(110 + Math.sin(a) * 82)}`;
    });
    return `M${p.join('L')}Z`;
  };
  circle += `<path d='${tri(-Math.PI / 2)}${tri(Math.PI / 2)}' stroke='${k.glow}' stroke-width='1.6' fill='none'/>` + sparkle(110, 110, 16, k.glow2) + sparkle(110, 110, 8, k.glow);
  const candle = (x: number, h: number) =>
    `<rect x='${x - 9}' y='${150 - h}' width='18' height='${h}' fill='${k.wax}'/>` +
    `<path d='M${x - 9} ${150 - h}q4 8 0 14' stroke='${k.wax}' stroke-width='4' fill='none'/>` +
    `<circle cx='${x}' cy='${150 - h - 12}' r='16' fill='${k.flame2}' opacity='.25'/>` +
    flame(x, 150 - h - 2, 10, 22, k.flame) + flame(x, 150 - h - 3, 5, 12, k.flame2);
  const candles = candle(26, 70) + candle(62, 104) + candle(100, 50) + `<rect x='4' y='148' width='120' height='8' rx='3' fill='${k.holder}'/>`;
  const pattern =
    points(10, 180, 180, 51).map(([x, y], i) => `<path d='${RUNES[i % RUNES.length]}' transform='translate(${x} ${y})' stroke='${k.rune}' stroke-width='1.3' fill='none' stroke-linecap='round' opacity='.35'/>`).join('') +
    points(10, 180, 180, 52).map(([x, y]) => sparkle(x, y, 3, k.glow2, 0.55)).join('');
  return {
    [`grimorio-circle-${mode}`]: svg(220, 220, circle),
    [`grimorio-candles-${mode}`]: svg(130, 158, candles),
    [`grimorio-familiar-${mode}`]: svg(260, 170, flyingDragon(k)),
    [`grimorio-pattern-${mode}`]: svg(180, 180, pattern),
  };
}

/* --------------------------------- forja -------------------------------- */

function forja(mode: 'light' | 'dark'): Art {
  const k =
    mode === 'light'
      ? { iron: '#3d3f45', iron2: '#5c5f66', hi: '#8a8e96', wood: '#7a4a24', hot: '#e8541e', hot2: '#ffb347', hot3: '#ffe08a', rivet: '#d4d6db' }
      : { iron: '#1c1d21', iron2: '#2e3036', hi: '#555963', wood: '#5a3418', hot: '#ff6a2a', hot2: '#ffb347', hot3: '#fff0b0', rivet: '#24262b' };
  const anvil =
    `<path d='M20 60H200C200 74 186 82 160 84C150 86 146 94 146 104H90C90 94 86 86 70 82C40 78 20 70 20 60Z' fill='${k.iron}'/>` +
    `<path d='M20 60C10 60 0 56 0 50H40V60Z' fill='${k.iron}'/>` +
    `<path d='M24 60H198' stroke='${k.hi}' stroke-width='3'/>` +
    `<path d='M70 104H166L180 130H56Z' fill='${k.iron2}'/>` +
    `<rect x='40' y='130' width='160' height='40' fill='${k.wood}'/><path d='M40 142H200M40 156H200' stroke='${k.iron}' stroke-width='1.4' opacity='.5'/>` +
    // the glowing blade on the anvil
    `<path d='M64 56H170L184 52L170 48H64Z' fill='${k.hot}'/><path d='M70 53H168' stroke='${k.hot3}' stroke-width='1.6'/>`;
  const hammer =
    `<g transform='translate(158 4) rotate(28)'><rect x='-5' y='0' width='10' height='70' fill='${k.wood}'/><rect x='-22' y='-14' width='44' height='20' fill='${k.iron2}'/><rect x='-22' y='-14' width='44' height='4' fill='${k.hi}'/></g>`;
  const sparks =
    points(26, 120, 70, 61)
      .map(([x, y], i) => `<path d='M${x + 60} ${y}l${i % 2 ? 6 : -6} -${4 + (i % 4)}' stroke='${i % 3 ? k.hot2 : k.hot3}' stroke-width='2' stroke-linecap='round'/>`)
      .join('') + sparkle(110, 40, 8, k.hot3) + sparkle(150, 26, 5, k.hot2);
  const fire =
    `<rect x='0' y='96' width='150' height='24' fill='${k.iron}'/><rect x='0' y='96' width='150' height='4' fill='${k.hi}'/>` +
    flame(20, 98, 34, 60, k.hot) + flame(56, 98, 40, 82, k.hot) + flame(96, 98, 34, 56, k.hot) +
    flame(38, 98, 24, 40, k.hot2) + flame(76, 98, 26, 50, k.hot2) + flame(56, 98, 14, 26, k.hot3) + flame(118, 98, 22, 34, k.hot2);
  // Riveted plates: a 64×64 tile.
  const plates = `<path d='M0 .5H64M.5 0V64' stroke='${k.rivet}' stroke-width='1'/>` + [[6, 6], [58, 6], [6, 58], [58, 58]].map(([x, y]) => `<circle cx='${x}' cy='${y}' r='2' fill='${k.rivet}'/>`).join('');
  const embers = points(18, 160, 160, 62).map(([x, y], i) => `<circle cx='${x}' cy='${y}' r='${i % 3 ? 1 : 1.8}' fill='${i % 2 ? k.hot : k.hot2}' opacity='.4'/>`).join('');
  return {
    [`forja-anvil-${mode}`]: svg(220, 170, anvil + hammer + sparks),
    [`forja-fire-${mode}`]: svg(150, 120, fire),
    [`forja-plates-${mode}`]: svg(64, 64, plates),
    [`forja-embers-${mode}`]: svg(160, 160, embers),
  };
}

/**
 * Corner pieces sit behind whatever text falls on the background (the titles
 * under the posters, the page title), so they are toned down: bottom ones a
 * lot, top ones a little. Patterns already carry their own opacity.
 */
const BOTTOM = ['fuego-head', 'fuego-flames', 'hielo-dragon', 'hielo-flakes', 'wyvern-forest', 'tesoro-hoard', 'tesoro-tail', 'mapa-serpent', 'mapa-land', 'torneo-shields', 'torneo-tent', 'grimorio-circle', 'grimorio-candles', 'forja-anvil', 'forja-fire'];
const TOP = ['hielo-icicles', 'wyvern-flying', 'mapa-rose', 'torneo-bunting', 'grimorio-familiar'];
const OPACITY = { light: { bottom: 0.5, top: 0.85 }, dark: { bottom: 0.55, top: 0.75 } };

function fade(markup: string, opacity: number) {
  const open = markup.indexOf('>') + 1;
  return `${markup.slice(0, open)}<g opacity='${opacity}'>${markup.slice(open, -'</svg>'.length)}</g></svg>`;
}

const art: Art = {};
for (const draw of [fuego, hielo, wyvern, tesoro, mapa, torneo, grimorio, forja])
  for (const mode of ['light', 'dark'] as const)
    for (const [name, markup] of Object.entries(draw(mode))) {
      const piece = name.slice(0, -mode.length - 1);
      art[name] = BOTTOM.includes(piece)
        ? fade(markup, OPACITY[mode].bottom)
        : TOP.includes(piece)
          ? fade(markup, OPACITY[mode].top)
          : markup;
    }

export default art;
