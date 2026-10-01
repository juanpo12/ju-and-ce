import type { TapRaceMatch } from '@/lib/movie-night';
import { GameError } from './error';

export const RACE_SECONDS = 10;
/** Nobody taps faster than this; anything above is a bug or a cheat. */
export const MAX_TAPS = 5000;

export function startTapRace(): TapRaceMatch {
  return { game: 'taps', seconds: RACE_SECONDS, counts: {} };
}

/**
 * Each phone counts its own taps and reports the total once. With both in,
 * more taps wins; the same number is a tie for the coin.
 */
export function applyTapCount(
  match: TapRaceMatch,
  me: string,
  count: number,
  players: [string, string],
): { match: TapRaceMatch; end?: { winnerId: string | null } } {
  if (match.counts[me] !== undefined) throw new GameError('Ya corriste tu carrera.');
  if (!Number.isInteger(count) || count < 0 || count > MAX_TAPS) throw new GameError('Ese conteo no es válido.');

  const counts = { ...match.counts, [me]: count };
  const [a, b] = players;
  if (counts[a] === undefined || counts[b] === undefined) return { match: { ...match, counts } };

  const ca = counts[a];
  const cb = counts[b];
  return { match: { ...match, counts }, end: { winnerId: ca === cb ? null : ca > cb ? a : b } };
}
