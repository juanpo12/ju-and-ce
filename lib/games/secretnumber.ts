import type { SecretNumberMatch } from '@/lib/movie-night';
import type { Rng } from './random';
import { GameError } from './error';

export const MAX_NUMBER = 100;

export function startSecretNumber(): SecretNumberMatch {
  return { game: 'numero', max: MAX_NUMBER, picked: [] };
}

/**
 * Each one picks a number in secret; the pick lives in the secret until both
 * are in. Then the server draws the target and the closer pick wins. The same
 * distance is a tie for the coin.
 */
export function applyPick(
  match: SecretNumberMatch,
  picks: Record<string, number>,
  me: string,
  pick: number,
  players: [string, string],
  rng: Rng,
): { match: SecretNumberMatch; picks: Record<string, number>; end?: { winnerId: string | null } } {
  if (match.picked.includes(me)) throw new GameError('Ya elegiste tu número.');
  if (!Number.isInteger(pick) || pick < 1 || pick > match.max) {
    throw new GameError(`Tiene que ser un número del 1 al ${match.max}.`);
  }

  const next = { ...picks, [me]: pick };
  const picked = [...match.picked, me];
  const [a, b] = players;
  if (next[a] === undefined || next[b] === undefined) {
    return { match: { ...match, picked }, picks: next };
  }

  const target = rng.int(match.max) + 1;
  const da = Math.abs(next[a] - target);
  const db = Math.abs(next[b] - target);
  return {
    match: { ...match, picked, picks: next, target },
    picks: next,
    end: { winnerId: da === db ? null : da < db ? a : b },
  };
}
