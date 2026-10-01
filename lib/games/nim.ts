import type { NimMatch } from '@/lib/movie-night';
import { GameError } from './error';

export const NIM_ROWS = [3, 5, 7];

export function startNim(starter: string): NimMatch {
  return { game: 'nim', rows: [...NIM_ROWS], turn: starter };
}

/**
 * Take any number of matches from one row. Whoever takes the last one loses,
 * so the end is decided the moment the table is empty.
 */
export function applyTake(
  match: NimMatch,
  me: string,
  row: number,
  count: number,
  players: [string, string],
): { match: NimMatch; end?: { winnerId: string } } {
  if (match.turn !== me) throw new GameError('No es tu turno.');
  if (!Number.isInteger(row) || row < 0 || row >= match.rows.length) throw new GameError('Esa fila no existe.');
  if (!Number.isInteger(count) || count < 1) throw new GameError('Tenés que sacar al menos uno.');
  if (count > match.rows[row]!) throw new GameError('No hay tantos fósforos en esa fila.');

  const rows = [...match.rows];
  rows[row] = rows[row]! - count;
  const other = players[0] === me ? players[1] : players[0];
  const next: NimMatch = { ...match, rows, last: { by: me, row, count }, turn: other };

  if (rows.every((n) => n === 0)) return { match: { ...next, turn: me }, end: { winnerId: other } };
  return { match: next };
}
