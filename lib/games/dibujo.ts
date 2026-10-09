import type { GameModule } from './module';
import { GameError } from './error';
import { DRAWING_WORDS } from './dibujo-words';

export const DRAWING_ROUNDS = 4;
export const ROUND_SECONDS = 100;
/** Coordinates are normalized to a 0–CANVAS square, whatever the screen size. */
export const CANVAS = 1000;
/** Limits that keep the row small: each stroke is simplified before it is sent. */
export const MAX_STROKE_POINTS = 240; // numbers, so 120 points
export const MAX_STROKES = 150;
export const MAX_GUESSES = 40;
export const MAX_GUESS_LENGTH = 40;
export const MIN_WIDTH = 2;
export const MAX_WIDTH = 60;

/** Colors are theme tokens, so the drawing follows the theme on both phones. */
export const STROKE_COLORS = ['tinta', 'acento', 'durazno', 'menta', 'borrar'] as const;
export type StrokeColor = (typeof STROKE_COLORS)[number];

export type Stroke = { color: StrokeColor; width: number; points: number[] };

export type DibujoRound = {
  drawer: string;
  guesser: string;
  /** Epoch ms when the clock started; null until the drawer begins. */
  startedAt: number | null;
  strokes: Stroke[];
  guesses: { text: string; hit: boolean }[];
  /** Set when the round ends. */
  result?: { word: string; guessed: boolean; points: Record<string, number> };
};

export type DibujoMatch = {
  game: 'dibujo';
  rounds: DibujoRound[];
  total: number;
  seconds: number;
  score: Record<string, number>;
};

export type DibujoMove =
  | { game: 'dibujo'; begin: true }
  | { game: 'dibujo'; stroke: Stroke }
  | { game: 'dibujo'; undo: true }
  | { game: 'dibujo'; clear: true }
  | { game: 'dibujo'; guess: string }
  | { game: 'dibujo'; timeout: true };

type DibujoSecret = { word: string; used: number[] };

/** Lowercase, no accents, no punctuation, single spaces: «¡Pingüino!» = «pinguino». */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function newRound(drawer: string, guesser: string): DibujoRound {
  return { drawer, guesser, startedAt: null, strokes: [], guesses: [] };
}

function pickWord(used: number[], rng: { int(n: number): number }): { index: number; used: number[] } {
  const free = DRAWING_WORDS.map((_, i) => i).filter((i) => !used.includes(i));
  const index = free[rng.int(free.length)]!;
  return { index, used: [...used, index] };
}

const current = (match: DibujoMatch) => match.rounds[match.rounds.length - 1]!;

/**
 * Who drew and who guessed, alternating; the word lives in the secret and only
 * the drawer sees it (`privateView`). The strokes are public so both phones
 * draw the same picture. A correct guess scores by speed: 3, 2 or 1 for the
 * guesser by thirds of the clock, and 2 for the drawer.
 */
const dibujo: GameModule<DibujoMatch, DibujoMove, DibujoSecret> = {
  start({ players, starter }, rng) {
    const other = players[0] === starter ? players[1] : players[0];
    const { index, used } = pickWord([], rng);
    return {
      match: {
        game: 'dibujo',
        rounds: [newRound(starter, other)],
        total: DRAWING_ROUNDS,
        seconds: ROUND_SECONDS,
        score: { [players[0]]: 0, [players[1]]: 0 },
      },
      secret: { word: DRAWING_WORDS[index]!, used },
    };
  },

  apply({ match, secret, me, move, players, rng, now }) {
    const round = current(match);
    if (round.result) throw new GameError('La ronda ya terminó.');
    const deadline = round.startedAt === null ? null : round.startedAt + match.seconds * 1000;
    const replace = (r: DibujoRound): DibujoMatch => ({ ...match, rounds: [...match.rounds.slice(0, -1), r] });

    if ('begin' in move) {
      if (me !== round.drawer) throw new GameError('Empieza quien dibuja.');
      if (round.startedAt !== null) throw new GameError('El reloj ya está corriendo.');
      return { match: replace({ ...round, startedAt: now }), secret };
    }

    if ('stroke' in move || 'undo' in move || 'clear' in move) {
      if (me !== round.drawer) throw new GameError('Ahora dibuja la otra persona.');
      if (deadline === null) throw new GameError('Primero tocá «Empezar».');
      if (now > deadline) throw new GameError('Se terminó el tiempo.');
      if ('undo' in move) return { match: replace({ ...round, strokes: round.strokes.slice(0, -1) }), secret };
      if ('clear' in move) return { match: replace({ ...round, strokes: [] }), secret };
      if (round.strokes.length >= MAX_STROKES) throw new GameError('Ya no entran más trazos. Borrá algo.');
      return { match: replace({ ...round, strokes: [...round.strokes, move.stroke] }), secret };
    }

    if ('guess' in move) {
      if (me !== round.guesser) throw new GameError('Quien dibuja no adivina.');
      if (deadline === null) throw new GameError('Todavía no empezó a dibujar.');
      if (now > deadline) throw new GameError('Se terminó el tiempo.');
      if (round.guesses.length >= MAX_GUESSES) throw new GameError('Ya no quedan intentos.');
      const text = move.guess.trim().slice(0, MAX_GUESS_LENGTH);
      if (!normalize(text)) throw new GameError('Escribí algo.');
      const hit = normalize(text) === normalize(secret.word);
      const guesses = [...round.guesses, { text, hit }];
      if (!hit) return { match: replace({ ...round, guesses }), secret };

      const third = (match.seconds * 1000) / 3;
      const elapsed = now - round.startedAt!;
      const points = {
        [round.guesser]: elapsed < third ? 3 : elapsed < third * 2 ? 2 : 1,
        [round.drawer]: 2,
      };
      return finish(match, { ...round, guesses }, secret, points, true, players, rng);
    }

    // timeout
    if (deadline === null || now <= deadline) throw new GameError('Todavía queda tiempo.');
    return finish(match, round, secret, {}, false, players, rng);
  },

  isValidMove(o) {
    const keys = Object.keys(o).filter((k) => k !== 'game');
    if (keys.length !== 1) return false;
    const [k] = keys;
    if (k === 'begin' || k === 'undo' || k === 'clear' || k === 'timeout') return o[k] === true;
    if (k === 'guess') return typeof o.guess === 'string' && o.guess.length <= 200;
    if (k !== 'stroke') return false;
    const s = o.stroke as Record<string, unknown> | null;
    if (!s || typeof s !== 'object') return false;
    const { color, width, points } = s as { color: unknown; width: unknown; points: unknown };
    return (
      Object.keys(s).length === 3 &&
      typeof color === 'string' &&
      (STROKE_COLORS as readonly string[]).includes(color) &&
      typeof width === 'number' &&
      Number.isInteger(width) &&
      width >= MIN_WIDTH &&
      width <= MAX_WIDTH &&
      Array.isArray(points) &&
      points.length >= 2 &&
      points.length <= MAX_STROKE_POINTS &&
      points.length % 2 === 0 &&
      points.every((n) => Number.isInteger(n) && n >= 0 && n <= CANVAS)
    );
  },

  privateView({ match, secret, me }) {
    const round = current(match);
    return !round.result && round.drawer === me ? secret.word : null;
  },
};

/** Closes the round (revealing the word) and opens the next one, or ends the match. */
function finish(
  match: DibujoMatch,
  round: DibujoRound,
  secret: DibujoSecret,
  points: Record<string, number>,
  guessed: boolean,
  players: [string, string],
  rng: { int(n: number): number },
) {
  const score = { ...match.score };
  for (const [p, n] of Object.entries(points)) score[p] = (score[p] ?? 0) + n;
  const done: DibujoRound = { ...round, result: { word: secret.word, guessed, points } };
  const rounds = [...match.rounds.slice(0, -1), done];

  if (rounds.length >= match.total) {
    const [a, b] = players;
    const winnerId = score[a] === score[b] ? null : score[a]! > score[b]! ? a : b;
    return { match: { ...match, rounds, score }, secret, end: { winnerId } };
  }
  const { index, used } = pickWord(secret.used, rng);
  return {
    match: { ...match, rounds: [...rounds, newRound(round.guesser, round.drawer)], score },
    secret: { word: DRAWING_WORDS[index]!, used },
  };
}

export default dibujo;
