/**
 * Pixel art themes: arcade, bolsillo, aventura, mazmorra, plataformas,
 * bloques, ciudad and reinopixel. Every drawing is a set of sprites (text maps,
 * see `pixels()`) or plain rects on a pixel grid, rendered with crisp edges.
 *
 * Each theme gets the same pieces in two palettes (light and dark): corner
 * pieces that sit fixed at the screen edges and one repeating pattern.
 */
import { pixelSvg, pixels, random } from './shared';

type Palette = Record<string, string>;

/** A rect on a grid of `s`-pixel cells. */
const rect = (x: number, y: number, w: number, h: number, color: string, s = 4, opacity = 1) =>
  `<rect x='${x * s}' y='${y * s}' width='${w * s}' height='${h * s}' fill='${color}'${opacity === 1 ? '' : ` opacity='${opacity}'`}/>`;

/** A sprite placed on the same grid as `rect`. */
const sprite = (map: string[], palette: Palette, x: number, y: number, s = 4, opacity = 1) =>
  pixels(map, palette, s, x * s, y * s, opacity);

/** A tiling pattern of single pixels scattered at random. */
function scatter(width: number, height: number, n: number, colors: string[], seed: number, s = 2, opacity = 1) {
  const r = random(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = Math.floor((r() * width) / s);
    const y = Math.floor((r() * height) / s);
    out += rect(x, y, 1, 1, colors[i % colors.length]!, s);
  }
  return pixelSvg(width, height, opacity === 1 ? out : `<g opacity='${opacity}'>${out}</g>`);
}

/* --------------------------------- sprites -------------------------------- */

const INVADER = [
  '..X.....X..',
  '...X...X...',
  '..XXXXXXX..',
  '.XX.XXX.XX.',
  'XXXXXXXXXXX',
  'X.XXXXXXX.X',
  'X.X.....X.X',
  '...XX.XX...',
];
const SQUID = [
  '...XX...',
  '..XXXX..',
  '.XXXXXX.',
  'XX.XX.XX',
  'XXXXXXXX',
  '..X..X..',
  '.X.XX.X.',
  'X.X..X.X',
];
const CRAB = [
  '....XXXX....',
  '.XXXXXXXXXX.',
  'XXXXXXXXXXXX',
  'XXX..XX..XXX',
  'XXXXXXXXXXXX',
  '...XX..XX...',
  '..XX.XX.XX..',
  'XX........XX',
];
const SHIP = [
  '......X......',
  '.....XXX.....',
  '.....XXX.....',
  '.XXXXXXXXXXX.',
  'XXXXXXXXXXXXX',
  'XXXXXXXXXXXXX',
  'XXXXXXXXXXXXX',
  'XXXXXXXXXXXXX',
];
const SAUCER = [
  '.....XXXXXX.....',
  '...XXXXXXXXXX...',
  '..XXXXXXXXXXXX..',
  '.XX.XX.XX.XX.XX.',
  'XXXXXXXXXXXXXXXX',
  '..XXX..XX..XXX..',
  '...X........X...',
];
const HEART = ['.XX.XX.', 'XWXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
const HALF_HEART = ['.XX.EE.', 'XWXEEEE', 'XXXEEEE', '.XXEEE.', '..XEE..', '...E...'];
const HERO = [
  '...HHHH...',
  '..HHHHHH..',
  '..HSSSSH..',
  '..SESSES..',
  '..SSSSSS..',
  '...SSSS...',
  '.TTTTTTTT.',
  'STTTBBTTTS',
  'S.TTTTTT.S',
  '..TTTTTT..',
  '..PP..PP..',
  '..BB..BB..',
];
/** The hero, facing right with a raised sword. */
const HERO_SWORD = [
  '...........W',
  '..........W.',
  '...HHHH..W..',
  '..HHHHHHW...',
  '..HSSSSH....',
  '..SESSES.G..',
  '..SSSSSS.S..',
  '...SSSS.SS..',
  '.TTTTTTTS...',
  'STTTBBTT....',
  'S.TTTTTT....',
  '..TTTTTT....',
  '..PP..PP....',
  '..BB..BB....',
];
const SLIME = [
  '....XXXX....',
  '..XXLLXXXX..',
  '.XXLLXXXXXX.',
  '.XXXXXXXXXX.',
  'XXXEXXXXEXXX',
  'XXXEXXXXEXXX',
  'XXXXXXXXXXXX',
  '.XXXXXXXXXX.',
];
const TREE = [
  '....GGGG....',
  '..GGGGGGGG..',
  '.GGGLGGGGGG.',
  'GGGGGGGLGGGG',
  'GGLGGGGGGGGG',
  'GGGGGGGGGLGG',
  'GDGGGLGGGGDG',
  '.GDGGGGGGDG.',
  '..GDDGGDDG..',
  '....TTTT....',
  '....TTTT....',
  '...TTTTTT...',
];
const CHEST = [
  '.WWWWWWWWWW.',
  'WBBBBBBBBBBW',
  'WBBBBBBBBBBW',
  'WWWWWYYWWWWW',
  'WBBBBYYBBBBW',
  'WBBBBBBBBBBW',
  'WBBBBBBBBBBW',
  'WWWWWWWWWWWW',
];
const FLOWER = ['.F.', 'FCF', '.F.', '.L.'];
const TORCH = [
  '...F....',
  '..FF..F.',
  '.FFYF.F.',
  '.FYYFFF.',
  'FFYWYFF.',
  '.FYWYF..',
  '..YYY...',
  '.WWWWW..',
  '..WWW...',
  '..WWW...',
  '..WWW...',
  '..WWW...',
  '..WWW...',
  '.WWWWW..',
];
const SKULL = [
  '..XXXXX..',
  '.XXXXXXX.',
  'XXXXXXXXX',
  'XX..X..XX',
  'XX..X..XX',
  'XXXXXXXXX',
  '.XXX.XXX.',
  '..X.X.X..',
  '..XXXXX..',
];
const BONES = [
  'XX.......XX',
  '.XX.....XX.',
  '..XXX.XXX..',
  '....XXX....',
  '..XXX.XXX..',
  '.XX.....XX.',
  'XX.......XX',
];
const KEY = [
  '.XXX..........',
  'X...X.........',
  'X...XXXXXXXXXX',
  'X...X....X.X.X',
  '.XXX.....X.X..',
];
const CLOUD = [
  '......WWWW......',
  '....WWWWWWWW....',
  '..WWWWWWWWWWWW..',
  '.WWWWWWWWWWWWWW.',
  'WWWWWWWWWWWWWWWW',
  'SWWWWWWWWWWWWWWS',
  '.SSSSSSSSSSSSSS.',
];
const COIN = ['..YY..', '.YYYY.', 'YYWYYO', 'YYWYYO', 'YYWYYO', 'YYWYYO', '.YYYO.', '..OO..'];
const STAR_POWER = [
  '....YY....',
  '....YY....',
  '...YYYY...',
  'YYYYYYYYYY',
  '.YYEYYEYY.',
  '..YYYYYY..',
  '..YYYYYY..',
  '.YYY..YYY.',
  '.YY....YY.',
];
const PICKAXE = [
  '.....XXXX...',
  '....XWWWWX..',
  '.....XXXWWX.',
  '......XBXWX.',
  '.....XBX.XWX',
  '....XBX...XX',
  '...XBX......',
  '..XBX.......',
  '.XBX........',
  'XBX.........',
  'XX..........',
]
const DRAGON = [
  '..........WW.......WW.......',
  '.........WWW......WWW.......',
  '........WWLW.....WWLW.......',
  '.......WWLLW....WWLLW.......',
  '......WWLLLW...WWLLLW....HH.',
  '.....WWLLLLWW.WWLLLLW...HHHH',
  '......BBBBBBBBBBBBBBBB.HHHEH',
  '..T..BBBBBBBBBBBBBBBBBBHHHHH',
  '.TT.BBYYYYYYYYYYYYBBBBHHH...',
  'TT..BBB.......BB..BB..HH....',
  'T....B........B....B........',
]
const FIRE = ['..YYF..', 'YYYFFF.', '.YFFFFR', 'YYFFR..', '..FR...'];
const FLAG = ['P.....', 'PFFFF.', 'PFFFFF', 'PFFF..', 'P.....', 'P.....', 'P.....'];

/* --------------------------------- arcade --------------------------------- */

function arcade(p: { ship: string; laser: string; a: string; b: string; c: string; shield: string; star: string[] }, mode: string) {
  const s = 4;
  // Bottom right: the player ship firing, under a shield bunker.
  const bunker = [
    '....XXXXXXXXXX....',
    '...XXXXXXXXXXXX...',
    '..XXXXXXXXXXXXXX..',
    '.XXXXXXXXXXXXXXXX.',
    'XXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXX',
    'XXXXX........XXXXX',
    'XXXX..........XXXX',
  ];
  const ship = sprite(SHIP, { X: p.ship }, 30, 50, s) + rect(36, 18, 1, 6, p.laser, s) + rect(36, 30, 1, 4, p.laser, s);
  const corner =
    sprite(bunker, { X: p.shield }, 6, 38, s) +
    sprite(CRAB, { X: p.c }, 12, 4, s) +
    ship +
    rect(0, 59, 64, 1, p.ship, s);
  // Bottom left: a formation of invaders.
  let army = '';
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 3; col++) {
      const map = row === 0 ? SQUID : row === 1 ? INVADER : CRAB;
      const color = row === 0 ? p.a : row === 1 ? p.b : p.c;
      army += sprite(map, { X: color }, col * 15 + (row === 0 ? 2 : 0), row * 12, s);
    }
  // Top right: the mystery saucer.
  const saucer = sprite(SAUCER, { X: p.a }, 2, 2, 5) + sprite(['X.X', '.X.', 'X.X'], { X: p.star[0]! }, 1, 0, 5);
  return {
    [`arcade-ship-${mode}`]: pixelSvg(64 * s, 60 * s, corner),
    [`arcade-army-${mode}`]: pixelSvg(44 * s, 34 * s, `<g opacity='0.7'>${army}</g>`),
    [`arcade-saucer-${mode}`]: pixelSvg(20 * 5, 10 * 5, saucer),
    [`arcade-stars-${mode}`]: scatter(160, 160, 14, p.star, 7, 3),
  };
}

/* -------------------------------- bolsillo -------------------------------- */

function bolsillo(p: { d: string; m: string; l: string; x: string }, mode: string) {
  const s = 5;
  const hero = sprite(HERO_SWORD, { H: p.d, S: p.m, E: p.d, T: p.d, B: p.l, P: p.m, W: p.d, G: p.m }, 2, 2, s);
  const grass = (x: number) => sprite(['.X.X.', 'X.X.X'], { X: p.m }, x, 17, s);
  const corner = hero + rect(0, 16, 22, 1, p.d, s) + grass(1) + grass(9) + grass(15);
  const slime = sprite(SLIME, { X: p.m, L: p.l, E: p.d }, 1, 3, s) + rect(0, 11, 16, 1, p.d, s);
  let hearts = '';
  for (let i = 0; i < 3; i++) hearts += sprite(i === 2 ? HALF_HEART : HEART, { X: p.d, W: p.l, E: p.m }, i * 9, 0, 4);
  // A dot-matrix screen: every 4px cell with a 1px darker seam.
  const grid = `<rect x='0' y='0' width='4' height='1' fill='${p.x}'/><rect x='0' y='0' width='1' height='4' fill='${p.x}'/>`;
  return {
    [`bolsillo-hero-${mode}`]: pixelSvg(22 * s, 19 * s, corner),
    [`bolsillo-slime-${mode}`]: pixelSvg(16 * s, 12 * s, slime),
    [`bolsillo-hearts-${mode}`]: pixelSvg(26 * 4, 6 * 4, hearts),
    [`bolsillo-grid-${mode}`]: pixelSvg(4, 4, grid),
  };
}

/* -------------------------------- aventura -------------------------------- */

function aventura(
  p: { g: string; l: string; d: string; t: string; path: string; edge: string; hair: string; skin: string; tunic: string; boot: string; wood: string; band: string; gold: string; tuft: string; flower: string; eye: string },
  mode: string,
) {
  const s = 4;
  const tree = (x: number, y: number) => sprite(TREE, { G: p.g, L: p.l, D: p.d, T: p.t }, x, y, s);
  const chest = sprite(CHEST, { W: p.band, B: p.wood, Y: p.gold }, 34, 26, s);
  const corner = tree(0, 4) + tree(12, 0) + tree(24, 8) + chest + tree(40, 12);
  // A dirt path with stones and the hero walking on it.
  let path = '';
  for (let y = 0; y < 30; y++) {
    const x = 6 + Math.round(Math.sin(y / 5) * 3);
    path += rect(x, y, 9, 1, p.path, s);
  }
  path += rect(9, 6, 2, 1, p.edge, s) + rect(12, 15, 2, 1, p.edge, s) + rect(7, 24, 2, 1, p.edge, s);
  const hero = sprite(HERO, { H: p.hair, S: p.skin, E: p.eye, T: p.tunic, B: p.boot, P: p.boot }, 6, 10, s);
  const flowers =
    sprite(FLOWER, { F: p.flower, C: p.gold, L: p.l }, 18, 20, s) + sprite(FLOWER, { F: p.flower, C: p.gold, L: p.l }, 1, 26, s);
  // Grass tile: tufts of three blades scattered at random, a flower here and there.
  const tuft = (x: number, y: number, c: string) => `<path d='M${x} ${y}h2v-4h-2zM${x + 3} ${y}h2v-6h-2zM${x + 6} ${y}h2v-3h-2z' fill='${c}'/>`;
  const r = random(mode === 'light' ? 41 : 42);
  let tile = '';
  for (let i = 0; i < 9; i++) tile += tuft(Math.floor(r() * 112), 8 + Math.floor(r() * 116), i % 3 ? p.tuft : p.l);
  tile += `<rect x='${Math.floor(r() * 120)}' y='${Math.floor(r() * 120)}' width='3' height='3' fill='${p.flower}'/>`;
  return {
    [`aventura-woods-${mode}`]: pixelSvg(52 * s, 34 * s, corner),
    [`aventura-path-${mode}`]: pixelSvg(26 * s, 30 * s, path + hero + flowers),
    [`aventura-tree-${mode}`]: pixelSvg(12 * s, 12 * s, tree(0, 0)),
    [`aventura-grass-${mode}`]: pixelSvg(128, 128, tile),
  };
}

/* -------------------------------- mazmorra -------------------------------- */

function mazmorra(
  p: { brick: string; mortar: string; pattern: string; flame: string; core: string; iron: string; bone: string; key: string; wood: string },
  mode: string,
) {
  const s = 4;
  // The torch on its iron bracket; the wall behind it is the brick pattern.
  const torch = sprite(TORCH, { F: p.flame, Y: p.core, W: p.iron }, 2, 4, s) + rect(0, 11, 8, 1, p.iron, s);
  const floor = sprite(SKULL, { X: p.bone }, 2, 6, s) + sprite(BONES, { X: p.bone }, 13, 8, s) + rect(0, 15, 30, 1, p.mortar, s);
  // A small locked door with the key that opens it.
  const door =
    rect(4, 0, 18, 26, p.wood, s) +
    rect(6, 2, 14, 24, p.brick, s) +
    rect(8, 4, 1, 22, p.wood, s) +
    rect(12, 4, 1, 22, p.wood, s) +
    rect(16, 4, 1, 22, p.wood, s) +
    rect(6, 9, 14, 1, p.iron, s) +
    rect(6, 19, 14, 1, p.iron, s) +
    rect(17, 13, 2, 3, p.key, s) +
    sprite(KEY, { X: p.key }, 0, 28, s) +
    rect(0, 34, 26, 1, p.mortar, s);
  // Brick pattern: running bond, mortar lines only.
  const bricks = `<path d='M0 0h64M0 16h64M0 32h64M0 48h64M0 0v16M32 0v16M16 16v16M48 16v16M0 32v16M32 32v16M16 48v16M48 48v16' stroke='${p.pattern}' stroke-width='2' fill='none'/>`;
  return {
    [`mazmorra-torch-${mode}`]: pixelSvg(10 * s, 18 * s, torch),
    [`mazmorra-bones-${mode}`]: pixelSvg(26 * s, 16 * s, floor),
    [`mazmorra-door-${mode}`]: pixelSvg(26 * s, 35 * s, door),
    [`mazmorra-bricks-${mode}`]: pixelSvg(64, 64, bricks),
  };
}

/* ------------------------------- plataformas ------------------------------ */

function plataformas(
  p: { brick: string; mortar: string; ground: string; groundTop: string; pipe: string; pipeLight: string; pipeDark: string; coin: string; coinEdge: string; shine: string; cloud: string; cloudShade: string; star: string; eye: string },
  mode: string,
) {
  const s = 4;
  const brick = (x: number, y: number) =>
    rect(x, y, 8, 8, p.brick, s) +
    rect(x, y + 3, 8, 1, p.mortar, s) +
    rect(x, y + 7, 8, 1, p.mortar, s) +
    rect(x + 3, y, 1, 3, p.mortar, s) +
    rect(x + 6, y + 4, 1, 3, p.mortar, s) +
    rect(x + 1, y + 4, 1, 3, p.mortar, s);
  const coin = (x: number, y: number) => sprite(COIN, { Y: p.coin, O: p.coinEdge, W: p.shine }, x, y, s);
  // Bottom right: ground, a pipe and a coin arc.
  const pipe =
    rect(30, 20, 16, 4, p.pipe, s) +
    rect(32, 24, 12, 18, p.pipe, s) +
    rect(33, 24, 2, 18, p.pipeLight, s) +
    rect(31, 20, 2, 4, p.pipeLight, s) +
    rect(42, 24, 2, 18, p.pipeDark, s) +
    rect(44, 20, 2, 4, p.pipeDark, s);
  let ground = '';
  for (let x = 0; x < 64; x += 8) ground += rect(x, 42, 8, 8, p.ground, s) + rect(x, 42, 8, 2, p.groundTop, s) + rect(x + 7, 42, 1, 8, p.mortar, s);
  const corner = pipe + ground + coin(4, 22) + coin(12, 14) + coin(20, 10) + brick(4, 32) + brick(12, 32) + brick(20, 32);
  // Bottom left: a staircase of bricks.
  let stairs = '';
  for (let i = 0; i < 4; i++) for (let j = 0; j <= i; j++) stairs += brick(i * 8, 24 - j * 8);
  // Top right: a floating row with a star block.
  const row =
    brick(0, 10) +
    brick(8, 10) +
    rect(16, 10, 8, 8, p.coin, s) +
    rect(16, 10, 8, 1, p.shine, s) +
    rect(16, 17, 8, 1, p.coinEdge, s) +
    sprite(['.X.', 'XXX', '.X.'], { X: p.coinEdge }, 18.5, 12.5, s) +
    brick(24, 10) +
    sprite(STAR_POWER, { Y: p.star, E: p.eye }, 14, 0, s);
  const clouds = sprite(CLOUD, { W: p.cloud, S: p.cloudShade }, 2, 4, 4) + sprite(CLOUD, { W: p.cloud, S: p.cloudShade }, 34, 22, 3);
  return {
    [`plataformas-pipe-${mode}`]: pixelSvg(64 * s, 50 * s, corner),
    [`plataformas-stairs-${mode}`]: pixelSvg(32 * s, 32 * s, stairs),
    [`plataformas-blocks-${mode}`]: pixelSvg(32 * s, 18 * s, row),
    // At night the clouds would read as smudges: stars instead.
    [`plataformas-clouds-${mode}`]: mode === 'dark' ? scatter(220, 140, 10, [p.star, p.cloud, '#ffffff'], 9, 3) : pixelSvg(220, 140, clouds),
  };
}

/* --------------------------------- bloques -------------------------------- */

function bloques(
  p: { grass: string; grassDark: string; dirt: string; dirtDark: string; stone: string; stoneDark: string; ore: string; ore2: string; leaf: string; leafDark: string; log: string; logDark: string; sun: string; iron: string; handle: string; speck: string },
  mode: string,
) {
  const s = 3;
  // One 16×16 block, its texture noise seeded so every block differs.
  const block = (x: number, y: number, kind: 'grass' | 'dirt' | 'stone' | 'ore' | 'ore2' | 'leaf' | 'log', seed: number) => {
    const r = random(seed);
    const base = { grass: p.dirt, dirt: p.dirt, stone: p.stone, ore: p.stone, ore2: p.stone, leaf: p.leaf, log: p.log }[kind];
    const dark = { grass: p.dirtDark, dirt: p.dirtDark, stone: p.stoneDark, ore: p.stoneDark, ore2: p.stoneDark, leaf: p.leafDark, log: p.logDark }[kind];
    let out = rect(x, y, 16, 16, base, s);
    for (let i = 0; i < 9; i++) out += rect(x + Math.floor(r() * 16), y + Math.floor(r() * 16), 1 + Math.floor(r() * 3), 1, dark, s);
    if (kind === 'grass') {
      out += rect(x, y, 16, 4, p.grass, s);
      for (let i = 0; i < 16; i += 2) out += rect(x + i, y + 4, 1, 1 + Math.floor(r() * 3), p.grass, s);
      for (let i = 0; i < 6; i++) out += rect(x + Math.floor(r() * 16), y + Math.floor(r() * 3), 1, 1, p.grassDark, s);
    }
    if (kind === 'ore' || kind === 'ore2')
      for (let i = 0; i < 5; i++) {
        const ox = x + 2 + Math.floor(r() * 11);
        const oy = y + 2 + Math.floor(r() * 11);
        out += rect(ox, oy, 2, 2, kind === 'ore' ? p.ore : p.ore2, s) + rect(ox + 1, oy + 1, 1, 1, p.stoneDark, s);
      }
    if (kind === 'log') out += rect(x + 3, y, 1, 16, p.logDark, s) + rect(x + 10, y, 1, 16, p.logDark, s);
    return out;
  };
  const tree = block(32, 0, 'leaf', 1) + block(16, 16, 'leaf', 2) + block(32, 16, 'leaf', 3) + block(48, 16, 'leaf', 4) + block(32, 32, 'log', 5) + block(32, 48, 'log', 6);
  const corner = tree + block(0, 64, 'grass', 7) + block(16, 64, 'grass', 8) + block(32, 64, 'grass', 9) + block(48, 64, 'grass', 10) + block(16, 48, 'grass', 11) + block(0, 80, 'dirt', 12) + block(16, 80, 'stone', 13) + block(32, 80, 'dirt', 14) + block(48, 80, 'ore', 15);
  const left = block(0, 16, 'stone', 21) + block(16, 16, 'ore2', 22) + block(0, 0, 'ore', 23) + sprite(PICKAXE, { X: p.stoneDark, W: p.iron, B: p.handle }, 18, 2, s);
  const sun = rect(2, 2, 16, 16, p.sun, s) + rect(4, 4, 12, 12, p.sun, s, 0.6) + rect(0, 0, 20, 20, p.sun, s, 0.25);
  // Background: sparse square specks, like floating particles.
  const r = random(31);
  let specks = '';
  for (let i = 0; i < 10; i++) specks += `<rect x='${Math.floor(r() * 30) * 4}' y='${Math.floor(r() * 30) * 4}' width='4' height='4' fill='${p.speck}'/>`;
  return {
    [`bloques-hill-${mode}`]: pixelSvg(64 * s, 96 * s, corner),
    [`bloques-ores-${mode}`]: pixelSvg(32 * s, 32 * s, left),
    [`bloques-sun-${mode}`]: pixelSvg(20 * s, 20 * s, sun),
    [`bloques-specks-${mode}`]: pixelSvg(120, 120, specks),
  };
}

/* --------------------------------- ciudad --------------------------------- */

function ciudad(p: { far: string; near: string; window: string; moon: string; moonShade: string; star: string[]; antenna: string }, mode: string) {
  const s = 4;
  const r = random(mode === 'light' ? 3 : 4);
  // Two rows of buildings: a pale far one, a near one with windows.
  const skyline = (width: number, seed: number) => {
    const rr = random(seed);
    let far = '';
    let near = '';
    for (let x = 0; x < width; ) {
      const w = 5 + Math.floor(rr() * 5);
      const h = 14 + Math.floor(rr() * 22);
      far += rect(x, 44 - h - 6, w, h + 6, p.far, s);
      x += w;
    }
    for (let x = 0; x < width; ) {
      const w = 6 + Math.floor(rr() * 6);
      const h = 10 + Math.floor(rr() * 20);
      near += rect(x, 44 - h, w, h, p.near, s);
      for (let wy = 44 - h + 2; wy < 42; wy += 3)
        for (let wx = x + 1; wx < x + w - 1; wx += 2) if (rr() < 0.4) near += rect(wx, wy, 1, 1, p.window, s);
      if (rr() < 0.3) near += rect(x + Math.floor(w / 2), 44 - h - 4, 1, 4, p.antenna, s);
      x += w + 1;
    }
    return far + near;
  };
  const moon = (x: number, y: number) =>
    sprite(
      ['..XXXX..', '.XXXXXX.', 'XXXXXXSX', 'XXSXXXXX', 'XXXXXXXX', 'XXXXSXXX', '.XXXXXX.', '..XXXX..'],
      { X: p.moon, S: p.moonShade },
      x,
      y,
      s,
    );
  let stars = '';
  for (let i = 0; i < 16; i++) {
    const x = Math.floor(r() * 98);
    const y = Math.floor(r() * 98);
    const c = p.star[i % p.star.length]!;
    stars += i % 4 === 0 ? sprite(['.X.', 'XXX', '.X.'], { X: c }, x, y, 2) : rect(x, y, 1, 1, c, 2);
  }
  return {
    [`ciudad-skyline-${mode}`]: pixelSvg(64 * s, 44 * s, skyline(64, 11)),
    [`ciudad-block-${mode}`]: pixelSvg(36 * s, 44 * s, skyline(36, 12)),
    [`ciudad-moon-${mode}`]: pixelSvg(8 * s, 8 * s, moon(0, 0)),
    [`ciudad-stars-${mode}`]: pixelSvg(200, 200, stars),
  };
}

/* ------------------------------- reinopixel ------------------------------- */

function reinopixel(
  p: { wall: string; wallDark: string; roof: string; flag: string; pole: string; window: string; gate: string; dragon: string; belly: string; wing: string; eye: string; fire: string; fireCore: string; fireTip: string; hill: string; hillDark: string; sparkle: string[] },
  mode: string,
) {
  const s = 4;
  const crenels = (x: number, y: number, w: number) => {
    let out = '';
    for (let i = 0; i < w; i += 2) out += rect(x + i, y, 1, 2, p.wall, s);
    return out;
  };
  const tower = (x: number, top: number, w: number) =>
    rect(x, top, w, 50 - top, p.wall, s) +
    rect(x + w - 1, top, 1, 50 - top, p.wallDark, s) +
    crenels(x, top - 2, w) +
    rect(x + Math.floor(w / 2) - 1, top + 4, 2, 3, p.window, s) +
    sprite(FLAG, { P: p.pole, F: p.flag }, x + Math.floor(w / 2), top - 9, s);
  const castle =
    rect(0, 46, 64, 4, p.hill, s) +
    rect(0, 48, 64, 2, p.hillDark, s) +
    tower(6, 14, 8) +
    tower(46, 14, 8) +
    rect(14, 26, 32, 22, p.wall, s) +
    crenels(14, 24, 32) +
    tower(25, 8, 10) +
    rect(26, 38, 8, 10, p.gate, s) +
    rect(27, 37, 6, 1, p.gate, s) +
    rect(18, 32, 2, 3, p.window, s) +
    rect(40, 32, 2, 3, p.window, s);
  const dragon =
    sprite(DRAGON, { W: p.wing, L: p.belly, B: p.dragon, T: p.dragon, H: p.dragon, E: p.eye, Y: p.belly }, 0, 2, s) +
    sprite(FIRE, { Y: p.fireTip, F: p.fire, R: p.fireCore }, 28, 8, s);
  // A small knight on a hill, bottom left.
  const knight = sprite(
    ['..XXX..', '.XXXXX.', '.XSXSX.', '..XXX..', 'P.XXX.W', 'PXXXXXW', 'P.XXX.W', '..X.X..', '.XX.XX.'],
    { X: p.wallDark, S: p.window, P: p.flag, W: p.pole },
    6,
    2,
    s,
  );
  const hill = `<path d='M0 ${18 * s}Q${16 * s} ${9 * s} ${32 * s} ${14 * s}T${64 * s} ${12 * s}V${22 * s}H0Z' fill='${p.hill}'/>` + knight;
  let sparkles = '';
  const r = random(mode === 'light' ? 5 : 6);
  for (let i = 0; i < 7; i++)
    sparkles += sprite(['.X.', 'XXX', '.X.'], { X: p.sparkle[i % p.sparkle.length]! }, Math.floor(r() * 88), Math.floor(r() * 88), 2);
  return {
    [`reinopixel-castle-${mode}`]: pixelSvg(64 * s, 50 * s, castle),
    [`reinopixel-dragon-${mode}`]: pixelSvg(35 * s, 14 * s, dragon),
    [`reinopixel-hill-${mode}`]: pixelSvg(64 * s, 22 * s, hill),
    [`reinopixel-sparkles-${mode}`]: pixelSvg(180, 180, sparkles),
  };
}

export default {
  ...arcade({ ship: '#1f4fd1', laser: '#e0187a', a: '#c2187a', b: '#e05a00', c: '#7a2bd6', shield: '#18a36a', star: ['#e0187a', '#f5a400', '#1f4fd1'] }, 'light'),
  ...arcade({ ship: '#3df5ff', laser: '#ff4fd8', a: '#ff4fd8', b: '#ffd23f', c: '#8f7bff', shield: '#3dff8f', star: ['#ffffff', '#3df5ff', '#ff4fd8'] }, 'dark'),

  ...bolsillo({ d: '#0f380f', m: '#306230', l: '#9bbc0f', x: '#c6d79e' }, 'light'),
  ...bolsillo({ d: '#9bbc0f', m: '#6a9a2a', l: '#0f380f', x: '#112011' }, 'dark'),

  ...aventura(
    { g: '#3f9a3a', l: '#7cc95a', d: '#256b2a', t: '#7a4a22', path: '#e5cf98', edge: '#c9ae6e', hair: '#7a3b12', skin: '#f2c49b', tunic: '#2f6fd8', boot: '#5a3215', wood: '#a0621f', band: '#5a3215', gold: '#f2b51d', tuft: '#9bcf7a', flower: '#e8508a', eye: '#1d1d1d' },
    'light',
  ),
  ...aventura(
    { g: '#1f5a33', l: '#2f7a42', d: '#123d22', t: '#4a2e18', path: '#3a3528', edge: '#2a2619', hair: '#5a2a0e', skin: '#c99a76', tunic: '#3a5fb0', boot: '#3a2210', wood: '#6e4418', band: '#2e1c0c', gold: '#ffcc33', tuft: '#1f3f26', flower: '#d4f06a', eye: '#0b0b0b' },
    'dark',
  ),

  ...mazmorra({ brick: '#cbc4b6', mortar: '#a69d8b', pattern: '#d8d2c5', flame: '#e0501a', core: '#f7b733', iron: '#4a4540', bone: '#efe9da', key: '#c8930f', wood: '#6e4a26' }, 'light'),
  ...mazmorra({ brick: '#2a2630', mortar: '#1b1820', pattern: '#1e1b23', flame: '#ff6a1f', core: '#ffc23d', iron: '#5c5560', bone: '#d9d2c2', key: '#f2c040', wood: '#4a3018' }, 'dark'),

  ...plataformas(
    { brick: '#c8582a', mortar: '#6e2a10', ground: '#b5652a', groundTop: '#58b33a', pipe: '#2ea84a', pipeLight: '#7fe08a', pipeDark: '#17702c', coin: '#f7c21b', coinEdge: '#b47a00', shine: '#fff3b0', cloud: '#ffffff', cloudShade: '#bcdcf5', star: '#f7c21b', eye: '#1d1d1d' },
    'light',
  ),
  ...plataformas(
    { brick: '#3a5ac8', mortar: '#1a2660', ground: '#2a3a8a', groundTop: '#4a74e0', pipe: '#2ea84a', pipeLight: '#7fe08a', pipeDark: '#17602c', coin: '#ffd23f', coinEdge: '#b48a00', shine: '#fff6c8', cloud: '#2a3358', cloudShade: '#1c2444', star: '#ffd23f', eye: '#0b0b0b' },
    'dark',
  ),

  ...bloques(
    { grass: '#5fb33a', grassDark: '#3f8a26', dirt: '#8a5a33', dirtDark: '#6b4325', stone: '#9a9a9a', stoneDark: '#6e6e6e', ore: '#3ad6d0', ore2: '#f2c12e', leaf: '#3f8f2e', leafDark: '#2c6b20', log: '#7a5530', logDark: '#563a1f', sun: '#ffd94a', iron: '#cfd6dc', handle: '#7a5530', speck: '#9fc4e8' },
    'light',
  ),
  ...bloques(
    { grass: '#3c7a2a', grassDark: '#2a5a1d', dirt: '#5a3b22', dirtDark: '#432b18', stone: '#4a4a52', stoneDark: '#33333a', ore: '#3ad6d0', ore2: '#e05a1a', leaf: '#245a1c', leafDark: '#1a4314', log: '#4a3420', logDark: '#33230f', sun: '#e8e8f0', iron: '#a8b0b8', handle: '#5a3b22', speck: '#2a2f3a' },
    'dark',
  ),

  ...ciudad({ far: '#e9b7c8', near: '#8a4a8f', window: '#ffe08a', moon: '#ff8a3d', moonShade: '#ff8a3d', star: ['#ffffff', '#ffd6e4'], antenna: '#6e3a73' }, 'light'),
  ...ciudad({ far: '#1b2050', near: '#111538', window: '#ffd84a', moon: '#f4f0d0', moonShade: '#cfc9a0', star: ['#ffffff', '#9ad8ff', '#ffd84a'], antenna: '#2a3070' }, 'dark'),

  ...reinopixel(
    { wall: '#b9b3c9', wallDark: '#8a83a0', roof: '#5a3fa0', flag: '#d23a5a', pole: '#4a4458', window: '#3a2f5a', gate: '#4a3424', dragon: '#2f8a4a', belly: '#c9d66a', wing: '#4cb06a', eye: '#f7d23a', fire: '#f27a1a', fireCore: '#e03a1a', fireTip: '#ffd23f', hill: '#a6d38a', hillDark: '#86b86a', sparkle: ['#d23a5a', '#5a3fa0', '#f2b51d'] },
    'light',
  ),
  ...reinopixel(
    { wall: '#3a3552', wallDark: '#2a2640', roof: '#5a3fa0', flag: '#ff5a7a', pole: '#8a83a0', window: '#ffd23f', gate: '#1c1410', dragon: '#3fb06a', belly: '#d8e67a', wing: '#2a7a46', eye: '#ffef5a', fire: '#ff8a2a', fireCore: '#ff4a1a', fireTip: '#ffe46a', hill: '#1f2a3a', hillDark: '#17202e', sparkle: ['#ffffff', '#ffd23f', '#a99cff'] },
    'dark',
  ),
} satisfies Record<string, string>;

