import type { GameModule } from './module';
import { GameError } from './error';

/** The pot of each round: it grows, and the last one is the big temptation. */
export const ROBAR_POTS = [2, 3, 4, 5, 8];

export type RobarChoice = 'share' | 'steal';

export type RobarRound = {
  pot: number;
  choices: Record<string, RobarChoice>;
  points: Record<string, number>;
};

export type RobarMatch = {
  game: 'robar';
  pots: number[];
  rounds: RobarRound[];
  /** Who already chose this round (not what). */
  chosen: string[];
  score: Record<string, number>;
};

export type RobarMove = { game: 'robar'; choice: RobarChoice };

/** The choices made so far this round, until both are in. */
type RobarSecret = Record<string, RobarChoice>;

/** Both share: half each (rounded up). One steals: all theirs. Both steal: nothing. */
export function splitPot(pot: number, mine: RobarChoice, theirs: RobarChoice): number {
  if (mine === 'share' && theirs === 'share') return Math.ceil(pot / 2);
  if (mine === 'steal' && theirs === 'share') return pot;
  return 0;
}

/**
 * Robar o compartir: five rounds, each with a pot. Both choose in secret
 * whether to share or steal; the choices are revealed together. Most points
 * after the last pot wins.
 */
const robar: GameModule<RobarMatch, RobarMove, RobarSecret> = {
  start: ({ players }) => ({
    match: {
      game: 'robar',
      pots: ROBAR_POTS,
      rounds: [],
      chosen: [],
      score: { [players[0]]: 0, [players[1]]: 0 },
    },
    secret: {},
  }),

  apply({ match, secret, me, move, players }) {
    if (match.rounds.length >= match.pots.length) throw new GameError('La partida ya terminó.');
    if (match.chosen.includes(me)) throw new GameError('Ya elegiste. Esperá a que elija el otro.');

    const choices = { ...secret, [me]: move.choice };
    const chosen = [...match.chosen, me];
    const [a, b] = players;
    if (!choices[a] || !choices[b]) return { match: { ...match, chosen }, secret: choices };

    const pot = match.pots[match.rounds.length]!;
    const points = { [a]: splitPot(pot, choices[a], choices[b]), [b]: splitPot(pot, choices[b], choices[a]) };
    const score = { [a]: (match.score[a] ?? 0) + points[a]!, [b]: (match.score[b] ?? 0) + points[b]! };
    const rounds = [...match.rounds, { pot, choices: { [a]: choices[a], [b]: choices[b] }, points }];
    const next: RobarMatch = { ...match, rounds, chosen: [], score };

    const end =
      rounds.length >= match.pots.length
        ? { winnerId: score[a] === score[b] ? null : score[a]! > score[b]! ? a : b }
        : undefined;
    return { match: next, secret: {}, end };
  },

  isValidMove: (o) => o.choice === 'share' || o.choice === 'steal',
};

export default robar;
