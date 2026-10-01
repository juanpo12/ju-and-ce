import type { LibraryEntry, TimelineMatch } from '@/lib/movie-night';
import { shuffle, type Rng } from './random';
import { GameError } from './error';

export const TIMELINE_ITEMS = 5;

/** Entries with a year, one per year: two movies from the same year have no order. */
function distinctYears(library: LibraryEntry[]) {
  const seen = new Set<number>();
  return library.filter((e) => {
    if (e.year === null || seen.has(e.year)) return false;
    seen.add(e.year);
    return true;
  });
}

export function hasTimelineCandidates(library: LibraryEntry[]) {
  return distinctYears(library).length >= TIMELINE_ITEMS;
}

export function startTimeline(
  library: LibraryEntry[],
  rng: Rng,
): { match: TimelineMatch; correct: number[]; years: number[] } {
  const pool = distinctYears(library);
  if (pool.length < TIMELINE_ITEMS) {
    throw new GameError(`Hacen falta ${TIMELINE_ITEMS} pelis vistas de años distintos.`);
  }
  const chosen = shuffle(pool, rng).slice(0, TIMELINE_ITEMS);
  const years = chosen.map((e) => e.year!);
  const correct = years.map((_, i) => i).sort((a, b) => years[a]! - years[b]!);
  return {
    correct,
    years,
    match: {
      game: 'linea',
      items: chosen.map((e) => ({ entryId: e.entryId, title: e.title, posterPath: e.posterPath })),
      orders: {},
    },
  };
}

const isPermutation = (order: number[], n: number) =>
  order.length === n && new Set(order).size === n && order.every((i) => Number.isInteger(i) && i >= 0 && i < n);

/** Positions where the order matches the real one. */
export function timelineScore(order: number[], correct: number[]) {
  return order.filter((item, k) => item === correct[k]).length;
}

/**
 * Each one orders the movies from oldest to newest, once. With both orders
 * in, more right positions wins; the same number is a tie.
 */
export function applyOrder(
  match: TimelineMatch,
  correct: number[],
  years: number[],
  me: string,
  order: number[],
  players: [string, string],
): { match: TimelineMatch; end?: { winnerId: string | null } } {
  if (match.orders[me]) throw new GameError('Ya mandaste tu orden. Esperá al otro.');
  if (!isPermutation(order, match.items.length)) throw new GameError('Tenés que ordenar las cinco.');

  const orders = { ...match.orders, [me]: order };
  const [a, b] = players;
  if (!orders[a] || !orders[b]) return { match: { ...match, orders } };

  const sa = timelineScore(orders[a], correct);
  const sb = timelineScore(orders[b], correct);
  return {
    match: { ...match, orders, correct, years },
    end: { winnerId: sa === sb ? null : sa > sb ? a : b },
  };
}
