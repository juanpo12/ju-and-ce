import type { GameModule } from './module';
import { GameError } from './error';

export const COLORES_SECONDS = 20;
/** Nobody answers ten a second for twenty seconds; above this is a bug or a cheat. */
export const MAX_SCORE = 200;

export const INKS = ['rojo', 'azul', 'verde', 'amarillo'] as const;
export type Ink = (typeof INKS)[number];

export type ColoresMatch = {
  game: 'colores';
  seconds: number;
  /** Both phones build the same sequence of words and inks from this. */
  seed: number;
  /** Who already played (not how well). */
  done: string[];
  /** Revealed when both played. */
  scores?: Record<string, number>;
};

export type ColoresMove = { game: 'colores'; score: number };

/** The scores reported so far, until both are in. */
type ColoresSecret = Record<string, number>;

/**
 * The sequence a seed makes: each card is a color word painted in a different
 * ink. Deterministic, so both phones get the same cards. Runs in the browser.
 */
export function cards(seed: number, count: number): { word: Ink; ink: Ink }[] {
  let a = seed >>> 0;
  const next = (n: number) => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * n);
  };
  return Array.from({ length: count }, () => {
    const word = INKS[next(INKS.length)]!;
    const others = INKS.filter((i) => i !== word);
    return { word, ink: others[next(others.length)]! };
  });
}

/**
 * Colores: twenty seconds of color words painted in the wrong ink; tap the ink,
 * not the word. Each phone plays on its own and reports its score once; the
 * score stays hidden until both are in. Higher wins; the same score is a tie.
 */
const colores: GameModule<ColoresMatch, ColoresMove, ColoresSecret> = {
  start: (_, rng) => ({
    match: { game: 'colores', seconds: COLORES_SECONDS, seed: rng.int(2 ** 31), done: [] },
    secret: {},
  }),

  apply({ match, secret, me, move, players }) {
    if (match.done.includes(me)) throw new GameError('Ya jugaste tu ronda.');
    if (!Number.isInteger(move.score) || move.score < 0 || move.score > MAX_SCORE) {
      throw new GameError('Ese puntaje no es válido.');
    }
    const scores = { ...secret, [me]: move.score };
    const done = [...match.done, me];
    const [a, b] = players;
    if (scores[a] === undefined || scores[b] === undefined) return { match: { ...match, done }, secret: scores };

    return {
      match: { ...match, done, scores },
      secret: {},
      end: { winnerId: scores[a] === scores[b] ? null : scores[a] > scores[b] ? a : b },
    };
  },

  isValidMove: (o) => typeof o.score === 'number' && Number.isInteger(o.score),
};

export default colores;
