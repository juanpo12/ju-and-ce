import type { SimonMatch } from '@/lib/movie-night';
import type { Rng } from './random';
import { GameError } from './error';

export const COLORS = 4;
export const SEQUENCE_LENGTH = 12;

export function startSimon(players: [string, string], rng: Rng): SimonMatch {
  const sequence = Array.from({ length: SEQUENCE_LENGTH }, () => rng.int(COLORS));
  const run = () => ({ reached: 0, done: false });
  return { game: 'simon', sequence, runs: { [players[0]]: run(), [players[1]]: run() } };
}

/**
 * The same sequence for both, each at their own pace. Repeat the first
 * `reached + 1` colors exactly to climb a level; one slip and your run is
 * over. The higher level wins, and it ends as soon as the order cannot change.
 */
export function applySimonInput(
  match: SimonMatch,
  me: string,
  input: number[],
  players: [string, string],
): { match: SimonMatch; end?: { winnerId: string | null } } {
  const run = match.runs[me];
  if (!run || run.done) throw new GameError('Tu ronda ya terminó. Esperá al otro.');

  const level = run.reached + 1;
  const expected = match.sequence.slice(0, level);
  const right = input.length === expected.length && input.every((c, i) => c === expected[i]);
  const reached = right ? level : run.reached;
  const done = !right || reached === match.sequence.length;
  const runs = { ...match.runs, [me]: { reached, done } };
  const next: SimonMatch = { ...match, runs };

  const [a, b] = players;
  const ra = runs[a]!;
  const rb = runs[b]!;
  const best = (r: typeof ra) => (r.done ? r.reached : match.sequence.length);

  if (ra.done && rb.done) {
    return { match: next, end: { winnerId: ra.reached === rb.reached ? null : ra.reached > rb.reached ? a : b } };
  }
  if (ra.done && rb.reached > ra.reached) return { match: next, end: { winnerId: b } };
  if (rb.done && ra.reached > rb.reached) return { match: next, end: { winnerId: a } };
  if (ra.done && best(rb) < ra.reached) return { match: next, end: { winnerId: a } };
  if (rb.done && best(ra) < rb.reached) return { match: next, end: { winnerId: b } };
  return { match: next };
}
