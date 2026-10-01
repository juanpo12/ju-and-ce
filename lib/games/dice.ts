import type { DiceMatch, Roll } from '@/lib/movie-night';
import type { Rng } from './random';
import { GameError } from './error';

/** Best of 3: first to two rounds. */
export const DICE_TARGET = 2;

export function startDice(players: [string, string]): DiceMatch {
  return {
    game: 'dados',
    rounds: [],
    rolls: {},
    score: { [players[0]]: 0, [players[1]]: 0 },
    target: DICE_TARGET,
  };
}

export const sum = (roll: Roll) => roll[0] + roll[1];

/**
 * Each one rolls two dice when they tap; the server does the rolling. With
 * both rolls in, the higher sum takes the round; equal sums replay it.
 */
export function applyRoll(
  match: DiceMatch,
  me: string,
  players: [string, string],
  rng: Rng,
): { match: DiceMatch; end?: { winnerId: string } } {
  if (match.rolls[me]) throw new GameError('Ya tiraste. Esperá al otro.');

  const rolls: Record<string, Roll> = { ...match.rolls, [me]: [rng.int(6) + 1, rng.int(6) + 1] };
  const [a, b] = players;
  if (!rolls[a] || !rolls[b]) return { match: { ...match, rolls } };

  const sa = sum(rolls[a]);
  const sb = sum(rolls[b]);
  const winner = sa === sb ? null : sa > sb ? a : b;
  const score = { ...match.score };
  if (winner) score[winner] = (score[winner] ?? 0) + 1;

  const next: DiceMatch = { ...match, rounds: [...match.rounds, { rolls, winner }], rolls: {}, score };
  const end = winner && score[winner]! >= match.target ? { winnerId: winner } : undefined;
  return { match: next, end };
}
