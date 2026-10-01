import type { RpsMatch, Throw } from '@/lib/movie-night';
import { GameError } from './error';

/** What beats what. */
const BEATS: Record<Throw, Throw> = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

export function rpsWinner(a: Throw, b: Throw): 'a' | 'b' | 'tie' {
  if (a === b) return 'tie';
  return BEATS[a] === b ? 'a' : 'b';
}

/** Best of 3: first to 2 wins. */
export const RPS_TARGET = 2;

export function startRps(players: [string, string]): RpsMatch {
  return {
    game: 'ppt',
    rounds: [],
    chosen: [],
    score: { [players[0]]: 0, [players[1]]: 0 },
    target: RPS_TARGET,
  };
}

/**
 * Each one chooses in secret: the throw goes to the secret and publicly only
 * "already chose" is left. With the second one the server settles the round
 * and only then both throws become public. A tie is a round without a winner,
 * and it is replayed.
 */
export function applyRps(
  match: RpsMatch,
  secret: Record<string, Throw>,
  me: string,
  throw_: Throw,
  players: [string, string],
): { match: RpsMatch; secret: Record<string, Throw>; end?: { winnerId: string } } {
  if (match.chosen.includes(me)) throw new GameError('Ya elegiste. Esperá a que elija el otro.');

  const picked = { ...secret, [me]: throw_ };
  const chosen = [...match.chosen, me];
  const [a, b] = players;
  const missing = !picked[a] || !picked[b];

  if (missing) {
    return { match: { ...match, chosen }, secret: picked };
  }

  const outcome = rpsWinner(picked[a]!, picked[b]!);
  const winner = outcome === 'tie' ? null : outcome === 'a' ? a : b;
  const score = { ...match.score };
  if (winner) score[winner] = (score[winner] ?? 0) + 1;

  const next: RpsMatch = {
    ...match,
    rounds: [...match.rounds, { throws: { [a]: picked[a]!, [b]: picked[b]! }, winner }],
    chosen: [],
    score,
  };
  const end = winner && score[winner]! >= match.target ? { winnerId: winner } : undefined;
  return { match: next, secret: {}, end };
}
