import type { GameModule } from './module';
import { GameError } from './error';

export const REVERSI_SIZE = 8;

export type ReversiMatch = {
  game: 'reversi';
  size: number;
  /** `size * size` cells, row 0 at the top, index = row * size + col. Each holds who owns it. */
  cells: (string | null)[];
  turn: string;
  /** The last placed disc and what it flipped, for the animation. */
  last?: { by: string; cell: number; flipped: number[] };
  /** Who had no legal move and passed after the last move, if anyone. */
  passed?: string;
};

export type ReversiMove = { game: 'reversi'; cell: number };

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
] as const;

/** The discs a disc at `cell` would flip for `who`; empty means the move is illegal. */
export function flipsFor(cells: (string | null)[], size: number, cell: number, who: string): number[] {
  if (cells[cell] !== null) return [];
  const row = Math.floor(cell / size);
  const col = cell % size;
  const flips: number[] = [];
  for (const [dr, dc] of DIRECTIONS) {
    const line: number[] = [];
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < size && c >= 0 && c < size) {
      const owner = cells[r * size + c];
      if (owner === null) break;
      if (owner === who) {
        flips.push(...line);
        break;
      }
      line.push(r * size + c);
      r += dr;
      c += dc;
    }
  }
  return flips;
}

/** Every cell where `who` may play. */
export function legalMoves(cells: (string | null)[], size: number, who: string): number[] {
  return cells.flatMap((_, i) => (flipsFor(cells, size, i, who).length ? [i] : []));
}

/**
 * Reversi (Othello) on 8×8. A disc must outflank at least one line of the
 * other's discs, which flip. Whoever has no legal move passes; when neither
 * can move, more discs wins.
 */
const reversi: GameModule<ReversiMatch, ReversiMove> = {
  start: ({ players, starter }) => {
    const size = REVERSI_SIZE;
    const cells: (string | null)[] = Array(size * size).fill(null);
    const second = players.find((p) => p !== starter)!;
    const m = size / 2;
    // The usual cross: the starter on the diagonal from top right.
    cells[(m - 1) * size + (m - 1)] = second;
    cells[m * size + m] = second;
    cells[(m - 1) * size + m] = starter;
    cells[m * size + (m - 1)] = starter;
    return { match: { game: 'reversi', size, cells, turn: starter }, secret: null };
  },

  apply({ match, me, move, players }) {
    if (match.turn !== me) throw new GameError('No es tu turno.');
    const { size } = match;
    if (!Number.isInteger(move.cell) || move.cell < 0 || move.cell >= size * size) {
      throw new GameError('Esa casilla no existe.');
    }
    if (match.cells[move.cell] !== null) throw new GameError('Esa casilla ya está ocupada.');
    const flipped = flipsFor(match.cells, size, move.cell, me);
    if (flipped.length === 0) throw new GameError('Ahí no da vuelta ninguna ficha.');

    const cells = [...match.cells];
    cells[move.cell] = me;
    for (const i of flipped) cells[i] = me;

    const other = players.find((p) => p !== me)!;
    const base = { ...match, cells, last: { by: me, cell: move.cell, flipped }, passed: undefined };
    if (legalMoves(cells, size, other).length) return { match: { ...base, turn: other }, secret: null };
    if (legalMoves(cells, size, me).length) return { match: { ...base, turn: me, passed: other }, secret: null };

    const mine = cells.filter((c) => c === me).length;
    const theirs = cells.filter((c) => c === other).length;
    return {
      match: base,
      secret: null,
      end: { winnerId: mine === theirs ? null : mine > theirs ? me : other },
    };
  },

  isValidMove: (o) => typeof o.cell === 'number' && Number.isInteger(o.cell),
};

export default reversi;
