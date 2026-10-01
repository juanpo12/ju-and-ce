import type { BoxesMatch } from '@/lib/movie-night';
import { GameError } from './error';

/** Boxes per side: 3 gives 9 boxes, odd so there is never a tie. */
export const BOXES_SIZE = 3;

export function startBoxes(starter: string, players: [string, string]): BoxesMatch {
  const size = BOXES_SIZE;
  return {
    game: 'cajas',
    size,
    horizontal: Array((size + 1) * size).fill(null),
    vertical: Array(size * (size + 1)).fill(null),
    boxes: Array(size * size).fill(null),
    turn: starter,
    score: { [players[0]]: 0, [players[1]]: 0 },
  };
}

/** Whether box (r, c) has all four sides. */
function isClosed(match: BoxesMatch, r: number, c: number) {
  const { size, horizontal, vertical } = match;
  return Boolean(
    horizontal[r * size + c] &&
      horizontal[(r + 1) * size + c] &&
      vertical[r * (size + 1) + c] &&
      vertical[r * (size + 1) + c + 1],
  );
}

/** The boxes that touch an edge: one at the border, two in the middle. */
function boxesTouching(size: number, edge: 'h' | 'v', index: number): [number, number][] {
  if (edge === 'h') {
    const r = Math.floor(index / size);
    const c = index % size;
    const out: [number, number][] = [];
    if (r > 0) out.push([r - 1, c]);
    if (r < size) out.push([r, c]);
    return out;
  }
  const r = Math.floor(index / (size + 1));
  const c = index % (size + 1);
  const out: [number, number][] = [];
  if (c > 0) out.push([r, c - 1]);
  if (c < size) out.push([r, c]);
  return out;
}

/**
 * Draw one edge. Closing a box scores it and keeps the turn; otherwise the
 * turn passes. When every box is closed, the higher score wins.
 */
export function applyEdge(
  match: BoxesMatch,
  me: string,
  edge: 'h' | 'v',
  index: number,
  players: [string, string],
): { match: BoxesMatch; end?: { winnerId: string } } {
  if (match.turn !== me) throw new GameError('No es tu turno.');
  const edges = edge === 'h' ? match.horizontal : match.vertical;
  if (!Number.isInteger(index) || index < 0 || index >= edges.length) throw new GameError('Esa línea no existe.');
  if (edges[index]) throw new GameError('Esa línea ya está dibujada.');

  const next: BoxesMatch = {
    ...match,
    horizontal: [...match.horizontal],
    vertical: [...match.vertical],
    boxes: [...match.boxes],
    score: { ...match.score },
  };
  (edge === 'h' ? next.horizontal : next.vertical)[index] = me;

  let closed = 0;
  for (const [r, c] of boxesTouching(match.size, edge, index)) {
    const b = r * match.size + c;
    if (!next.boxes[b] && isClosed(next, r, c)) {
      next.boxes[b] = me;
      closed++;
    }
  }
  if (closed) next.score[me] = (next.score[me] ?? 0) + closed;

  if (next.boxes.every(Boolean)) {
    const [a, b] = players;
    return { match: next, end: { winnerId: (next.score[a] ?? 0) > (next.score[b] ?? 0) ? a : b } };
  }

  const other = players[0] === me ? players[1] : players[0];
  return { match: { ...next, turn: closed ? me : other } };
}
