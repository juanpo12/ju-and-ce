/**
 * Textures for the «Sorpresas» group: vaporwave, terminal, dinos, piratas,
 * comic, brujas and oeste. Each theme gets corner pieces (rb = right bottom,
 * lb = left bottom, rt = right top) and a repeating pattern, once per mode.
 */
import { g, pixelSvg, pixels, points, random, star, svg } from './shared';

type Mode = 'light' | 'dark';
const MODES: Mode[] = ['light', 'dark'];
const out: Record<string, string> = {};
const r1 = (n: number) => Math.round(n * 10) / 10;

/* -------------------------------- vaporwave ------------------------------- */

function palm(x: number, y: number, h: number, color: string, lean = 1): string {
  const tx = x + 14 * lean;
  const ty = y - h;
  let s = `<path d='M${x - 5} ${y}Q${r1(x + lean * 4)} ${r1(y - h * 0.5)} ${r1(tx - 3)} ${ty}L${r1(tx + 3)} ${ty}Q${r1(x + lean * 12)} ${r1(y - h * 0.5)} ${x + 5} ${y}Z' fill='${color}'/>`;
  const fronds: [number, number][] = [[-1, 0.15], [-0.85, 0.75], [-0.45, -0.7], [0.45, -0.7], [0.85, 0.75], [1, 0.15]];
  for (const [dx, dy] of fronds) {
    const ex = tx + dx * h * 0.5;
    const ey = ty + dy * h * 0.22 + h * 0.1;
    const cx = tx + dx * h * 0.28;
    const cy = ty - h * 0.14 + dy * h * 0.08;
    s += `<path d='M${r1(tx)} ${ty}Q${r1(cx)} ${r1(cy - 7)} ${r1(ex)} ${r1(ey)}Q${r1(cx)} ${r1(cy + 6)} ${r1(tx)} ${r1(ty + 3)}Z' fill='${color}'/>`;
  }
  return s;
}

function vaporwave(mode: Mode) {
  const c = mode === 'light'
    ? { sunTop: '#ffd36b', sunBottom: '#ff7ac6', grid: '#14b8d6', floor: '#c9f3fb', palm: '#3b1a5a', dot1: '#ff7ac6', dot2: '#14b8d6' }
    : { sunTop: '#ffcf5c', sunBottom: '#ff3fb4', grid: '#01cdfe', floor: '#1b0e3a', palm: '#05020c', dot1: '#ff71ce', dot2: '#01cdfe' };
  const W = 280;
  const H = 230;
  const cx = 160;
  const cy = 112;
  const R = 74;
  const hy = 168;
  let clip = `<rect x='0' y='0' width='${W}' height='${cy}'/>`;
  let y = cy;
  for (let i = 0; i < 6; i++) {
    const band = 12 - i * 1.4;
    const gap = 2 + i * 1.6;
    clip += `<rect x='0' y='${r1(y)}' width='${W}' height='${r1(band)}'/>`;
    y += band + gap;
  }
  let grid = `<rect x='0' y='${hy}' width='${W}' height='${H - hy}' fill='${c.floor}' opacity='.7'/>`;
  for (let k = -9; k <= 9; k++) {
    grid += `<line x1='${cx + k * 10}' y1='${hy}' x2='${cx + k * 70}' y2='${H}' stroke='${c.grid}' stroke-width='1.6'/>`;
  }
  for (let t = 1; t <= 6; t++) {
    const yy = r1(hy + (H - hy) * (t / 6) ** 2);
    grid += `<line x1='0' y1='${yy}' x2='${W}' y2='${yy}' stroke='${c.grid}' stroke-width='1.6'/>`;
  }
  grid += `<line x1='0' y1='${hy}' x2='${W}' y2='${hy}' stroke='${c.grid}' stroke-width='2.4'/>`;
  const body =
    `<defs><linearGradient id='s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${c.sunTop}'/><stop offset='1' stop-color='${c.sunBottom}'/></linearGradient>` +
    `<clipPath id='c'>${clip}</clipPath></defs>` +
    `<circle cx='${cx}' cy='${cy}' r='${R}' fill='url(#s)' clip-path='url(#c)'/>` +
    grid +
    palm(70, hy + 4, 120, c.palm, 1) +
    palm(238, hy + 4, 90, c.palm, -1);
  out[`vaporwave-rb-${mode}`] = svg(W, H, body);

  // Left bottom: a tall palm leaning in.
  out[`vaporwave-lb-${mode}`] = svg(150, 220, palm(40, 220, 170, c.palm, 1.6));

  // Right top: wireframe pyramid and a checkered tile floating.
  let rt = `<path d='M70 14L120 92L20 92Z' fill='none' stroke='${c.grid}' stroke-width='2.5'/><path d='M70 14L82 92' stroke='${c.grid}' stroke-width='1.5'/>`;
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++)
      if ((i + j) % 2 === 0) rt += `<rect x='${118 + i * 9}' y='${18 + j * 9}' width='9' height='9' fill='${c.dot1}'/>`;
  rt += `<rect x='118' y='18' width='36' height='36' fill='none' stroke='${c.dot1}' stroke-width='1.5'/>`;
  rt += `<circle cx='140' cy='100' r='14' fill='none' stroke='${c.dot1}' stroke-width='2.5'/>`;
  out[`vaporwave-rt-${mode}`] = svg(170, 130, `<g transform='rotate(-8 85 65)'>${rt}</g>`);

  // Pattern: little crosses and dots.
  let p = '';
  points(10, 140, 140, 7).forEach(([x, yy], i) => {
    const col = i % 2 ? c.dot1 : c.dot2;
    p += i % 3 === 0
      ? `<path d='M${x - 4} ${yy}H${x + 4}M${x} ${yy - 4}V${yy + 4}' stroke='${col}' stroke-width='1.6'/>`
      : `<circle cx='${x}' cy='${yy}' r='1.8' fill='${col}'/>`;
  });
  out[`vaporwave-pattern-${mode}`] = svg(140, 140, `<g opacity='${mode === 'light' ? 0.5 : 0.45}'>${p}</g>`);
}

/* -------------------------------- terminal -------------------------------- */

function terminal(mode: Mode) {
  const c = mode === 'light'
    ? { o: '#5b6450', b: '#d8d4c0', s: '#1f3a22', g: '#7dff9a', l: '#c33', k: '#bdb8a2', kk: '#8f8a76' }
    : { o: '#1f7a35', b: '#0a1a0c', s: '#030803', g: '#39ff6a', l: '#ffb000', k: '#0a1a0c', kk: '#145a22' };
  const screen = [
    'ssssssssssssssssssss',
    'sggsgggsggggsssssss',
    'ssssssssssssssssssss',
    'sgsgggggsggsggssssss',
    'ssssssssssssssssssss',
    'sggggsgggsssssssssss',
    'ssssssssssssssssssss',
    'sgsggssssssssssssss',
    'ssssssssssssssssssss',
  ].map((r) => 'o#' + r.padEnd(20, 's') + '#o');
  const map = [
    'oooooooooooooooooooooooo',
    'o######################o',
    ...screen,
    'o######################o',
    'o##l###################o',
    'oooooooooooooooooooooooo',
    '.........oooooo.........',
    '.....oooooooooooooo.....',
    '........................',
    'oooooooooooooooooooooooo',
    'okkkkkkkkkkkkkkkkkkkkkko',
    'okKkKkKkKkKkKkKkKkKkKkko',
    'okkKkKkKkKkKkKkKkKkKkkko',
    'okkkkKKKKKKKKKKKKKKkkkko',
    'oooooooooooooooooooooooo',
  ];
  const pal = { o: c.o, '#': c.b, s: c.s, g: c.g, l: c.l, k: c.k, K: c.kk };
  out[`terminal-rb-${mode}`] = pixelSvg(144, 144, pixels(map, pal, 6));

  // Left bottom: a floppy disk.
  const floppy = [
    'oooooooooooooo.',
    'oaaammmmmmaaaoo',
    'oaaammmmhmaaaao',
    'oaaammmmhmaaaao',
    'oaaammmmmmaaaao',
    'oaaaaaaaaaaaaao',
    'oaawwwwwwwwwaao',
    'oaawttttttttwao',
    'oaawwwwwwwwwwao',
    'oaawttttttwwwao',
    'oaawwwwwwwwwwao',
    'oaawwwwwwwwwwao',
    'ooooooooooooooo',
  ];
  const fp = mode === 'light'
    ? { o: '#2c3a2a', a: '#3f5a3c', m: '#b9bfb0', h: '#3f5a3c', w: '#f2f0e4', t: '#8a4b00' }
    : { o: '#1f7a35', a: '#08200d', m: '#145a22', h: '#08200d', w: '#0d2a12', t: '#39ff6a' };
  out[`terminal-lb-${mode}`] = pixelSvg(90, 78, pixels(floppy, fp, 6));

  if (mode === 'light') {
    // Tractor-feed holes, repeated down the paper edges.
    out['terminal-holes-light'] = svg(28, 32, `<circle cx='14' cy='16' r='5' fill='#dfe3d6' stroke='#c2c8b6' stroke-width='1'/><path d='M27 0V32' stroke='#c2c8b6' stroke-dasharray='2 3'/>`);
  } else {
    // Faint scrolling output.
    const rnd = random(42);
    let t = '';
    for (let i = 0; i < 9; i++) {
      const line = Array.from({ length: 18 }, () => (rnd() < 0.15 ? ' ' : rnd() < 0.5 ? '0' : '1')).join('');
      t += `<text x='6' y='${14 + i * 14}'>${line}</text>`;
    }
    out['terminal-pattern-dark'] = svg(170, 130, `<g font-family='monospace' font-size='11' fill='#39ff6a' opacity='.09'>${t}</g>`);
  }
}

/* ---------------------------------- dinos --------------------------------- */

const TREX =
  'M10 42L20 30L55 22L76 20L90 27L100 40L130 46L162 56L200 74L236 94L190 82L160 82L152 96L152 116L142 134L140 150L120 153L118 146L128 143L129 126L118 110L102 108L98 120L101 150L82 153L82 146L90 143L86 122L78 106L72 92L70 82L60 88L57 94L53 91L61 80L64 70L62 62L48 59L25 57L12 53L19 48L10 46Z';

const BRACHIO =
  'M4 150Q30 140 60 126Q90 114 118 118Q140 112 150 88Q158 50 166 28Q170 18 182 18L196 20Q204 24 200 30L186 34Q178 40 176 60Q172 104 160 132Q156 142 154 150L154 192L140 192L138 168L112 172L80 172L80 194L64 194L62 170Q48 160 30 156Q14 154 4 154Z';

function fern(x: number, y: number, h: number, color: string, lean = 1): string {
  let s = `<path d='M${x} ${y}Q${x + lean * h * 0.15} ${y - h * 0.6} ${x + lean * h * 0.4} ${y - h}' fill='none' stroke='${color}' stroke-width='2.2'/>`;
  for (let i = 1; i < 9; i++) {
    const t = i / 9;
    const px = x + lean * h * 0.4 * t * t + lean * h * 0.15 * t * (1 - t) * 2;
    const py = y - h * t;
    const len = h * 0.28 * (1 - t * 0.7);
    s += `<path d='M${r1(px)} ${r1(py)}q${r1(-len * 0.6)} ${r1(-len * 0.1)} ${r1(-len)} ${r1(len * 0.35)}q${r1(len * 0.5)} ${r1(-len * 0.05)} ${r1(len)} ${r1(-len * 0.35)}Z' fill='${color}'/>`;
    s += `<path d='M${r1(px)} ${r1(py)}q${r1(len * 0.6)} ${r1(-len * 0.1)} ${r1(len)} ${r1(len * 0.35)}q${r1(-len * 0.5)} ${r1(-len * 0.05)} ${r1(-len)} ${r1(-len * 0.35)}Z' fill='${color}'/>`;
  }
  return s;
}

function footprint(x: number, y: number, s: number, color: string, rot: number): string {
  return `<g transform='translate(${x} ${y}) rotate(${rot}) scale(${s})' fill='${color}'><ellipse cx='0' cy='4' rx='5' ry='6'/><ellipse cx='-6' cy='-6' rx='2.2' ry='6' transform='rotate(-25 -6 -6)'/><ellipse cx='0' cy='-9' rx='2.2' ry='6.5'/><ellipse cx='6' cy='-6' rx='2.2' ry='6' transform='rotate(25 6 -6)'/></g>`;
}

function dinos(mode: Mode) {
  const c = mode === 'light'
    ? { dino: '#5d7d40', far: '#a9bf86', fern: '#3f6a2e', lava: '#e8762a', smoke: '#b9b3a3', eye: '#edf1dc', print: '#8a6a3a' }
    : { dino: '#3e5a32', far: '#26361f', fern: '#4f7a3a', lava: '#ff8a3a', smoke: '#3b3f36', eye: '#10160e', print: '#c9a36a' };
  const rb =
    `<path d='M150 200L205 120L228 128L250 116L300 200Z' fill='${c.far}'/>` +
    `<path d='M205 120Q214 112 228 128Q238 110 250 116L244 124L228 134L212 126Z' fill='${c.lava}'/>` +
    `<circle cx='226' cy='96' r='10' fill='${c.smoke}'/><circle cx='238' cy='80' r='13' fill='${c.smoke}'/><circle cx='224' cy='62' r='9' fill='${c.smoke}'/>` +
    g('translate(40 42)', `<path d='${TREX}' fill='${c.dino}'/><circle cx='60' cy='31' r='3' fill='${c.eye}'/>`) +
    fern(20, 200, 90, c.fern, 1) +
    fern(270, 200, 70, c.fern, -1);
  out[`dinos-rb-${mode}`] = svg(300, 200, rb);
  out[`dinos-lb-${mode}`] = svg(210, 200, `<path d='${BRACHIO}' fill='${c.dino}'/><circle cx='186' cy='25' r='2.5' fill='${c.eye}'/>` + fern(190, 200, 60, c.fern, -1));
  // Right top: two pterodactyls.
  const ptero = (x: number, y: number, s: number) =>
    `<path transform='translate(${x} ${y}) scale(${s})' d='M0 0L-30 -8L-50 6L-24 2L-6 10L0 18L6 10L24 2L50 6L30 -8ZM0 0L8 -6L18 -4L8 -2Z' fill='${c.dino}'/>`;
  out[`dinos-rt-${mode}`] = svg(160, 100, ptero(100, 36, 1.1) + ptero(48, 70, 0.7));
  let p = '';
  [[30, 40, -20], [62, 70, -10], [40, 112, -25], [72, 142, -12], [140, 30, 160], [170, 60, 170], [150, 100, 165]].forEach(
    ([x, y, rot]) => (p += footprint(x!, y!, 1, c.print, rot!)),
  );
  out[`dinos-pattern-${mode}`] = svg(200, 170, `<g opacity='${mode === 'light' ? 0.22 : 0.18}'>${p}</g>`);
}

/* --------------------------------- piratas -------------------------------- */

function skull(x: number, y: number, s: number, bone: string, hole: string): string {
  const bones =
    `<g fill='${bone}'><rect x='-26' y='-3.5' width='52' height='7' rx='3.5' transform='rotate(30)'/><rect x='-26' y='-3.5' width='52' height='7' rx='3.5' transform='rotate(-30)'/>` +
    [[-24, -14], [-24, 14], [24, -14], [24, 14]].map(([bx, by]) => `<circle cx='${bx}' cy='${by}' r='5'/>`).join('') +
    `</g>`;
  const head =
    `<g transform='translate(0 -6)'><path d='M-14 0A14 14 0 1 1 14 0L14 6L9 8L9 14L-9 14L-9 8L-14 6Z' fill='${bone}'/>` +
    `<circle cx='-6' cy='0' r='4' fill='${hole}'/><circle cx='6' cy='0' r='4' fill='${hole}'/><path d='M0 4L-2.5 8H2.5Z' fill='${hole}'/>` +
    `<path d='M-4 10V14M0 10V14M4 10V14' stroke='${hole}' stroke-width='1.3'/></g>`;
  return `<g transform='translate(${x} ${y}) scale(${s})'>${bones}${head}</g>`;
}

function piratas(mode: Mode) {
  const c = mode === 'light'
    ? { hull: '#3b2a1e', sail: '#f7eedb', sailLine: '#b8a77f', sea: '#2c5d86', flag: '#1a1a26', bone: '#f2e7cf', chest: '#7a4a24', band: '#c9a227', coin: '#e0b83a', wave: '#2c5d86' }
    : { hull: '#05080f', sail: '#c9bfa6', sailLine: '#6a6350', sea: '#4f86b8', flag: '#05080f', bone: '#e8dcc0', chest: '#4a2e18', band: '#c9a227', coin: '#e8c26a', wave: '#6fa2d4' };
  const sail = (x: number, top: number, bottom: number, w: number) =>
    `<path d='M${x - w} ${top}Q${x} ${top + 6} ${x + w} ${top}L${x + w - 3} ${bottom}Q${x} ${bottom + 10} ${x - w + 3} ${bottom}Z' fill='${c.sail}' stroke='${c.sailLine}' stroke-width='1.2'/>`;
  let ship =
    `<path d='M86 34V150M136 22V150M184 44V150' stroke='${c.hull}' stroke-width='3.5'/>` +
    sail(86, 44, 80, 26) + sail(86, 88, 128, 30) +
    sail(136, 32, 72, 30) + sail(136, 80, 126, 34) +
    sail(184, 54, 86, 22) + sail(184, 94, 130, 26) +
    `<path d='M136 22L136 8L162 12L136 18Z' fill='${c.flag}'/>` +
    `<path d='M30 150H246L226 186H52Z' fill='${c.hull}'/><path d='M24 136H70V150H24Z' fill='${c.hull}'/>` +
    `<path d='M60 162H210' stroke='${c.band}' stroke-width='2' stroke-dasharray='6 8'/>`;
  ship += `<path d='M0 192Q20 182 40 192T80 192T120 192T160 192T200 192T240 192T280 192V210H0Z' fill='${c.sea}'/>`;
  out[`piratas-rb-${mode}`] = svg(280, 210, ship);

  // Right top: the Jolly Roger, waving from a pole.
  const flag =
    `<path d='M150 4V130' stroke='${c.hull}' stroke-width='4'/>` +
    `<path d='M148 10Q120 2 96 12T40 14L46 44L40 76Q70 66 96 76T148 72Z' fill='${c.flag}'/>` +
    skull(96, 46, 0.8, c.bone, c.flag);
  out[`piratas-rt-${mode}`] = svg(160, 134, flag);

  // Left bottom: a treasure chest spilling coins.
  let chest =
    `<path d='M20 70Q20 40 70 40Q120 40 120 70Z' fill='${c.chest}'/>` +
    `<rect x='20' y='70' width='100' height='58' fill='${c.chest}'/>` +
    `<path d='M20 70H120M20 98H120' stroke='${c.band}' stroke-width='5'/><path d='M44 44V128M96 44V128' stroke='${c.band}' stroke-width='5'/>` +
    `<rect x='63' y='84' width='14' height='18' rx='2' fill='${c.band}'/>`;
  [[130, 122], [146, 126], [138, 116], [10, 126], [156, 120]].forEach(([x, y]) => {
    chest += `<ellipse cx='${x}' cy='${y}' rx='8' ry='5' fill='${c.coin}' stroke='${c.chest}' stroke-width='1'/>`;
  });
  out[`piratas-lb-${mode}`] = svg(170, 132, chest);

  // Pattern: little waves and a dotted route with an X.
  let p = '';
  [[10, 30], [90, 80], [30, 130]].forEach(([x, y]) => {
    p += `<path d='M${x} ${y}q8 -8 16 0t16 0t16 0' fill='none' stroke='${c.wave}' stroke-width='2' stroke-linecap='round'/>`;
  });
  p += `<path d='M120 20q20 10 10 30t20 30' fill='none' stroke='${c.wave}' stroke-width='1.6' stroke-dasharray='3 5'/>`;
  p += `<path d='M146 76l8 8m0 -8l-8 8' stroke='#9b1b1b' stroke-width='2.4' stroke-linecap='round'/>`;
  out[`piratas-pattern-${mode}`] = svg(170, 160, `<g opacity='${mode === 'light' ? 0.3 : 0.28}'>${p}</g>`);
}

/* ---------------------------------- comic --------------------------------- */

function burst(cx: number, cy: number, ro: number, ri: number, n: number, seed: number): string {
  const rnd = random(seed);
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI / n) * i;
    const rr = i % 2 ? ri * (0.85 + rnd() * 0.25) : ro * (0.8 + rnd() * 0.3);
    pts.push(`${r1(cx + Math.cos(a) * rr)} ${r1(cy + Math.sin(a) * rr * 0.8)}`);
  }
  return `M${pts.join('L')}Z`;
}

function comic(mode: Mode) {
  const ink = mode === 'light' ? '#111111' : '#05081a';
  const word = (x: number, y: number, size: number, text: string, fill: string, rot: number) =>
    `<text x='${x}' y='${y}' transform='rotate(${rot} ${x} ${y})' text-anchor='middle' font-family='Impact,Haettenschweiler,Arial Black,Helvetica Neue,Arial,sans-serif' font-weight='900' font-size='${size}' fill='${fill}' stroke='${ink}' stroke-width='3' paint-order='stroke' letter-spacing='1'>${text}</text>`;
  out[`comic-rb-${mode}`] = svg(
    250,
    200,
    `<path d='${burst(125, 100, 118, 70, 13, 3)}' fill='#d0121b' stroke='${ink}' stroke-width='5' stroke-linejoin='round'/>` +
      `<path d='${burst(125, 100, 92, 58, 13, 9)}' fill='#ffd400' stroke='${ink}' stroke-width='3' stroke-linejoin='round'/>` +
      word(125, 118, 52, '¡POW!', '#d0121b', -8),
  );
  out[`comic-lb-${mode}`] = svg(
    190,
    150,
    `<path d='${burst(95, 75, 88, 56, 11, 21)}' fill='#1d6fe0' stroke='${ink}' stroke-width='4' stroke-linejoin='round'/>` +
      word(95, 90, 40, '¡ZAS!', '#ffffff', 6),
  );
  // Right top: a speech bubble.
  out[`comic-rt-${mode}`] = svg(
    170,
    120,
    `<path d='M20 14H150Q162 14 162 26V70Q162 82 150 82H80L52 108L58 82H20Q8 82 8 70V26Q8 14 20 14Z' fill='#ffffff' stroke='${ink}' stroke-width='4' stroke-linejoin='round'/>` +
      `<text x='85' y='58' text-anchor='middle' font-family='Impact,Haettenschweiler,Arial Black,Helvetica Neue,Arial,sans-serif' font-weight='900' font-size='26' fill='${ink}'>¡BAM!</text>`,
  );
  // Ben-Day dots.
  const dot = mode === 'light' ? '#e8414a' : '#3a5cc9';
  out[`comic-pattern-${mode}`] = svg(
    14,
    14,
    `<circle cx='3.5' cy='3.5' r='2.3' fill='${dot}'/><circle cx='10.5' cy='10.5' r='2.3' fill='${dot}'/>`,
  );
}

/* --------------------------------- brujas --------------------------------- */

function pumpkin(x: number, y: number, s: number, body: string, dark: string, glow: string, stem: string): string {
  return (
    `<g transform='translate(${x} ${y}) scale(${s})'>` +
    `<path d='M-3 -30Q-4 -40 4 -44L8 -41Q2 -38 3 -30Z' fill='${stem}'/>` +
    `<ellipse cx='-18' cy='0' rx='20' ry='28' fill='${body}'/><ellipse cx='18' cy='0' rx='20' ry='28' fill='${body}'/>` +
    `<ellipse cx='0' cy='0' rx='20' ry='30' fill='${body}' stroke='${dark}' stroke-width='1.5'/>` +
    `<path d='M-24 -8L-12 -14L-12 -2Z M24 -8L12 -14L12 -2Z M0 -4L-5 4H5Z' fill='${glow}'/>` +
    `<path d='M-24 8Q0 26 24 8L18 16L12 11L6 18L0 12L-6 18L-12 11L-18 16Z' fill='${glow}'/>` +
    `</g>`
  );
}

function bat(x: number, y: number, s: number, color: string): string {
  return `<path transform='translate(${x} ${y}) scale(${s})' d='M0 -4Q3 -9 5 -4L6 -1Q12 -10 24 -8Q18 -4 19 2Q14 -1 10 3Q6 0 3 5Q1 2 0 7Q-1 2 -3 5Q-6 0 -10 3Q-14 -1 -19 2Q-18 -4 -24 -8Q-12 -10 -6 -1L-5 -4Q-3 -9 0 -4Z' fill='${color}'/>`;
}

function brujas(mode: Mode) {
  const c = mode === 'light'
    ? { body: '#e8762a', dark: '#b4551a', glow: '#ffe28a', stem: '#4f6a22', bat: '#2a1638', web: '#6b5a78', moon: '#f6d98a', stone: '#9a93a3', stoneDark: '#6b6474', grass: '#4f6a22', star: '#b98ad6' }
    : { body: '#e8762a', dark: '#8a3d0e', glow: '#ffd75a', stem: '#5f7d2a', bat: '#05020a', web: '#a99abb', moon: '#f7e7a6', stone: '#4b4357', stoneDark: '#2c2536', grass: '#2f4a1a', star: '#f7e7a6' };
  out[`brujas-rb-${mode}`] = svg(
    240,
    150,
    `<path d='M0 150Q60 120 120 132T240 128V150Z' fill='${c.grass}'/>` +
      pumpkin(150, 110, 1.4, c.body, c.dark, mode === 'light' ? '#3a1a08' : c.glow, c.stem) +
      pumpkin(68, 124, 0.9, c.body, c.dark, mode === 'light' ? '#3a1a08' : c.glow, c.stem),
  );
  // Left bottom: a tombstone.
  out[`brujas-lb-${mode}`] = svg(
    150,
    150,
    `<path d='M30 140V60Q30 20 70 20Q110 20 110 60V140Z' fill='${c.stone}' stroke='${c.stoneDark}' stroke-width='3'/>` +
      `<text x='70' y='72' text-anchor='middle' font-family='Georgia,serif' font-weight='700' font-size='20' fill='${c.stoneDark}'>QEPD</text>` +
      `<path d='M52 92H88M56 104H84' stroke='${c.stoneDark}' stroke-width='3' stroke-linecap='round'/>` +
      `<path d='M0 150Q40 132 80 140T150 136V150Z' fill='${c.grass}'/>`,
  );
  // Right top: a web anchored to the corner, a spider, the moon and bats.
  let web = '';
  const ox = 200;
  const angles = [90, 112, 135, 158, 180];
  for (const a of angles) {
    const rad = (a * Math.PI) / 180;
    web += `<line x1='${ox}' y1='0' x2='${r1(ox + Math.cos(rad) * 150)}' y2='${r1(Math.sin(rad) * 150)}' stroke='${c.web}' stroke-width='1.2'/>`;
  }
  for (const rr of [30, 58, 88, 120]) {
    const pts = angles.map((a) => {
      const rad = (a * Math.PI) / 180;
      return `${r1(ox + Math.cos(rad) * rr)} ${r1(Math.sin(rad) * rr)}`;
    });
    let d = `M${pts[0]}`;
    for (let i = 1; i < pts.length; i++) {
      const a = ((angles[i - 1]! + angles[i]!) / 2) * (Math.PI / 180);
      const sag = rr * 0.85;
      d += `Q${r1(ox + Math.cos(a) * sag)} ${r1(Math.sin(a) * sag)} ${pts[i]}`;
    }
    web += `<path d='${d}' fill='none' stroke='${c.web}' stroke-width='1.1'/>`;
  }
  web += `<line x1='150' y1='0' x2='150' y2='96' stroke='${c.web}' stroke-width='1'/><ellipse cx='150' cy='100' rx='6' ry='8' fill='${c.bat}'/>`;
  web += `<path d='M144 96l-8 -6M144 100l-9 0M144 104l-8 6M156 96l8 -6M156 100l9 0M156 104l8 6' stroke='${c.bat}' stroke-width='1.6'/>`;
  const rt = `<circle cx='96' cy='56' r='30' fill='${c.moon}'/>` + bat(66, 100, 0.9, c.bat) + bat(124, 112, 0.6, c.bat) + web;
  out[`brujas-rt-${mode}`] = svg(200, 150, rt);
  // Pattern: bats and stars.
  let p = '';
  points(5, 220, 220, 13).forEach(([x, y], i) => (p += i % 2 ? bat(x, y, 0.5, c.bat) : star(x, y, 3, c.star)));
  out[`brujas-pattern-${mode}`] = svg(220, 220, `<g opacity='${mode === 'light' ? 0.28 : 0.35}'>${p}</g>`);
}

/* ---------------------------------- oeste --------------------------------- */

function cactus(x: number, y: number, s: number, color: string): string {
  return (
    `<g transform='translate(${x} ${y}) scale(${s})' fill='${color}'>` +
    `<rect x='-10' y='-120' width='20' height='120' rx='10'/>` +
    `<path d='M-10 -60H-26Q-34 -60 -34 -68V-90Q-34 -96 -28 -96Q-22 -96 -22 -90V-72H-10Z'/>` +
    `<path d='M10 -44H26Q34 -44 34 -52V-80Q34 -86 28 -86Q22 -86 22 -80V-56H10Z'/>` +
    `</g>`
  );
}

function sheriffStar(x: number, y: number, r: number, fill: string, edge: string): string {
  const pts: string[] = [];
  let tips = '';
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI / 6) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.55 : r;
    pts.push(`${r1(x + Math.cos(a) * rr)} ${r1(y + Math.sin(a) * rr)}`);
    if (i % 2 === 0) tips += `<circle cx='${r1(x + Math.cos(a) * r)}' cy='${r1(y + Math.sin(a) * r)}' r='${r1(r * 0.13)}' fill='${fill}' stroke='${edge}' stroke-width='1.5'/>`;
  }
  return `<path d='M${pts.join('L')}Z' fill='${fill}' stroke='${edge}' stroke-width='2'/>${tips}<circle cx='${x}' cy='${y}' r='${r1(r * 0.28)}' fill='none' stroke='${edge}' stroke-width='2'/>`;
}

function oeste(mode: Mode) {
  const c = mode === 'light'
    ? { paper: '#f6e4bb', paperEdge: '#a0743c', ink: '#3a2412', mesa: '#c98a52', cactus: '#4a6a1c', weed: '#8a6a3a', star: '#d8b04a', starEdge: '#7a5a1a', sun: '#f2a65a', dot: '#a0743c' }
    : { paper: '#d9c49a', paperEdge: '#6b4a24', ink: '#2a1a0c', mesa: '#3d2618', cactus: '#2f4416', weed: '#6b5232', star: '#c9a24a', starEdge: '#5a4210', sun: '#f2e6c4', dot: '#c2ab8c' };
  const serif = `font-family='Rockwell,Georgia,Times New Roman,serif' font-weight='700' text-anchor='middle' fill='${c.ink}'`;
  out[`oeste-rb-${mode}`] = svg(
    260,
    230,
    `<path d='M0 230V170L40 170L52 150L118 150L130 170H170L182 186H260V230Z' fill='${c.mesa}'/>` +
      `<g transform='rotate(4 170 110)'>` +
      `<path d='M110 20L232 18L236 200L112 204L108 120Z' fill='${c.paper}' stroke='${c.paperEdge}' stroke-width='3'/>` +
      `<circle cx='172' cy='28' r='3.5' fill='${c.paperEdge}'/>` +
      `<text x='172' y='58' ${serif} font-size='22'>SE BUSCA</text>` +
      `<rect x='138' y='68' width='68' height='74' fill='none' stroke='${c.ink}' stroke-width='2'/>` +
      `<circle cx='172' cy='104' r='14' fill='${c.ink}'/><path d='M150 142Q150 120 172 120Q194 120 194 142Z' fill='${c.ink}'/>` +
      `<path d='M146 94H198L190 90Q186 76 172 76Q158 76 154 90Z' fill='${c.ink}'/>` +
      `<text x='172' y='170' ${serif} font-size='24'>$500</text>` +
      `<text x='172' y='190' ${serif} font-size='11' letter-spacing='2'>RECOMPENSA</text>` +
      `</g>`,
  );
  // Left bottom: saguaro and a tumbleweed.
  let weed = '';
  const rnd = random(5);
  for (let i = 0; i < 10; i++) {
    const a = rnd() * 6.28;
    weed += `<path d='M${r1(120 + Math.cos(a) * 18)} ${r1(150 + Math.sin(a) * 16)}Q${r1(120 + rnd() * 20 - 10)} ${r1(150 + rnd() * 20 - 10)} ${r1(120 + Math.cos(a + 2.5) * 18)} ${r1(150 + Math.sin(a + 2.5) * 16)}' fill='none' stroke='${c.weed}' stroke-width='1.6'/>`;
  }
  out[`oeste-lb-${mode}`] = svg(160, 170, cactus(60, 170, 1.15, c.cactus) + weed);
  // Right top: the sheriff's star.
  out[`oeste-rt-${mode}`] = svg(120, 120, sheriffStar(60, 60, 46, c.star, c.starEdge));
  // Pattern: pebbles and tiny cacti.
  let p = '';
  points(8, 180, 180, 31).forEach(([x, y], i) => {
    p += i % 4 === 0 ? cactus(x, y, 0.12, c.cactus) : `<circle cx='${x}' cy='${y}' r='1.6' fill='${c.dot}'/>`;
  });
  out[`oeste-pattern-${mode}`] = svg(180, 180, `<g opacity='${mode === 'light' ? 0.4 : 0.35}'>${p}</g>`);
}

for (const mode of MODES) {
  vaporwave(mode);
  terminal(mode);
  dinos(mode);
  piratas(mode);
  comic(mode);
  brujas(mode);
  oeste(mode);
}

export default out;
