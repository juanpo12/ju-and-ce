import type { GameModule } from './module';
import type { Rng } from './random';
import { GameError } from './error';

/** First to 3 rounds. */
export const DUELO_TARGET = 3;
/** The random wait before «¡FUEGO!», per round. */
export const MIN_DELAY_MS = 2000;
export const MAX_DELAY_MS = 6000;
/** Faster than this is not a reaction, it is a guess: it counts as early. */
export const MIN_REACTION_MS = 80;
/** After this the phone gives up waiting and reports it. */
export const MAX_REACTION_MS = 5000;

export type DueloShot = { early: true } | { reactionMs: number };

export type DueloRound = {
  shots: Record<string, DueloShot>;
  /** Null: void round (both early, or the exact same time), replayed. */
  winner: string | null;
};

export type DueloMatch = {
  game: 'duelo';
  /** How long this round's phones wait before «¡FUEGO!». Public, never shown. */
  delayMs: number;
  rounds: DueloRound[];
  /** Who already drew this round (not how fast). */
  drawn: string[];
  score: Record<string, number>;
  target: number;
};

export type DueloMove = { game: 'duelo'; reactionMs?: number; early?: boolean };

/** This round's shots, until both are in. */
type DueloSecret = Record<string, DueloShot>;

const nextDelay = (rng: Rng) => MIN_DELAY_MS + rng.int((MAX_DELAY_MS - MIN_DELAY_MS) / 100 + 1) * 100;

/** What a reported shot counts as: too fast is early. */
export function toShot(move: DueloMove): DueloShot {
  if (move.early === true) return { early: true };
  const ms = move.reactionMs;
  if (typeof ms !== 'number' || !Number.isInteger(ms) || ms < 0 || ms > MAX_REACTION_MS) {
    throw new GameError('Ese tiempo no es válido.');
  }
  return ms < MIN_REACTION_MS ? { early: true } : { reactionMs: ms };
}

/** Who takes the round, or null to replay it. */
export function settle(a: DueloShot, b: DueloShot, players: [string, string]): string | null {
  const aEarly = 'early' in a;
  const bEarly = 'early' in b;
  if (aEarly && bEarly) return null;
  if (aEarly) return players[1];
  if (bEarly) return players[0];
  if (a.reactionMs === b.reactionMs) return null;
  return a.reactionMs < b.reactionMs ? players[0] : players[1];
}

/**
 * Duelo del oeste: each phone waits its own random delay and shows «¡FUEGO!»;
 * the player taps and the phone reports how long it took, measured against
 * its own screen, so network lag does not count. Drawing before the signal
 * loses the round. Shots stay in the secret until both are in.
 */
const duelo: GameModule<DueloMatch, DueloMove, DueloSecret> = {
  start: ({ players }, rng) => ({
    match: {
      game: 'duelo',
      delayMs: nextDelay(rng),
      rounds: [],
      drawn: [],
      score: { [players[0]]: 0, [players[1]]: 0 },
      target: DUELO_TARGET,
    },
    secret: {},
  }),

  apply({ match, secret, me, move, players, rng }) {
    if (match.drawn.includes(me)) throw new GameError('Ya disparaste. Esperá al otro.');
    const shots = { ...secret, [me]: toShot(move) };
    const drawn = [...match.drawn, me];
    const [a, b] = players;
    if (!shots[a] || !shots[b]) return { match: { ...match, drawn }, secret: shots };

    const winner = settle(shots[a], shots[b], players);
    const score = winner ? { ...match.score, [winner]: (match.score[winner] ?? 0) + 1 } : match.score;
    const next: DueloMatch = {
      ...match,
      delayMs: nextDelay(rng),
      rounds: [...match.rounds, { shots: { [a]: shots[a], [b]: shots[b] }, winner }],
      drawn: [],
      score,
    };
    return { match: next, secret: {}, end: winner && score[winner]! >= match.target ? { winnerId: winner } : undefined };
  },

  isValidMove: (o) =>
    o.early === true || (typeof o.reactionMs === 'number' && Number.isInteger(o.reactionMs)),
};

export default duelo;
