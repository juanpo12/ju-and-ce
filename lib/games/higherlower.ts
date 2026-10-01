import type { Guess, HigherLowerMatch } from '@/lib/movie-night';
import type { Rng } from './random';
import { GameError } from './error';

/** Cards go from 1 (as) to 13 (rey). */
export const MAX_CARD = 13;
/** Cards in the sequence, counting the first one that is shown. */
export const SEQUENCE_LENGTH = 9;

/** A sequence with no two equal cards in a row: every guess has an answer. */
export function buildSequence(rng: Rng, length = SEQUENCE_LENGTH): number[] {
  const seq: number[] = [];
  while (seq.length < length) {
    const v = rng.int(MAX_CARD) + 1;
    if (seq[seq.length - 1] !== v) seq.push(v);
  }
  return seq;
}

export function startHigherLower(
  players: [string, string],
  rng: Rng,
): { match: HigherLowerMatch; sequence: number[] } {
  const sequence = buildSequence(rng);
  const run = () => ({ seen: [sequence[0]!], streak: 0, done: false });
  return {
    sequence,
    match: {
      game: 'mayormenor',
      first: sequence[0]!,
      length: sequence.length,
      runs: { [players[0]]: run(), [players[1]]: run() },
    },
  };
}

/**
 * Same sequence for both, each at their own pace: is the next card higher or
 * lower? Right, keep going; wrong, your run is over. The longer run wins. It
 * ends as soon as the order cannot change.
 */
export function applyHigherLower(
  match: HigherLowerMatch,
  sequence: number[],
  me: string,
  guess: Guess,
  players: [string, string],
): { match: HigherLowerMatch; end?: { winnerId: string | null } } {
  const run = match.runs[me];
  if (!run || run.done) throw new GameError('Tu corrida ya terminó. Esperá al otro.');

  const prev = run.seen[run.seen.length - 1]!;
  const next = sequence[run.seen.length];
  if (next === undefined) throw new GameError('No quedan cartas.');

  const right = guess === 'higher' ? next > prev : next < prev;
  const seen = [...run.seen, next];
  const streak = run.streak + (right ? 1 : 0);
  const done = !right || seen.length === sequence.length;
  const runs = { ...match.runs, [me]: { seen, streak, done } };
  const nextMatch: HigherLowerMatch = { ...match, runs };

  const [a, b] = players;
  const ra = runs[a]!;
  const rb = runs[b]!;
  const best = (r: typeof ra) => (r.done ? r.streak : r.streak + (sequence.length - r.seen.length));

  if (ra.done && rb.done) {
    return { match: nextMatch, end: { winnerId: ra.streak === rb.streak ? null : ra.streak > rb.streak ? a : b } };
  }
  // One is done and the other already has more, or the one still playing can no longer catch up.
  if (ra.done && rb.streak > ra.streak) return { match: nextMatch, end: { winnerId: b } };
  if (rb.done && ra.streak > rb.streak) return { match: nextMatch, end: { winnerId: a } };
  if (ra.done && best(rb) < ra.streak) return { match: nextMatch, end: { winnerId: a } };
  if (rb.done && best(ra) < rb.streak) return { match: nextMatch, end: { winnerId: b } };
  return { match: nextMatch };
}
