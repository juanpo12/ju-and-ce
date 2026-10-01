import type { ConnectFourMatch } from '@/lib/movie-night';
import { GameError } from './error';

export const COLS = 7;
export const ROWS = 6;

export function startConnectFour(starter: string): ConnectFourMatch {
  return {
    game: 'cuatro',
    cols: COLS,
    rows: ROWS,
    cells: Array(COLS * ROWS).fill(null),
    turn: starter,
  };
}

const DIRECTIONS: [number, number][] = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diagonal down-right
  [1, -1], // diagonal down-left
];

/** The four cells through `index` that belong to the same person, if any. */
export function lineThrough(match: ConnectFourMatch, index: number): number[] | null {
  const { cols, rows, cells } = match;
  const who = cells[index];
  if (!who) return null;
  const row = Math.floor(index / cols);
  const col = index % cols;

  for (const [dr, dc] of DIRECTIONS) {
    const line = [index];
    for (const sign of [1, -1]) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (r >= 0 && r < rows && c >= 0 && c < cols && cells[r * cols + c] === who) {
        line.push(r * cols + c);
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (line.length >= 4) return line.sort((a, b) => a - b).slice(0, 4);
  }
  return null;
}

/**
 * Drop a piece in a column: it lands on the lowest empty row. Four in a row
 * in any direction wins; a full board with no line goes to the coin.
 */
export function applyDrop(
  match: ConnectFourMatch,
  me: string,
  col: number,
  players: [string, string],
): { match: ConnectFourMatch; end?: { winnerId: string | null } } {
  if (match.turn !== me) throw new GameError('No es tu turno.');
  if (!Number.isInteger(col) || col < 0 || col >= match.cols) throw new GameError('Esa columna no existe.');

  let row = -1;
  for (let r = match.rows - 1; r >= 0; r--) {
    if (!match.cells[r * match.cols + col]) {
      row = r;
      break;
    }
  }
  if (row < 0) throw new GameError('Esa columna está llena.');

  const cells = [...match.cells];
  const index = row * match.cols + col;
  cells[index] = me;
  const next: ConnectFourMatch = { ...match, cells };

  const line = lineThrough(next, index);
  if (line) return { match: { ...next, line }, end: { winnerId: me } };
  if (cells.every(Boolean)) return { match: next, end: { winnerId: null } };

  const other = players[0] === me ? players[1] : players[0];
  return { match: { ...next, turn: other } };
}
