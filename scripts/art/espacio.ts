/**
 * Textures for the «Aliens y espacio» group: invasion, clasificado, marte,
 * nebulosa, abduccion and orbital. Each theme has three corner pieces and a
 * repeating pattern, drawn once per mode.
 */
import { g, points, random, sparkle, star, svg } from './shared';

type Mode = 'light' | 'dark';

/* ------------------------------- shared pieces ------------------------------ */

/** A starfield tile: dots of three sizes plus a few sparkles. */
function starfield(w: number, h: number, n: number, seed: number, color: string, opacity: number, sparkles = 0, sparkleColor = color) {
  const r = random(seed);
  let out = '';
  for (const [x, y] of points(n, w, h, seed)) {
    const s = r();
    const rad = s < 0.65 ? 0.7 : s < 0.92 ? 1.1 : 1.6;
    out += `<circle cx='${x}' cy='${y}' r='${rad}' fill='${color}' opacity='${(opacity * (0.5 + r() * 0.5)).toFixed(2)}'/>`;
  }
  for (const [x, y] of points(sparkles, w - 20, h - 20, seed + 7)) out += sparkle(x + 10, y + 10, 4 + r() * 3, sparkleColor, opacity);
  return out;
}

/** A classic flying saucer centered on (0, 0), about 120 wide. */
function saucer(c: { hull: string; rim: string; dome: string; shine: string; lights: string; line: string }) {
  let lights = '';
  for (let i = -3; i <= 3; i++) lights += `<circle cx='${i * 14}' cy='9' r='3.2' fill='${c.lights}'/>`;
  return (
    `<ellipse cx='0' cy='-6' rx='26' ry='22' fill='${c.dome}' stroke='${c.line}' stroke-width='2'/>` +
    `<path d='M-14 -16 Q-8 -24 2 -24' stroke='${c.shine}' stroke-width='3' fill='none' stroke-linecap='round' opacity='.8'/>` +
    `<ellipse cx='0' cy='6' rx='60' ry='15' fill='${c.hull}' stroke='${c.line}' stroke-width='2'/>` +
    `<ellipse cx='0' cy='2' rx='46' ry='7' fill='${c.rim}' opacity='.7'/>` +
    lights +
    `<ellipse cx='0' cy='19' rx='20' ry='4' fill='${c.line}' opacity='.6'/>`
  );
}

/** A tractor beam from (0, top) widening down to `bottom`. */
function beam(id: string, top: number, bottom: number, w0: number, w1: number, color: string, opacity: number) {
  return (
    `<defs><linearGradient id='${id}' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${color}' stop-opacity='${opacity}'/><stop offset='1' stop-color='${color}' stop-opacity='${opacity * 0.25}'/></linearGradient></defs>` +
    `<path d='M${-w0 / 2} ${top}L${w0 / 2} ${top}L${w1 / 2} ${bottom}L${-w1 / 2} ${bottom}Z' fill='url(#${id})'/>`
  );
}

/** A little green alien peeking up, centered on (0, 0), about 70 wide. */
function alien(skin: string, eye: string, line: string) {
  return (
    `<path d='M-18 -46 Q-26 -66 -30 -70' stroke='${line}' stroke-width='2.5' fill='none' stroke-linecap='round'/>` +
    `<path d='M18 -46 Q26 -66 30 -70' stroke='${line}' stroke-width='2.5' fill='none' stroke-linecap='round'/>` +
    `<circle cx='-30' cy='-71' r='5' fill='${skin}' stroke='${line}' stroke-width='2'/>` +
    `<circle cx='30' cy='-71' r='5' fill='${skin}' stroke='${line}' stroke-width='2'/>` +
    `<path d='M-30 0 Q-36 -50 0 -52 Q36 -50 30 0Z' fill='${skin}' stroke='${line}' stroke-width='2.5'/>` +
    `<ellipse cx='-12' cy='-26' rx='9' ry='13' transform='rotate(-25 -12 -26)' fill='${eye}'/>` +
    `<ellipse cx='12' cy='-26' rx='9' ry='13' transform='rotate(25 12 -26)' fill='${eye}'/>` +
    `<circle cx='-14' cy='-31' r='2.5' fill='#ffffff' opacity='.9'/><circle cx='10' cy='-31' r='2.5' fill='#ffffff' opacity='.9'/>` +
    `<path d='M-7 -8 Q0 -3 7 -8' stroke='${line}' stroke-width='2' fill='none' stroke-linecap='round'/>` +
    // fingers on the edge
    `<path d='M-40 2 q4 -10 8 0 q4 -10 8 0 M24 2 q4 -10 8 0 q4 -10 8 0' fill='${skin}' stroke='${line}' stroke-width='2'/>`
  );
}

/** A Holstein cow standing, centered on (0, 0), about 90 wide. */
function cow(c: { body: string; spot: string; line: string; snout: string }) {
  const legs = [-28, -16, 14, 26]
    .map((x) => `<rect x='${x - 4}' y='12' width='8' height='22' rx='2' fill='${c.body}' stroke='${c.line}' stroke-width='2'/><rect x='${x - 4}' y='30' width='8' height='5' fill='${c.line}'/>`)
    .join('');
  return (
    legs +
    `<path d='M34 -8 Q46 -4 44 10' stroke='${c.line}' stroke-width='2.5' fill='none'/><circle cx='44' cy='12' r='3' fill='${c.line}'/>` +
    `<rect x='-38' y='-18' width='76' height='36' rx='16' fill='${c.body}' stroke='${c.line}' stroke-width='2.5'/>` +
    `<path d='M-20 -18 Q-10 -6 -22 4 Q-30 -4 -26 -16Z' fill='${c.spot}'/><path d='M8 -18 Q22 -12 16 0 Q4 2 6 -10Z' fill='${c.spot}'/><ellipse cx='22' cy='10' rx='7' ry='5' fill='${c.spot}'/>` +
    `<ellipse cx='-6' cy='16' rx='7' ry='4' fill='${c.snout}'/>` +
    // head
    g(
      'translate(-46 -16)',
      `<path d='M-6 -14 l-6 -6 M10 -14 l6 -6' stroke='${c.line}' stroke-width='3' stroke-linecap='round'/>`,
      `<ellipse cx='-12' cy='-8' rx='7' ry='4' fill='${c.body}' stroke='${c.line}' stroke-width='2'/>`,
      `<ellipse cx='16' cy='-8' rx='7' ry='4' fill='${c.body}' stroke='${c.line}' stroke-width='2'/>`,
      `<rect x='-8' y='-16' width='20' height='30' rx='9' fill='${c.body}' stroke='${c.line}' stroke-width='2.5'/>`,
      `<ellipse cx='2' cy='10' rx='12' ry='8' fill='${c.snout}' stroke='${c.line}' stroke-width='2'/>`,
      `<circle cx='-2' cy='10' r='1.6' fill='${c.line}'/><circle cx='6' cy='10' r='1.6' fill='${c.line}'/>`,
      `<circle cx='-3' cy='-4' r='2.4' fill='${c.line}'/><circle cx='7' cy='-4' r='2.4' fill='${c.line}'/>`,
    )
  );
}

/* --------------------------------- invasion -------------------------------- */

const INVASION = {
  light: { sky: '#1f6f6b', star: '#1f6f6b', ufo: { hull: '#9aa7a6', rim: '#f2e6c9', dome: '#bfe6dd', shine: '#ffffff', lights: '#c8372d', line: '#22302f' }, beam: '#7fc35c', alien: '#7fc35c', eye: '#22302f', ray: '#c8372d' },
  dark: { sky: '#a6f5b0', star: '#e8f4ff', ufo: { hull: '#7b8a99', rim: '#c5d3e0', dome: '#7fe6d2', shine: '#ffffff', lights: '#ffe066', line: '#0b1220' }, beam: '#7dff8a', alien: '#7dff8a', eye: '#0b1220', ray: '#ffe066' },
};

function invasion(m: Mode) {
  const p = INVASION[m];
  const big = svg(
    240,
    300,
    beam(`ib${m}`, 30, 300, 60, 210, p.beam, m === 'dark' ? 0.5 : 0.45) +
      g('translate(120 30)', saucer(p.ufo)) +
      // atomic-age burst behind the saucer
      g('translate(196 92)', sparkle(0, 0, 10, p.ray, 0.9)),
  );
  const peek = svg(130, 110, g('translate(65 104)', alien(p.alien, p.eye, p.ufo.line)));
  const small = svg(
    170,
    120,
    g('translate(92 50) rotate(-14) scale(.62)', saucer(p.ufo)) +
      `<path d='M30 72 Q50 66 62 60' stroke='${p.ray}' stroke-width='2' stroke-dasharray='4 5' fill='none' opacity='.7'/>` +
      sparkle(24, 28, 6, p.ray, 0.8),
  );
  const pattern = svg(
    220,
    220,
    starfield(220, 220, m === 'dark' ? 46 : 22, 11, p.star, m === 'dark' ? 0.85 : 0.45, 3, p.ray) +
      // tiny saucers in the distance
      g('translate(150 60) scale(.12)', saucer({ ...p.ufo, lights: p.ufo.lights }), '') +
      g('translate(50 170) scale(.09) rotate(10)', saucer(p.ufo)),
    m === 'dark' ? '' : "opacity='.8'",
  );
  return { corner: big, peek, small, pattern };
}

/* -------------------------------- clasificado ------------------------------- */

const CLASIFICADO = {
  light: { folder: '#d9b96d', folderDark: '#b8964b', paper: '#fbf6e8', ink: '#2b241a', stamp: '#b0261d', clip: '#7b8088', photo: '#3a3a3a', photoSky: '#59636b', bar: '#16120c', line: '#c9b98f' },
  dark: { folder: '#123d1d', folderDark: '#0d2b15', paper: '#0e2414', ink: '#7dff96', stamp: '#c7ff5a', clip: '#4fa865', photo: '#071a0c', photoSky: '#1b5a2a', bar: '#7dff96', line: '#1d4a29' },
};

function clasificado(m: Mode) {
  const p = CLASIFICADO[m];
  const mono = `font-family='Courier New, Courier, monospace' font-weight='700'`;
  const stamp = (x: number, y: number, rot: number, text: string, fs: number, w: number) =>
    g(
      `translate(${x} ${y}) rotate(${rot})`,
      `<rect x='${-w / 2}' y='${-fs * 0.95}' width='${w}' height='${fs * 1.5}' fill='none' stroke='${p.stamp}' stroke-width='3' rx='3' opacity='.85'/>`,
      `<text x='0' y='${fs * 0.15}' text-anchor='middle' font-size='${fs}' ${mono} fill='${p.stamp}' opacity='.85' letter-spacing='2'>${text}</text>`,
    );
  const lines = (x: number, y: number, n: number, w: number) => {
    let s = '';
    const r = random(x * 7 + y);
    for (let i = 0; i < n; i++) {
      const len = w * (0.55 + r() * 0.45);
      const redacted = r() < 0.35;
      s += `<rect x='${x}' y='${y + i * 11}' width='${len.toFixed(0)}' height='${redacted ? 7 : 2.5}' fill='${redacted ? p.bar : p.ink}' opacity='${redacted ? 0.9 : 0.45}'/>`;
    }
    return s;
  };
  // the dossier: folder, sheet with redacted lines, a clipped UFO photo, the stamp
  const corner = svg(
    250,
    250,
    `<path d='M20 70 L90 70 L102 56 L240 56 L240 250 L20 250Z' fill='${p.folderDark}'/>` +
      `<rect x='14' y='76' width='236' height='174' fill='${p.folder}'/>` +
      g('rotate(-4 120 160)', `<rect x='40' y='90' width='180' height='170' fill='${p.paper}' stroke='${p.line}' stroke-width='1.5'/>`, lines(56, 150, 8, 140)) +
      g(
        'translate(132 82) rotate(7)',
        `<rect x='0' y='0' width='96' height='80' fill='#ffffff' opacity='${m === 'dark' ? 0.12 : 1}' stroke='${p.line}' stroke-width='1.5'/>`,
        `<rect x='6' y='6' width='84' height='60' fill='${p.photoSky}'/>`,
        g('translate(48 28) scale(.38)', saucer({ hull: p.photo, rim: p.photoSky, dome: p.photo, shine: p.photoSky, lights: p.photoSky, line: p.photo })),
        `<path d='M6 66 L30 54 L50 60 L90 48 L90 66Z' fill='${p.photo}'/>`,
      ) +
      // paper clip
      `<path d='M160 70 L160 108 Q160 116 168 116 Q176 116 176 108 L176 78 Q176 72 170 72 Q164 72 164 78 L164 104' stroke='${p.clip}' stroke-width='3' fill='none' stroke-linecap='round'/>` +
      stamp(116, 214, -12, 'CLASIFICADO', 20, 170),
  );
  const seal = svg(
    150,
    150,
    g(
      'translate(75 75) rotate(14)',
      `<circle r='58' fill='none' stroke='${p.stamp}' stroke-width='4' opacity='.8'/>`,
      `<circle r='46' fill='none' stroke='${p.stamp}' stroke-width='1.5' opacity='.8'/>`,
      `<text y='-14' text-anchor='middle' font-size='14' ${mono} fill='${p.stamp}' opacity='.85' letter-spacing='1'>ULTRA</text>`,
      `<text y='6' text-anchor='middle' font-size='14' ${mono} fill='${p.stamp}' opacity='.85' letter-spacing='1'>SECRETO</text>`,
      star(0, 24, 8, p.stamp, 0.8),
    ),
  );
  const memo = svg(
    170,
    150,
    g(
      'rotate(6 85 75)',
      `<rect x='20' y='20' width='140' height='150' fill='${p.paper}' stroke='${p.line}' stroke-width='1.5'/>`,
      `<text x='34' y='44' font-size='11' ${mono} fill='${p.ink}' opacity='.7'>EXPTE. 51-B</text>`,
      lines(34, 58, 8, 110),
    ),
  );
  // ruled dossier paper with the odd redaction and a ghost of a stamp
  const pattern =
    m === 'dark'
      ? svg(200, 200, Array.from({ length: 50 }, (_, i) => `<rect x='0' y='${i * 4}' width='200' height='1.4' fill='${p.ink}' opacity='.06'/>`).join('') + `<rect x='30' y='60' width='60' height='6' fill='${p.ink}' opacity='.08'/><rect x='120' y='150' width='44' height='6' fill='${p.ink}' opacity='.08'/>`)
      : svg(
          220,
          220,
          Array.from({ length: 10 }, (_, i) => `<rect x='0' y='${i * 22 + 18}' width='220' height='1' fill='${p.line}' opacity='.55'/>`).join('') +
            `<rect x='24' y='105' width='70' height='8' fill='${p.bar}' opacity='.12'/><rect x='130' y='193' width='54' height='8' fill='${p.bar}' opacity='.12'/>`,
        );
  return { corner, seal, memo, pattern };
}

/* ----------------------------------- marte ---------------------------------- */

const MARTE = {
  light: { dune1: '#d9875a', dune2: '#c26a3f', dune3: '#a8532d', rock: '#8c4325', moon: '#b98c74', moonShade: '#9a6f59', rover: '#e9e2d6', roverLine: '#3b2218', wheel: '#3b2218', panel: '#3f5a8a', dust: '#a8532d', crater: '#c97a50' },
  dark: { dune1: '#5a2618', dune2: '#4a1e13', dune3: '#3a170f', rock: '#2c110b', moon: '#d9b9a4', moonShade: '#a8836e', rover: '#cfc6b8', roverLine: '#140806', wheel: '#140806', panel: '#5b7fc4', dust: '#ff9a6b', crater: '#6a2e1d' },
};

function marte(m: Mode) {
  const p = MARTE[m];
  const rover = g(
    'translate(150 150)',
    `<rect x='-34' y='-22' width='68' height='22' rx='4' fill='${p.rover}' stroke='${p.roverLine}' stroke-width='2.5'/>`,
    `<rect x='-46' y='-30' width='40' height='6' fill='${p.panel}' stroke='${p.roverLine}' stroke-width='2'/>`,
    `<path d='M20 -22 L20 -46' stroke='${p.roverLine}' stroke-width='3'/>`,
    `<rect x='10' y='-58' width='22' height='13' rx='3' fill='${p.rover}' stroke='${p.roverLine}' stroke-width='2.5'/>`,
    `<circle cx='26' cy='-52' r='3' fill='${p.roverLine}'/>`,
    `<path d='M-6 -22 L-12 -44 M-12 -44 l-8 -3' stroke='${p.roverLine}' stroke-width='2' fill='none'/>`,
    `<path d='M-30 0 L-30 8 M0 0 L0 8 M30 0 L30 8' stroke='${p.roverLine}' stroke-width='3'/>`,
    ...[-30, 0, 30].map((x) => `<circle cx='${x}' cy='12' r='9' fill='${p.wheel}'/><circle cx='${x}' cy='12' r='3.5' fill='${p.rover}'/>`),
  );
  const corner = svg(
    260,
    230,
    `<path d='M0 150 Q70 110 140 140 T260 120 L260 230 L0 230Z' fill='${p.dune1}'/>` +
      rover +
      `<path d='M0 190 Q90 160 170 185 T260 175 L260 230 L0 230Z' fill='${p.dune2}'/>` +
      `<ellipse cx='70' cy='205' rx='26' ry='7' fill='${p.dune3}'/><ellipse cx='70' cy='203' rx='18' ry='4' fill='${p.crater}'/>` +
      `<path d='M210 200 l8 -10 l10 4 l6 10Z' fill='${p.rock}'/>` +
      // tire tracks
      `<path d='M118 172 Q70 175 20 168' stroke='${p.dune3}' stroke-width='2' stroke-dasharray='3 4' fill='none' opacity='.7'/>`,
  );
  const moons = svg(
    150,
    110,
    `<circle cx='96' cy='46' r='24' fill='${p.moon}'/><circle cx='104' cy='40' r='5' fill='${p.moonShade}'/><circle cx='88' cy='56' r='4' fill='${p.moonShade}'/><path d='M80 30 A24 24 0 0 0 96 70 A28 28 0 0 1 80 30Z' fill='${p.moonShade}' opacity='.6'/>` +
      `<ellipse cx='34' cy='76' rx='11' ry='8' fill='${p.moon}'/><circle cx='31' cy='75' r='2.5' fill='${p.moonShade}'/>`,
  );
  const rocks = svg(
    170,
    120,
    `<path d='M0 80 Q60 60 120 84 L170 90 L170 120 L0 120Z' fill='${p.dune2}'/>` +
      `<path d='M20 92 l14 -24 l18 6 l10 20Z' fill='${p.rock}'/><path d='M34 68 l6 14' stroke='${p.dune3}' stroke-width='2'/>` +
      `<path d='M90 100 l10 -14 l14 4 l4 12Z' fill='${p.rock}'/>` +
      `<ellipse cx='140' cy='106' rx='18' ry='5' fill='${p.dune3}'/>`,
  );
  // dust specks and little craters
  const r = random(42);
  let speck = '';
  for (const [x, y] of points(36, 200, 200, 43)) speck += `<circle cx='${x}' cy='${y}' r='${(0.6 + r() * 1.1).toFixed(1)}' fill='${p.dust}' opacity='${m === 'dark' ? 0.35 : 0.22}'/>`;
  for (const [x, y] of points(3, 170, 170, 44)) speck += `<ellipse cx='${x + 15}' cy='${y + 15}' rx='8' ry='3' fill='none' stroke='${p.dust}' stroke-width='1.2' opacity='${m === 'dark' ? 0.3 : 0.2}'/>`;
  if (m === 'dark') speck += starfield(200, 200, 18, 45, '#ffd9c7', 0.5);
  return { corner, moons, rocks, pattern: svg(200, 200, speck) };
}

/* --------------------------------- nebulosa --------------------------------- */

const NEBULOSA = {
  light: { a: '#f39ad5', b: '#9d8cf2', c: '#7fe0d6', star: '#7a4fb8', planet: '#b78cf0', planetShade: '#8a5fd0', ring: '#e070b8', glow: 0.45 },
  dark: { a: '#ff4fc8', b: '#7a5cff', c: '#2fe0d0', star: '#ffffff', planet: '#6a4bd6', planetShade: '#3a2590', ring: '#ff6ad5', glow: 0.6 },
};

function cloud(id: string, cx: number, cy: number, rx: number, ry: number, color: string, opacity: number) {
  return (
    `<defs><radialGradient id='${id}'><stop offset='0' stop-color='${color}' stop-opacity='${opacity}'/><stop offset='.55' stop-color='${color}' stop-opacity='${opacity * 0.4}'/><stop offset='1' stop-color='${color}' stop-opacity='0'/></radialGradient></defs>` +
    `<ellipse cx='${cx}' cy='${cy}' rx='${rx}' ry='${ry}' fill='url(#${id})'/>`
  );
}

function nebulosa(m: Mode) {
  const p = NEBULOSA[m];
  const planet = svg(
    250,
    230,
    cloud(`n1${m}`, 150, 140, 120, 90, p.a, p.glow * 0.8) +
      cloud(`n2${m}`, 200, 90, 80, 70, p.c, p.glow * 0.6) +
      starfield(250, 230, 26, 3, p.star, 0.8, 2) +
      g(
        'translate(150 130) rotate(-18)',
        `<ellipse cx='0' cy='0' rx='86' ry='20' fill='none' stroke='${p.ring}' stroke-width='6' opacity='.75'/>`,
        `<defs><radialGradient id='pl${m}' cx='.35' cy='.35'><stop offset='0' stop-color='${p.planet}'/><stop offset='1' stop-color='${p.planetShade}'/></radialGradient></defs>`,
        `<circle r='48' fill='url(#pl${m})'/>`,
        `<path d='M-46 -10 Q0 -2 46 -12 M-44 12 Q0 20 42 8' stroke='${p.ring}' stroke-width='3' fill='none' opacity='.45'/>`,
        // the front half of the ring
        `<path d='M-86 0 A86 20 0 0 0 86 0' fill='none' stroke='${p.ring}' stroke-width='6' opacity='.9'/>`,
      ),
  );
  const cloudTop = svg(220, 160, cloud(`n3${m}`, 130, 70, 110, 60, p.b, p.glow) + cloud(`n4${m}`, 170, 40, 60, 36, p.a, p.glow * 0.8) + starfield(220, 160, 14, 5, p.star, 0.9, 2));
  const cloudLeft = svg(180, 160, cloud(`n5${m}`, 60, 100, 100, 60, p.c, p.glow * 0.8) + cloud(`n6${m}`, 40, 120, 60, 40, p.b, p.glow * 0.7) + starfield(180, 160, 10, 9, p.star, 0.9, 1));
  const pattern = svg(240, 240, starfield(240, 240, m === 'dark' ? 70 : 40, 21, p.star, m === 'dark' ? 0.9 : 0.4, m === 'dark' ? 3 : 2, m === 'dark' ? p.a : p.star));
  return { planet, cloudTop, cloudLeft, pattern };
}

/* --------------------------------- abduccion -------------------------------- */

const ABDUCCION = {
  light: { field: '#9cc46b', field2: '#7fa851', barn: '#b23a2e', barnLine: '#3a2a1c', roof: '#5a3a28', fence: '#8a6a44', moon: '#fff3c4', ufo: { hull: '#a3adb7', rim: '#e8eef4', dome: '#bfe8ff', shine: '#ffffff', lights: '#f2b632', line: '#2a2f3a' }, beam: '#fff27a', cow: { body: '#ffffff', spot: '#2a2a2a', line: '#2a2a2a', snout: '#f2a7b5' }, circle: '#5d8a3a', star: '#ffffff' },
  dark: { field: '#1f3a24', field2: '#152b19', barn: '#7a2a22', barnLine: '#0a0f0b', roof: '#3a2418', fence: '#5a4632', moon: '#fff3c4', ufo: { hull: '#7b8796', rim: '#c5d0dc', dome: '#7fe6ff', shine: '#ffffff', lights: '#ffd34d', line: '#0a0d14' }, beam: '#c9ff6a', cow: { body: '#f4f4f4', spot: '#1b1b1b', line: '#141414', snout: '#f2a7b5' }, circle: '#c9ff6a', star: '#e8f0ff' },
};

function abduccion(m: Mode) {
  const p = ABDUCCION[m];
  const corner = svg(
    250,
    310,
    beam(`ab${m}`, 48, 300, 70, 190, p.beam, m === 'dark' ? 0.55 : 0.6) +
      g('translate(125 46)', saucer(p.ufo)) +
      // the cow floating up, a bit tilted, legs dangling
      g('translate(125 186) rotate(-16) scale(.95)', cow(p.cow)) +
      `<path d='M70 160 q-8 -8 0 -16 M180 210 q8 -8 0 -16' stroke='${p.beam}' stroke-width='2.5' fill='none' opacity='.9' stroke-linecap='round'/>` +
      `<text x='168' y='140' font-size='22' font-family='Arial Black, Arial, sans-serif' font-weight='900' fill='${p.ufo.lights}' transform='rotate(12 168 140)'>¡MU!</text>` +
      `<ellipse cx='125' cy='300' rx='95' ry='10' fill='${p.field2}'/>`,
  );
  const barn = svg(
    200,
    150,
    `<path d='M0 120 Q100 104 200 118 L200 150 L0 150Z' fill='${p.field}'/>` +
      `<path d='M40 70 L80 40 L120 70 L120 130 L40 130Z' fill='${p.barn}' stroke='${p.barnLine}' stroke-width='2.5'/>` +
      `<path d='M34 74 L80 36 L126 74' fill='none' stroke='${p.roof}' stroke-width='7' stroke-linejoin='round'/>` +
      `<rect x='64' y='96' width='32' height='34' fill='none' stroke='${p.barnLine}' stroke-width='2.5'/><path d='M64 96 L96 130 M96 96 L64 130' stroke='${p.barnLine}' stroke-width='2'/>` +
      `<rect x='72' y='60' width='16' height='14' fill='${p.ufo.lights}' stroke='${p.barnLine}' stroke-width='2'/>` +
      // fence
      [130, 150, 170, 190].map((x) => `<rect x='${x}' y='104' width='5' height='30' fill='${p.fence}'/>`).join('') +
      `<path d='M126 112 H200 M126 124 H200' stroke='${p.fence}' stroke-width='4'/>`,
  );
  const moon = svg(120, 120, `<circle cx='62' cy='56' r='30' fill='${p.moon}'/><circle cx='74' cy='48' r='28' fill='${m === 'dark' ? '#0d1a2b' : '#e2eef5'}'/>` + starfield(120, 120, 8, 31, m === 'dark' ? p.star : '#8aa0b6', 0.8, 1));
  // crop circles and the odd star
  const cc = (x: number, y: number, s: number) =>
    g(
      `translate(${x} ${y}) scale(${s})`,
      `<circle r='22' fill='none' stroke='${p.circle}' stroke-width='3'/><circle r='9' fill='none' stroke='${p.circle}' stroke-width='3'/>`,
      `<path d='M0 -22 V-38 M19 11 L33 19 M-19 11 L-33 19' stroke='${p.circle}' stroke-width='3'/>`,
      `<circle cy='-42' r='4' fill='none' stroke='${p.circle}' stroke-width='3'/><circle cx='36' cy='21' r='4' fill='none' stroke='${p.circle}' stroke-width='3'/><circle cx='-36' cy='21' r='4' fill='none' stroke='${p.circle}' stroke-width='3'/>`,
    );
  const pattern = svg(
    240,
    240,
    `<g opacity='${m === 'dark' ? 0.11 : 0.1}'>${cc(60, 70, 0.9)}${cc(180, 180, 0.7)}</g>` + (m === 'dark' ? starfield(240, 240, 24, 33, p.star, 0.6) : ''),
  );
  return { corner, barn, moon, pattern };
}

/* --------------------------------- orbital ---------------------------------- */

const ORBITAL = {
  light: { line: '#0a6c8f', hex: '#7fb3c8', station: '#e9eef2', stationLine: '#24384a', panel: '#2a6fb0', panelLine: '#9cc6e8', earth: '#4a90c2', land: '#6fae7a', atmo: '#7fd0ff', star: '#24384a' },
  dark: { line: '#4fd8ff', hex: '#1f5b7a', station: '#c9d6e2', stationLine: '#07101f', panel: '#1c5fa8', panelLine: '#7fc4ff', earth: '#1b5a9c', land: '#2f7a4a', atmo: '#4fd8ff', star: '#cfe8ff' },
};

function orbital(m: Mode) {
  const p = ORBITAL[m];
  const panel = (x: number, y: number) =>
    `<rect x='${x}' y='${y}' width='56' height='26' fill='${p.panel}' stroke='${p.stationLine}' stroke-width='2'/>` +
    `<path d='M${x + 14} ${y}V${y + 26}M${x + 28} ${y}V${y + 26}M${x + 42} ${y}V${y + 26}M${x} ${y + 13}H${x + 56}' stroke='${p.panelLine}' stroke-width='1' opacity='.8'/>`;
  const station = g(
    'translate(130 110)',
    `<path d='M-110 0 H110' stroke='${p.stationLine}' stroke-width='4'/>`,
    panel(-110, -32),
    panel(-110, 6),
    panel(54, -32),
    panel(54, 6),
    `<rect x='-36' y='-14' width='72' height='28' rx='12' fill='${p.station}' stroke='${p.stationLine}' stroke-width='2.5'/>`,
    `<rect x='-10' y='-40' width='20' height='80' rx='8' fill='${p.station}' stroke='${p.stationLine}' stroke-width='2.5'/>`,
    `<circle cx='-20' cy='0' r='4' fill='${p.atmo}'/><circle cx='0' cy='0' r='4' fill='${p.atmo}'/><circle cx='20' cy='0' r='4' fill='${p.atmo}'/>`,
    `<path d='M0 -40 V-58 M-6 -58 H6' stroke='${p.stationLine}' stroke-width='2.5'/>`,
  );
  const corner = svg(
    260,
    240,
    // the Earth's limb in the bottom right
    `<defs><radialGradient id='at${m}' cx='1' cy='1' r='1'><stop offset='.78' stop-color='${p.atmo}' stop-opacity='0'/><stop offset='.86' stop-color='${p.atmo}' stop-opacity='.55'/><stop offset='.9' stop-color='${p.atmo}' stop-opacity='0'/></radialGradient></defs>` +
      `<rect x='0' y='0' width='260' height='240' fill='url(#at${m})'/>` +
      `<circle cx='300' cy='300' r='200' fill='${p.earth}'/>` +
      `<path d='M140 230 Q170 200 200 214 Q220 180 250 186 L260 240 L130 240Z' fill='${p.land}' opacity='.9'/>` +
      g('translate(-10 -6) scale(.78)', station),
  );
  const bracket = (x: number, y: number, sx: number, sy: number) => `<path d='M${x} ${y + 24 * sy}V${y}H${x + 24 * sx}' stroke='${p.line}' stroke-width='3' fill='none'/>`;
  const hud = svg(
    170,
    120,
    bracket(150, 10, -1, 1) +
      bracket(150, 110, -1, -1) +
      `<circle cx='110' cy='54' r='26' fill='none' stroke='${p.line}' stroke-width='1.5' opacity='.8'/><circle cx='110' cy='54' r='14' fill='none' stroke='${p.line}' stroke-width='1.5' opacity='.6' stroke-dasharray='3 3'/>` +
      `<path d='M110 22 V36 M110 72 V86 M78 54 H92 M128 54 H142' stroke='${p.line}' stroke-width='2'/>` +
      `<text x='20' y='26' font-size='10' font-family='Courier New, monospace' font-weight='700' fill='${p.line}' opacity='.85'>ÓRBITA 408 KM</text>` +
      `<text x='20' y='40' font-size='10' font-family='Courier New, monospace' font-weight='700' fill='${p.line}' opacity='.85'>VEL 7,66 KM/S</text>` +
      `<rect x='20' y='50' width='50' height='4' fill='${p.line}' opacity='.35'/><rect x='20' y='50' width='34' height='4' fill='${p.line}'/>`,
  );
  const leftHud = svg(
    150,
    110,
    bracket(10, 10, 1, 1) +
      bracket(10, 100, 1, -1) +
      Array.from({ length: 6 }, (_, i) => `<rect x='26' y='${30 + i * 10}' width='${[60, 36, 80, 50, 24, 66][i]}' height='3' fill='${p.line}' opacity='${0.3 + (i % 3) * 0.2}'/>`).join(''),
  );
  // hex grid
  const hx = (cx: number, cy: number, r: number) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i;
      return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    });
    return `M${pts.join('L')}Z`;
  };
  const r = 16;
  const w = r * 3;
  const h = Math.sqrt(3) * r;
  let d = '';
  for (const [cx, cy] of [[0, 0], [w, 0], [w / 2, h / 2], [0, h], [w, h], [w / 2, (3 * h) / 2]]) d += hx(cx!, cy!, r);
  const pattern = svg(
    Number(w.toFixed(2)),
    Number(h.toFixed(2)),
    `<path d='${d}' fill='none' stroke='${p.hex}' stroke-width='1' opacity='${m === 'dark' ? 0.55 : 0.45}'/>`,
  );
  return { corner, hud, leftHud, pattern };
}

/* ---------------------------------- export ---------------------------------- */

/**
 * Corner pieces sit behind the titles under posters, so they are toned down:
 * the drawing reads, the text still wins.
 */
function soften(piece: string, opacity: number) {
  const open = piece.indexOf('>') + 1;
  return `${piece.slice(0, open)}<g opacity='${opacity}'>${piece.slice(open, -6)}</g></svg>`;
}

const raw: Record<string, string> = {};
const out = raw;
for (const m of ['light', 'dark'] as const) {
  const i = invasion(m);
  out[`invasion-corner-${m}`] = i.corner;
  out[`invasion-alien-${m}`] = i.peek;
  out[`invasion-saucer-${m}`] = i.small;
  out[`invasion-pattern-${m}`] = i.pattern;

  const c = clasificado(m);
  out[`clasificado-dossier-${m}`] = c.corner;
  out[`clasificado-seal-${m}`] = c.seal;
  out[`clasificado-memo-${m}`] = c.memo;
  out[`clasificado-pattern-${m}`] = c.pattern;

  const ma = marte(m);
  out[`marte-rover-${m}`] = ma.corner;
  out[`marte-moons-${m}`] = ma.moons;
  out[`marte-rocks-${m}`] = ma.rocks;
  out[`marte-pattern-${m}`] = ma.pattern;

  const n = nebulosa(m);
  out[`nebulosa-planet-${m}`] = n.planet;
  out[`nebulosa-cloud-${m}`] = n.cloudTop;
  out[`nebulosa-cloud2-${m}`] = n.cloudLeft;
  out[`nebulosa-pattern-${m}`] = n.pattern;

  const a = abduccion(m);
  out[`abduccion-cow-${m}`] = a.corner;
  out[`abduccion-barn-${m}`] = a.barn;
  out[`abduccion-moon-${m}`] = a.moon;
  out[`abduccion-pattern-${m}`] = a.pattern;

  const o = orbital(m);
  out[`orbital-station-${m}`] = o.corner;
  out[`orbital-hud-${m}`] = o.hud;
  out[`orbital-hud2-${m}`] = o.leftHud;
  out[`orbital-pattern-${m}`] = o.pattern;
}

// Big corners fade more than the small top ones; patterns are already faint.
const tone = (name: string) =>
  name.includes('pattern') ? 1 : /corner|dossier|rover|planet|cow|station/.test(name) ? (name.endsWith('dark') ? 0.62 : 0.72) : name.endsWith('dark') ? 0.8 : 0.85;

export default Object.fromEntries(Object.entries(raw).map(([n, v]) => [n, tone(n) === 1 ? v : soften(v, tone(n))]));
