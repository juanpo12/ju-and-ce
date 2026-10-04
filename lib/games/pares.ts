import type { GameModule } from './module';
import { GameError } from './error';

export const MAX_FINGERS = 5;
/** First to 3 rounds. */
export const PARES_TARGET = 3;

export type ParesRound = {
  fingers: Record<string, number>;
  /** Who had «pares» this round. */
  even: string;
  winner: string;
};

export type ParesMatch = {
  game: 'pares';
  rounds: ParesRound[];
  /** Who already showed their hand this round (not how many fingers). */
  chosen: string[];
  /** Who has «pares» in the current round; it alternates every round. */
  even: string;
  score: Record<string, number>;
  target: number;
};

export type ParesMove = { game: 'pares'; fingers: number };

/** The fingers shown so far this round, until both are in. */
type ParesSecret = Record<string, number>;

/**
 * Pares o nones: each one shows 0 to 5 fingers at the same time. If the sum is
 * even, whoever has «pares» takes the round; if odd, whoever has «nones». The
 * hands stay in the secret until both are in. Who has «pares» alternates, and
 * there are no ties: the sum is always even or odd.
 */
const pares: GameModule<ParesMatch, ParesMove, ParesSecret> = {
  start: ({ players, starter }) => ({
    match: {
      game: 'pares',
      rounds: [],
      chosen: [],
      even: starter,
      score: { [players[0]]: 0, [players[1]]: 0 },
      target: PARES_TARGET,
    },
    secret: {},
  }),

  apply({ match, secret, me, move, players }) {
    if (match.chosen.includes(me)) throw new GameError('Ya mostraste tu mano. Esperá a la otra.');
    if (!Number.isInteger(move.fingers) || move.fingers < 0 || move.fingers > MAX_FINGERS) {
      throw new GameError(`Entre 0 y ${MAX_FINGERS} dedos.`);
    }

    const shown = { ...secret, [me]: move.fingers };
    const chosen = [...match.chosen, me];
    const [a, b] = players;
    if (shown[a] === undefined || shown[b] === undefined) {
      return { match: { ...match, chosen }, secret: shown };
    }

    const odd = players.find((p) => p !== match.even)!;
    const winner = (shown[a] + shown[b]) % 2 === 0 ? match.even : odd;
    const score = { ...match.score, [winner]: (match.score[winner] ?? 0) + 1 };
    const next: ParesMatch = {
      ...match,
      rounds: [...match.rounds, { fingers: { [a]: shown[a], [b]: shown[b] }, even: match.even, winner }],
      chosen: [],
      even: odd,
      score,
    };
    return { match: next, secret: {}, end: score[winner]! >= match.target ? { winnerId: winner } : undefined };
  },

  isValidMove: (o) => typeof o.fingers === 'number' && Number.isInteger(o.fingers),
};

export default pares;
