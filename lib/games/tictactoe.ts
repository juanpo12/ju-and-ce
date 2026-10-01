import type { TicTacToeMatch } from '@/lib/movie-night';
import { GameError } from './error';

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/** Tic-tac-toe draws a lot: after this many drawn boards the coin settles it. */
export const MAX_DRAWS = 3;

export function startTicTacToe(starter: string): TicTacToeMatch {
  return {
    game: 'tateti',
    board: Array(9).fill(null),
    turn: starter,
    starter,
    draws: 0,
    maxDraws: MAX_DRAWS,
  };
}

/** The line that someone completed, if any. */
export function winningLine(board: readonly (string | null)[]): number[] | null {
  for (const line of LINES) {
    const [a, b, c] = line as [number, number, number];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

/**
 * Mark a cell. Three in a row wins. A full board with no line is a draw: the
 * board resets and the other person opens; at `maxDraws` draws it goes to the coin.
 */
export function applyCell(
  match: TicTacToeMatch,
  me: string,
  cell: number,
  players: [string, string],
): { match: TicTacToeMatch; end?: { winnerId: string | null } } {
  if (match.turn !== me) throw new GameError('No es tu turno.');
  if (!Number.isInteger(cell) || cell < 0 || cell > 8) throw new GameError('Esa casilla no existe.');
  if (match.board[cell]) throw new GameError('Esa casilla ya está ocupada.');

  const board = [...match.board];
  board[cell] = me;
  const other = players[0] === me ? players[1] : players[0];

  const line = winningLine(board);
  if (line) return { match: { ...match, board, line }, end: { winnerId: me } };

  if (board.every(Boolean)) {
    const draws = match.draws + 1;
    if (draws >= match.maxDraws) return { match: { ...match, board, draws }, end: { winnerId: null } };
    const starter = match.starter === players[0] ? players[1] : players[0];
    return { match: { ...match, board: Array(9).fill(null), draws, starter, turn: starter } };
  }

  return { match: { ...match, board, turn: other } };
}
