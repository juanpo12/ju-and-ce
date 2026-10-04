import type { GameModule, Players } from './module';
import { GameError } from './error';

export const PORUNO_MAX_PICK = 5;
export const PORUNO_TARGET = 25;
export const PORUNO_MAX_ROUNDS = 10;

export type PorunoRound = {
  picks: Record<string, number>;
  /** Points each one scored this round. */
  points: Record<string, number>;
  /** Who undercut the other (picked exactly one below), if anyone. */
  undercut: string | null;
};

export type PorunoMatch = {
  game: 'poruno';
  rounds: PorunoRound[];
  /** Who already picked this round (not what). */
  chosen: string[];
  score: Record<string, number>;
  target: number;
  maxRounds: number;
};

export type PorunoMove = { game: 'poruno'; pick: number };

/** The picks made so far this round, until both are in. */
type PorunoSecret = Record<string, number>;

/** How a round scores: one below steals both picks, otherwise each keeps their own. */
export function scoreRound(players: Players, picks: Record<string, number>) {
  const [a, b] = players;
  const pa = picks[a]!;
  const pb = picks[b]!;
  if (Math.abs(pa - pb) === 1) {
    const low = pa < pb ? a : b;
    const high = low === a ? b : a;
    return { points: { [low]: pa + pb, [high]: 0 }, undercut: low };
  }
  return { points: { [a]: pa, [b]: pb }, undercut: null };
}

/**
 * Por uno (Undercut): both pick 1 to 5 at the same time. Picking high is
 * greedy; picking exactly one below the other steals both numbers. First to
 * 25, or the higher score after 10 rounds. The picks stay in the secret until
 * both are in.
 */
const poruno: GameModule<PorunoMatch, PorunoMove, PorunoSecret> = {
  start: ({ players }) => ({
    match: {
      game: 'poruno',
      rounds: [],
      chosen: [],
      score: { [players[0]]: 0, [players[1]]: 0 },
      target: PORUNO_TARGET,
      maxRounds: PORUNO_MAX_ROUNDS,
    },
    secret: {},
  }),

  apply({ match, secret, me, move, players }) {
    if (match.chosen.includes(me)) throw new GameError('Ya elegiste. Esperá a que elija el otro.');
    if (!Number.isInteger(move.pick) || move.pick < 1 || move.pick > PORUNO_MAX_PICK) {
      throw new GameError(`Tiene que ser un número del 1 al ${PORUNO_MAX_PICK}.`);
    }

    const picks = { ...secret, [me]: move.pick };
    const chosen = [...match.chosen, me];
    const [a, b] = players;
    if (picks[a] === undefined || picks[b] === undefined) {
      return { match: { ...match, chosen }, secret: picks };
    }

    const { points, undercut } = scoreRound(players, picks);
    const score = { [a]: (match.score[a] ?? 0) + points[a]!, [b]: (match.score[b] ?? 0) + points[b]! };
    const rounds = [...match.rounds, { picks: { [a]: picks[a], [b]: picks[b] }, points, undercut }];
    const next: PorunoMatch = { ...match, rounds, chosen: [], score };

    const over = score[a]! >= match.target || score[b]! >= match.target || rounds.length >= match.maxRounds;
    const end = over ? { winnerId: score[a] === score[b] ? null : score[a]! > score[b]! ? a : b } : undefined;
    return { match: next, secret: {}, end };
  },

  isValidMove: (o) => typeof o.pick === 'number' && Number.isInteger(o.pick),
};

export default poruno;
