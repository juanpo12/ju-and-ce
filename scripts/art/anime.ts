/**
 * Textures for the anime themes: sakura, shonen, manga, magica, mecha,
 * neotokio, espiritus and samurai. Each theme draws its corner pieces and its
 * repeating pattern once per mode, with that mode's palette.
 */
import { g, heart, points, random, sparkle, star, svg } from './shared';

type Mode = 'light' | 'dark';
const MODES: Mode[] = ['light', 'dark'];
const out: Record<string, string> = {};
const add = (name: string, content: string) => (out[name] = content);

/* --------------------------------- helpers -------------------------------- */

/** Five-petal blossom centered on (x, y). */
function blossom(x: number, y: number, r: number, petal: string, core: string, rot = 0, opacity = 1): string {
  const petals = [0, 72, 144, 216, 288]
    .map((a) => `<ellipse cx='0' cy='${-r * 0.55}' rx='${r * 0.42}' ry='${r * 0.6}' transform='rotate(${a})'/>`)
    .join('');
  return g(
    `translate(${x} ${y}) rotate(${rot})`,
    `<g fill='${petal}' opacity='${opacity}'>${petals}</g>`,
    `<circle r='${r * 0.2}' fill='${core}' opacity='${opacity}'/>`,
  );
}

/** A single falling petal (notched teardrop). */
function petal(x: number, y: number, s: number, color: string, rot: number, opacity: number): string {
  return `<path transform='translate(${x} ${y}) rotate(${rot}) scale(${s})' d='M0 -6C4 -6 6 -1 4 3C3 5 1 6 0 5C-1 6 -3 5 -4 3C-6 -1 -4 -6 0 -6Z' fill='${color}' opacity='${opacity}'/>`;
}

/** Jagged impact burst (manga "pow" shape). */
function burst(cx: number, cy: number, r1: number, r2: number, n: number, fill: string, stroke: string, sw: number, seed: number): string {
  const rnd = random(seed);
  const p: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI / n) * i;
    const r = i % 2 ? r2 * (0.85 + rnd() * 0.3) : r1 * (0.85 + rnd() * 0.3);
    p.push(`${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return `<path d='M${p.join('L')}Z' fill='${fill}' stroke='${stroke}' stroke-width='${sw}' stroke-linejoin='round'/>`;
}

/** Radial speed lines from (cx, cy): thin wedges. */
function speedLines(cx: number, cy: number, rIn: number, rOut: number, n: number, color: string, seed: number, opacity = 1): string {
  const rnd = random(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + rnd() * 0.05;
    const w = 0.006 + rnd() * 0.018;
    const r0 = rIn * (0.8 + rnd() * 0.5);
    const p = (r: number, aa: number) => `${(cx + Math.cos(aa) * r).toFixed(1)} ${(cy + Math.sin(aa) * r).toFixed(1)}`;
    d += `M${p(r0, a)}L${p(rOut, a - w)}L${p(rOut, a + w)}Z`;
  }
  return `<path d='${d}' fill='${color}' opacity='${opacity}'/>`;
}

const text = (x: number, y: number, s: number, fill: string, content: string, extra = '') =>
  `<text x='${x}' y='${y}' font-family='Impact, Haettenschweiler, Arial Black, sans-serif' font-size='${s}' font-weight='900' fill='${fill}' ${extra}>${content}</text>`;

/* --------------------------------- sakura --------------------------------- */

const SAKURA = {
  light: { wood: '#5b3a33', petal: '#f6a9c2', petal2: '#fbd0de', core: '#c2416f', fall: '#f29bb9', lantern: '#e85d4a', glow: '#ffd27a', o: 0.9 },
  dark: { wood: '#3a2730', petal: '#e98cb0', petal2: '#c97497', core: '#ffd27a', fall: '#d77aa0', lantern: '#e85d4a', glow: '#ffcf6b', o: 0.7 },
};

for (const m of MODES) {
  const c = SAKURA[m];
  const rnd = random(11);
  // Branch coming in from the right edge, blossoms along it.
  let flowers = '';
  const along: [number, number, number][] = [
    [250, 170, 15], [215, 150, 13], [190, 120, 11], [160, 104, 12], [130, 86, 10], [100, 74, 9], [205, 190, 12],
    [176, 168, 11], [228, 118, 10], [140, 126, 9], [80, 60, 8], [250, 130, 11],
  ];
  for (const [x, y, r] of along) flowers += blossom(x, y, r, rnd() > 0.4 ? c.petal : c.petal2, c.core, rnd() * 72, c.o);
  const buds = points(10, 200, 120, 12).map(([x, y]) => `<circle cx='${x + 60}' cy='${y + 50}' r='2.2' fill='${c.petal}' opacity='${c.o}'/>`).join('');
  const branch = `<g fill='none' stroke='${c.wood}' stroke-linecap='round' opacity='${c.o}'>
    <path d='M280 200 C230 180 190 140 150 110 S90 70 60 50' stroke-width='9'/>
    <path d='M230 180 C210 200 190 210 170 214' stroke-width='5'/>
    <path d='M190 140 C200 120 215 110 235 108' stroke-width='4'/>
    <path d='M150 110 C140 128 135 140 128 150' stroke-width='3.5'/></g>`;
  let lanterns = '';
  if (m === 'dark') {
    lanterns = [[96, 150], [60, 110]].map(([x, y]) =>
      `<line x1='${x}' y1='${y! - 40}' x2='${x}' y2='${y! - 14}' stroke='${c.wood}' stroke-width='1.5'/>
       <circle cx='${x}' cy='${y}' r='22' fill='${c.glow}' opacity='0.18'/>
       <ellipse cx='${x}' cy='${y}' rx='12' ry='15' fill='${c.lantern}'/>
       <path d='M${x! - 12} ${y} h24 M${x! - 11} ${y! - 6} h22 M${x! - 11} ${y! + 6} h22' stroke='#9c2f22' stroke-width='1'/>
       <rect x='${x! - 6}' y='${y! - 18}' width='12' height='4' fill='#2b1a14'/><rect x='${x! - 6}' y='${y! + 14}' width='12' height='4' fill='#2b1a14'/>`).join('');
  }
  add(`sakura-branch-${m}`, svg(280, 230, lanterns + branch + buds + flowers));

  // Small hanging twig for the top right.
  let top = `<path d='M180 0 C170 30 150 50 120 70' stroke='${c.wood}' stroke-width='5' fill='none' stroke-linecap='round' opacity='${c.o}'/>`;
  for (const [x, y, r] of [[170, 30, 11], [150, 52, 10], [124, 68, 9], [140, 30, 8], [175, 60, 8]] as const)
    top += blossom(x, y, r, c.petal, c.core, x, c.o);
  add(`sakura-twig-${m}`, svg(180, 100, top));

  // Petals drifting.
  const fall = points(26, 300, 300, 13)
    .map(([x, y], i) => petal(x, y, 0.8 + ((i * 37) % 10) / 12, i % 3 ? c.fall : c.petal2, (i * 47) % 360, m === 'light' ? 0.55 : 0.45))
    .join('');
  add(`sakura-petals-${m}`, svg(300, 300, fall));
}

/* --------------------------------- shonen --------------------------------- */

const SHONEN = {
  light: { ink: '#1a1410', fire: '#f26a1b', yellow: '#ffc21a', paper: '#fff3d6', lines: '#1a1410', lo: 0.35 },
  dark: { ink: '#000000', fire: '#ff7a2e', yellow: '#ffc21a', paper: '#14100c', lines: '#ff9a4a', lo: 0.3 },
};

for (const m of MODES) {
  const c = SHONEN[m];
  // Corner burst: speed lines converging on an off-screen hit + a POW star.
  const body =
    speedLines(300, 300, 70, 420, 90, c.lines, 21, c.lo) +
    burst(220, 215, 78, 40, 13, c.yellow, c.ink, 5, 22) +
    burst(220, 215, 48, 26, 11, c.fire, c.ink, 3, 23) +
    text(178, 232, 40, c.ink, '¡PAM!', `transform='rotate(-10 220 215)' stroke='${c.yellow}' stroke-width='1.5' paint-order='stroke'`);
  add(`shonen-burst-${m}`, svg(300, 300, body));

  // Top right: small impact star with sweat drops of energy.
  const small =
    burst(110, 60, 46, 22, 9, c.fire, c.ink, 4, 24) +
    burst(110, 60, 22, 11, 7, c.yellow, c.ink, 2.5, 25) +
    [[40, 20], [30, 60], [48, 98]].map(([x, y]) => `<path d='M${x} ${y}l-24 ${(y! - 60) / 4}' stroke='${c.lines}' stroke-width='5' stroke-linecap='round' opacity='${c.lo}'/>`).join('');
  add(`shonen-star-${m}`, svg(160, 120, small));

  // Pattern: diagonal action streaks.
  const rnd = random(26);
  let d = '';
  for (let i = 0; i < 14; i++) {
    const x = rnd() * 240;
    const y = rnd() * 240;
    const l = 30 + rnd() * 50;
    d += `M${x.toFixed(0)} ${y.toFixed(0)}l${l.toFixed(0)} ${(-l * 0.35).toFixed(0)}`;
  }
  add(`shonen-streaks-${m}`, svg(240, 240, `<path d='${d}' stroke='${m === 'light' ? '#e6a347' : '#5a3a1e'}' stroke-width='3' stroke-linecap='round' opacity='0.55'/>`));
}

/* ---------------------------------- manga --------------------------------- */

const MANGA = {
  light: { ink: '#111111', paper: '#ffffff', tone: '#111111', toneO: 0.16, red: '#b80f2a' },
  dark: { ink: '#f5f5f5', paper: '#0d0d0d', tone: '#f5f5f5', toneO: 0.12, red: '#ff5a6e' },
};

for (const m of MODES) {
  const c = MANGA[m];
  // Screentone: a 10px halftone grid, offset every other row.
  add(`manga-tone-${m}`, svg(10, 10, `<g fill='${c.tone}' opacity='${c.toneO}'><circle cx='2.5' cy='2.5' r='1.2'/><circle cx='7.5' cy='7.5' r='1.2'/></g>`));

  // Bottom right: a tilted panel with speed lines and a shout bubble.
  const panel = `<g transform='rotate(-4 160 150)'>
    <rect x='40' y='40' width='250' height='230' fill='${c.paper}' stroke='${c.ink}' stroke-width='6'/>
    <clipPath id='p'><rect x='40' y='40' width='250' height='230'/></clipPath>
    <g clip-path='url(#p)'>${speedLines(230, 230, 40, 300, 70, c.ink, 31, 0.45)}</g></g>`;
  const bubble = burst(150, 120, 92, 66, 16, c.paper, c.ink, 5, 32) + text(98, 138, 46, c.ink, '¡¿EH?!');
  add(`manga-panel-${m}`, svg(300, 300, panel + bubble));

  // Top right: sound effect lettering.
  const sfx = text(10, 70, 64, c.red, 'DOKI', `transform='rotate(8 80 50)' stroke='${c.paper}' stroke-width='4' paint-order='stroke'`) +
    text(110, 112, 40, c.red, 'DOKI', `transform='rotate(14 140 100)' stroke='${c.paper}' stroke-width='3' paint-order='stroke'`);
  add(`manga-sfx-${m}`, svg(200, 130, sfx));

  // Bottom left: round speech bubble with a tail.
  const talk = `<path d='M20 70 C20 30 70 12 110 12 C160 12 196 36 196 70 C196 104 160 126 112 126 C96 126 82 124 70 120 L34 146 L48 112 C30 102 20 88 20 70Z' fill='${c.paper}' stroke='${c.ink}' stroke-width='4'/>` +
    `<g fill='${c.ink}'><circle cx='80' cy='70' r='6'/><circle cx='108' cy='70' r='6'/><circle cx='136' cy='70' r='6'/></g>`;
  add(`manga-bubble-${m}`, svg(200, 150, talk));
}

/* --------------------------------- magica --------------------------------- */

const MAGICA = {
  light: { pink: '#ff8fcf', lilac: '#c49bff', mint: '#7fe0c4', gold: '#ffc94d', rib: '#ff6fb5', wand: '#ffffff', edge: '#b0359a', o: 0.95, po: 0.6 },
  dark: { pink: '#ff8fd6', lilac: '#b58cff', mint: '#6fe0c0', gold: '#ffd66b', rib: '#ff6fb5', wand: '#fff3fb', edge: '#ff9be0', o: 0.85, po: 0.5 },
};

for (const m of MODES) {
  const c = MAGICA[m];
  // Bottom right: crescent-moon wand with a heart jewel and ribbons.
  const wand =
    `<g transform='rotate(-35 170 170)'>` +
    `<rect x='164' y='120' width='12' height='170' rx='6' fill='${c.wand}' stroke='${c.edge}' stroke-width='2.5'/>` +
    `<path d='M150 150 q20 10 40 0' stroke='${c.edge}' stroke-width='2' fill='none'/>` +
    // crescent
    `<path d='M170 20 a56 56 0 1 0 50 84 a44 44 0 1 1 -50 -84Z' fill='${c.gold}' stroke='${c.edge}' stroke-width='3'/>` +
    heart(162, 76, 20, c.pink) + `<path d='M162 76' />` +
    // ribbons
    `<path d='M170 128 C140 140 120 170 132 200 C140 180 152 160 170 150 Z' fill='${c.rib}'/>` +
    `<path d='M170 128 C200 140 222 168 212 200 C202 180 188 160 170 150 Z' fill='${c.lilac}'/>` +
    `</g>`;
  const glints = [[60, 80, 14, c.gold], [250, 40, 10, c.mint], [90, 200, 9, c.lilac], [260, 230, 12, c.pink], [40, 150, 7, c.mint]]
    .map(([x, y, r, col]) => sparkle(x as number, y as number, r as number, col as string, c.o)).join('');
  add(`magica-wand-${m}`, svg(300, 300, `<g opacity='${c.o}'>${wand}</g>` + glints));

  // Top right: crescent with stars.
  const moon = `<path d='M130 14 a48 48 0 1 0 44 70 a38 38 0 1 1 -44 -70Z' fill='${c.gold}' opacity='${c.o}'/>` +
    star(60, 40, 12, c.pink, c.o) + star(30, 90, 8, c.lilac, c.o) + sparkle(96, 104, 10, c.mint, c.o) + heart(176, 22, 7, c.pink, c.o);
  add(`magica-moon-${m}`, svg(200, 130, moon));

  // Pattern: sparkles, hearts and stars.
  const pts = points(18, 260, 260, 41);
  const pat = pts
    .map(([x, y], i) =>
      i % 3 === 0 ? sparkle(x, y, 6, c.lilac, c.po) : i % 3 === 1 ? heart(x, y, 4.5, c.pink, c.po) : star(x, y, 4.5, c.mint, c.po),
    )
    .join('');
  add(`magica-sparkles-${m}`, svg(260, 260, pat));
}

/* ---------------------------------- mecha --------------------------------- */

const MECHA = {
  light: { body: '#f2f4f6', line: '#15181c', blue: '#2a56b8', red: '#c4302b', yellow: '#f5b800', eye: '#25d0ff', grid: '#b9bec5', o: 1 },
  dark: { body: '#2b323b', line: '#06080a', blue: '#3c6fd8', red: '#e0453e', yellow: '#f5b800', eye: '#3ff0ff', grid: '#262c34', o: 0.92 },
};

for (const m of MODES) {
  const c = MECHA[m];
  // Bottom right: a robot head with V-fin and glowing visor, peeking up.
  const head =
    `<g stroke='${c.line}' stroke-width='4' stroke-linejoin='round' opacity='${c.o}'>` +
    `<path d='M150 60 L80 10 L140 70Z M170 60 L240 10 L180 70Z' fill='${c.yellow}'/>` +
    `<path d='M95 90 L130 62 H190 L225 90 L235 170 L210 230 H110 L85 170Z' fill='${c.body}'/>` +
    `<path d='M110 118 H210 L200 150 H120Z' fill='${c.line}'/>` +
    `<path d='M124 128 H196 L190 142 H130Z' fill='${c.eye}' stroke='none'/>` +
    `<path d='M140 62 h40 v20 h-40Z' fill='${c.red}'/>` +
    `<path d='M135 175 h50 v30 h-50Z M145 185 h30 M145 195 h30' fill='${c.blue}'/>` +
    `<path d='M60 200 L95 170 L110 230 L60 250Z M260 200 L225 170 L210 230 L260 250Z' fill='${c.blue}'/>` +
    `</g>` +
    `<circle cx='160' cy='135' r='60' fill='${c.eye}' opacity='0.12'/>`;
  add(`mecha-head-${m}`, svg(320, 250, head));

  // Bottom left: hazard stripes block with a warning label.
  const stripes = `<clipPath id='h'><path d='M0 30 L200 0 V90 H0Z'/></clipPath><g clip-path='url(#h)'>
    <rect width='200' height='90' fill='${c.yellow}'/>
    ${Array.from({ length: 12 }, (_, i) => `<path d='M${i * 28 - 60} 90 L${i * 28 - 30} 0 H${i * 28 - 16} L${i * 28 - 46} 90Z' fill='${c.line}'/>`).join('')}</g>` +
    `<rect x='20' y='44' width='110' height='30' fill='${c.line}'/>` +
    `<text x='26' y='66' font-family='Arial Black, sans-serif' font-size='18' font-weight='900' fill='${c.yellow}'>PELIGRO</text>`;
  add(`mecha-hazard-${m}`, svg(200, 90, `<g opacity='${c.o}'>${stripes}</g>`));

  // Pattern: armor panel seams and rivets.
  const plate = `<g fill='none' stroke='${c.grid}' stroke-width='1.5'><path d='M0 0 H160 V160 M0 80 H70 L90 100 H160 M70 0 V60 L90 80 V160'/></g>
    <g fill='${c.grid}'>${[[8, 8], [62, 8], [8, 72], [98, 108], [152, 108], [98, 152], [152, 152], [82, 30]].map(([x, y]) => `<circle cx='${x}' cy='${y}' r='2.4'/>`).join('')}</g>`;
  add(`mecha-plates-${m}`, svg(160, 160, plate));
}

/* -------------------------------- neotokio -------------------------------- */

const NEO = {
  light: { sky: '#5a4b8a', bld: '#3b2f63', bld2: '#4c3f7a', pink: '#ff4fae', cyan: '#2fd3ff', yellow: '#ffe35a', rain: '#8a7fb8', o: 0.6, ro: 0.4 },
  dark: { sky: '#120e26', bld: '#17122e', bld2: '#211a40', pink: '#ff4fae', cyan: '#4fe0ff', yellow: '#ffe35a', rain: '#5d5a99', o: 1, ro: 0.45 },
};

for (const m of MODES) {
  const c = NEO[m];
  const rnd = random(51);
  // Bottom right: skyline with lit windows and vertical neon signs.
  let city = '';
  const towers: [number, number, number, string][] = [
    [20, 150, 50, c.bld2], [70, 90, 60, c.bld], [130, 130, 46, c.bld2], [176, 60, 70, c.bld], [246, 120, 54, c.bld2],
  ];
  for (const [x, top, w, col] of towers) {
    city += `<rect x='${x}' y='${top}' width='${w}' height='${300 - top}' fill='${col}'/>`;
    for (let y = top + 12; y < 290; y += 14)
      for (let xx = x + 6; xx < x + w - 6; xx += 10)
        if (rnd() > 0.55) city += `<rect x='${xx}' y='${y}' width='5' height='6' fill='${rnd() > 0.5 ? c.yellow : c.cyan}' opacity='${0.5 + rnd() * 0.5}'/>`;
  }
  const sign = (x: number, y: number, h: number, col: string) =>
    `<rect x='${x - 3}' y='${y - 3}' width='26' height='${h + 6}' rx='4' fill='${col}' opacity='0.25'/>` +
    `<rect x='${x}' y='${y}' width='20' height='${h}' rx='3' fill='none' stroke='${col}' stroke-width='3'/>` +
    Array.from({ length: Math.floor(h / 22) }, (_, i) => `<path d='M${x + 5} ${y + 8 + i * 22}h10v8h-10z' fill='${col}'/>`).join('');
  city += sign(150, 100, 110, c.pink) + sign(230, 70, 90, c.cyan) + sign(56, 120, 66, c.yellow);
  city += `<rect x='176' y='52' width='70' height='8' fill='${c.pink}'/>`;
  add(`neotokio-city-${m}`, svg(300, 300, `<g opacity='${c.o}'>${city}</g>`));

  // Top right: a neon sign hanging off a wall.
  const top = `<g opacity='${c.o}'>
    <rect x='120' y='0' width='10' height='22' fill='${c.bld}'/>
    <rect x='60' y='22' width='100' height='54' rx='8' fill='${c.bld}' stroke='${c.cyan}' stroke-width='3'/>
    <rect x='56' y='18' width='108' height='62' rx='10' fill='none' stroke='${c.cyan}' stroke-width='8' opacity='0.25'/>
    <path d='M74 36h20v26h-20z M104 36h10v26 M124 36h22l-11 13 11 13h-22' fill='none' stroke='${c.pink}' stroke-width='4' stroke-linejoin='round'/></g>`;
  add(`neotokio-sign-${m}`, svg(170, 90, top));

  // Pattern: slanted rain.
  let rain = '';
  for (let i = 0; i < 26; i++) {
    const x = rnd() * 200;
    const y = rnd() * 200;
    const l = 10 + rnd() * 16;
    rain += `M${x.toFixed(0)} ${y.toFixed(0)}l${(-l * 0.25).toFixed(1)} ${l.toFixed(0)}`;
  }
  add(`neotokio-rain-${m}`, svg(200, 200, `<path d='${rain}' stroke='${c.rain}' stroke-width='1.4' stroke-linecap='round' opacity='${c.ro}'/>`));
}

/* -------------------------------- espiritus ------------------------------- */

const ESPIRITUS = {
  light: { trunk: '#6b5a44', trunk2: '#7f6c53', moss: '#7fae5a', leaf: '#5f9a46', spirit: '#ffffff', edge: '#9db08f', soot: '#22201e', fly: '#e2d45a', o: 0.95, po: 0.55 },
  dark: { trunk: '#2c2a20', trunk2: '#38352a', moss: '#3f6b33', leaf: '#3d6b2f', spirit: '#eef6e8', edge: '#7a8f70', soot: '#0a0a09', fly: '#f4e66b', o: 0.9, po: 0.7 },
};

/** Little round forest spirit: white body, dot eyes, tilted head. */
function spirit(x: number, y: number, s: number, c: (typeof ESPIRITUS)['light'], tilt: number): string {
  return g(
    `translate(${x} ${y}) rotate(${tilt}) scale(${s})`,
    `<path d='M-10 18 C-12 8 -10 -2 0 -2 C10 -2 12 8 10 18Z' fill='${c.spirit}' stroke='${c.edge}' stroke-width='1'/>`,
    `<ellipse cx='0' cy='-10' rx='11' ry='10' fill='${c.spirit}' stroke='${c.edge}' stroke-width='1'/>`,
    `<circle cx='-4' cy='-10' r='2' fill='#2a2a2a'/><circle cx='4' cy='-11' r='2' fill='#2a2a2a'/><ellipse cx='0' cy='-5' rx='1.4' ry='1.8' fill='#2a2a2a'/>`,
  );
}

/** Fluffy soot sprite with big eyes. */
function soot(x: number, y: number, r: number, color: string, seed: number): string {
  const rnd = random(seed);
  let spikes = '';
  for (let i = 0; i < 18; i++) {
    const a = (Math.PI * 2 * i) / 18;
    const rr = r * (1.15 + rnd() * 0.25);
    spikes += `${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}L${(x + Math.cos(a + 0.17) * r * 0.9).toFixed(1)} ${(y + Math.sin(a + 0.17) * r * 0.9).toFixed(1)}L`;
  }
  return `<path d='M${spikes.slice(0, -1)}Z' fill='${color}'/>` +
    `<circle cx='${x - r * 0.35}' cy='${y - r * 0.1}' r='${r * 0.32}' fill='#fff'/><circle cx='${x + r * 0.35}' cy='${y - r * 0.1}' r='${r * 0.32}' fill='#fff'/>` +
    `<circle cx='${x - r * 0.3}' cy='${y - r * 0.05}' r='${r * 0.14}' fill='#111'/><circle cx='${x + r * 0.4}' cy='${y - r * 0.05}' r='${r * 0.14}' fill='#111'/>`;
}

for (const m of MODES) {
  const c = ESPIRITUS[m];
  // Bottom right: huge roots with spirits sitting on them.
  const roots = `<g opacity='${c.o}'>
    <path d='M300 0 C270 60 270 120 300 160 Z' fill='${c.trunk}'/>
    <path d='M300 120 C250 150 200 170 150 230 C140 245 120 250 90 250 L300 250Z' fill='${c.trunk}'/>
    <path d='M300 170 C260 190 240 210 230 250 H300Z' fill='${c.trunk2}'/>
    <path d='M190 190 C170 210 150 230 100 240' stroke='${c.trunk2}' stroke-width='10' fill='none' stroke-linecap='round'/>
    <path d='M150 232 C160 222 186 214 210 216 C200 230 180 240 150 240Z M250 160 c10 -8 30 -10 50 -6 v10 c-18 0 -36 2 -50 -4Z' fill='${c.moss}'/>
    ${spirit(168, 206, 1, c, -12)}${spirit(208, 178, 0.85, c, 10)}${spirit(246, 150, 0.7, c, -4)}${spirit(120, 222, 0.7, c, 18)}</g>`;
  add(`espiritus-roots-${m}`, svg(300, 250, roots));

  // Bottom left: soot sprites huddled together.
  const sootPile = soot(40, 60, 16, c.soot, 61) + soot(76, 66, 13, c.soot, 62) + soot(58, 34, 11, c.soot, 63) + soot(104, 70, 9, c.soot, 64);
  add(`espiritus-soot-${m}`, svg(130, 90, sootPile));

  // Top right: hanging leaves.
  let leaves = `<path d='M180 0 C160 20 130 30 100 40 M150 0 C140 30 120 50 90 70' stroke='${c.trunk}' stroke-width='3' fill='none' opacity='${c.o}'/>`;
  for (const [x, y, r] of [[160, 20, 30], [130, 32, 60], [104, 42, 20], [140, 34, 120], [116, 56, 80], [92, 70, 40]] as const)
    leaves += `<ellipse cx='${x}' cy='${y}' rx='12' ry='6' fill='${c.leaf}' transform='rotate(${r} ${x} ${y})' opacity='${c.o}'/>`;
  add(`espiritus-leaves-${m}`, svg(180, 90, leaves));

  // Pattern: fireflies and drifting leaves.
  const pat = points(16, 260, 260, 65)
    .map(([x, y], i) =>
      i % 2
        ? `<circle cx='${x}' cy='${y}' r='5' fill='${c.fly}' opacity='${c.po * 0.35}'/><circle cx='${x}' cy='${y}' r='1.8' fill='${c.fly}' opacity='${c.po}'/>`
        : `<ellipse cx='${x}' cy='${y}' rx='5' ry='2.4' fill='${c.leaf}' opacity='${c.po * 0.7}' transform='rotate(${(i * 53) % 180} ${x} ${y})'/>`,
    )
    .join('');
  add(`espiritus-fireflies-${m}`, svg(260, 260, pat));
}

/* --------------------------------- samurai -------------------------------- */

const SAMURAI = {
  light: { sun: '#c8241f', ink: '#1a1d2b', ink2: '#5b6075', wash: '#9aa0b4', blade: '#c9ccd6', wave: '#24476e', wo: 0.13, petal: '#f2a3b6', o: 0.95 },
  dark: { sun: '#d9372f', ink: '#05070c', ink2: '#2f3650', wash: '#3a425c', blade: '#8e94a8', wave: '#8fb8f0', wo: 0.09, petal: '#d97f96', o: 0.85 },
};

for (const m of MODES) {
  const c = SAMURAI[m];
  // Top right: rising sun.
  add(`samurai-sun-${m}`, svg(180, 140, `<circle cx='120' cy='40' r='70' fill='${c.sun}' opacity='${c.o}'/>`));

  // Bottom right: katana across ink-wash mountains, a cherry twig.
  const rnd = random(71);
  let flowers = '';
  for (const [x, y] of [[70, 40], [96, 28], [52, 60], [120, 46], [84, 64]] as const)
    flowers += blossom(x, y, 8, c.petal, c.sun, rnd() * 72, c.o);
  const art = `<g opacity='${c.o}'>
    <path d='M0 260 L60 190 L90 214 L150 140 L210 210 L240 186 L300 240 V300 H0Z' fill='${c.wash}' opacity='0.55'/>
    <path d='M80 300 L160 200 L200 240 L240 210 L300 270 V300Z' fill='${c.ink2}' opacity='0.7'/>
    <g transform='rotate(-28 170 190)'>
      <rect x='40' y='186' width='210' height='8' rx='4' fill='${c.blade}' stroke='${c.ink}' stroke-width='1.5'/>
      <rect x='246' y='178' width='8' height='24' rx='2' fill='${c.ink}'/>
      <rect x='254' y='184' width='60' height='12' rx='3' fill='${c.ink}'/>
      <path d='M260 184 l6 12 l6 -12 l6 12 l6 -12 l6 12 l6 -12' stroke='${c.sun}' stroke-width='1.5' fill='none'/>
    </g>
    <path d='M0 70 C40 60 80 50 140 30' stroke='${c.ink}' stroke-width='4' fill='none' stroke-linecap='round'/>
    ${flowers}</g>`;
  add(`samurai-katana-${m}`, svg(300, 300, art));

  // Pattern: seigaiha waves. Each scale is filled with the page color so the
  // row in front hides the one behind, like the printed pattern.
  const scale = (cx: number, cy: number) =>
    `<circle cx='${cx}' cy='${cy}' r='20' fill='${m === 'light' ? '#f3eee2' : '#111521'}'/>` +
    [18, 13, 8, 3].map((r) => `<circle cx='${cx}' cy='${cy}' r='${r}'/>`).join('');
  const wave = `<g stroke='${c.wave}' stroke-width='1.4' fill='none' opacity='${c.wo}'>` +
    `<g>${scale(0, 0)}${scale(40, 0)}</g><g>${scale(20, 10)}</g><g>${scale(0, 20)}${scale(40, 20)}</g></g>`;
  add(`samurai-waves-${m}`, svg(40, 20, wave));
}

export default out;
