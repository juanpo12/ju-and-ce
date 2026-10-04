import type { GameModule } from './module';
import { GameError } from './error';

export const CINCO_SIZE = 11;
export const CINCO_LENGTH = 5;

export type CincoMatch = {
  game: 'cinco';
  size: number;
  /** `size * size` cells, row 0 at the top, index = row * size + col. */
  cells: (string | null)[];
  turn: string;
  /** The last stone placed, to highlight it. */
  last?: number;
  /** The five (or more) in a row that won. */
  line?: number[];
};

export type CincoMove = { game: 'cinco'; cell: number };

const AXES = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const;

/** The longest line through `cell` for its owner, if it reaches five. */
export function winningLine(cells: (string | null)[], size: number, cell: number): number[] | null {
  const who = cells[cell];
  if (!who) return null;
  const row = Math.floor(cell / size);
  const col = cell % size;
  for (const [dr, dc] of AXES) {
    const line = [cell];
    for (const sign of [1, -1]) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (r >= 0 && r < size && c >= 0 && c < size && cells[r * size + c] === who) {
        line.push(r * size + c);
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (line.length >= CINCO_LENGTH) return line.sort((a, b) => a - b);
  }
  return null;
}

/**
 * Gomoku on an 11×11 board: stones by turns, five in a row in any direction
 * wins. A full board with no five is a tie.
 */
const cinco: GameModule<CincoMatch, CincoMove> = {
  start: ({ starter }) => ({
    match: { game: 'cinco', size: CINCO_SIZE, cells: Array(CINCO_SIZE * CINCO_SIZE).fill(null), turn: starter },
    secret: null,
  }),

  apply({ match, me, move, players }) {
    if (match.turn !== me) throw new GameError('No es tu turno.');
    const { size } = match;
    if (!Number.isInteger(move.cell) || move.cell < 0 || move.cell >= size * size) {
      throw new GameError('Esa casilla no existe.');
    }
    if (match.cells[move.cell] !== null) throw new GameError('Esa casilla ya está ocupada.');

    const cells = [...match.cells];
    cells[move.cell] = me;
    const other = players.find((p) => p !== me)!;
    const line = winningLine(cells, size, move.cell);
    const next: CincoMatch = { ...match, cells, last: move.cell, turn: other, ...(line ? { line } : {}) };
    if (line) return { match: next, secret: null, end: { winnerId: me } };
    if (cells.every((c) => c !== null)) return { match: next, secret: null, end: { winnerId: null } };
    return { match: next, secret: null };
  },

  isValidMove: (o) => typeof o.cell === 'number' && Number.isInteger(o.cell),
};

export default cinco;
