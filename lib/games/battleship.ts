import type { BattleshipMatch } from '@/lib/movie-night';
import type { Rng } from './random';
import { GameError } from './error';

export const BOARD_SIZE = 6;
/** Three ships per fleet: one of three cells and two of two. */
export const SHIPS = [3, 2, 2];

/** Cells as indexes `row * size + col`, placed at random without overlapping or leaving the grid. */
export function placeFleet(size: number, ships: number[], rng: Rng): number[][] {
  const taken = new Set<number>();
  const fleet: number[][] = [];
  for (const length of ships) {
    let placed = false;
    for (let attempt = 0; attempt < 500 && !placed; attempt++) {
      const horizontal = rng.int(2) === 0;
      const row = rng.int(horizontal ? size : size - length + 1);
      const col = rng.int(horizontal ? size - length + 1 : size);
      const cells = Array.from({ length }, (_, i) =>
        horizontal ? row * size + col + i : (row + i) * size + col,
      );
      if (cells.some((c) => taken.has(c))) continue;
      cells.forEach((c) => taken.add(c));
      fleet.push(cells);
      placed = true;
    }
    // Only reachable on an absurdly crowded board; 7 cells out of 36 never are.
    if (!placed) throw new Error('Could not place the fleet');
  }
  return fleet;
}

export function startBattleship(
  players: [string, string],
  starter: string,
  rng: Rng,
): { match: BattleshipMatch; fleets: Record<string, number[][]> } {
  const fleets = {
    [players[0]]: placeFleet(BOARD_SIZE, SHIPS, rng),
    [players[1]]: placeFleet(BOARD_SIZE, SHIPS, rng),
  };
  return {
    fleets,
    match: {
      game: 'naval',
      size: BOARD_SIZE,
      ships: [...SHIPS],
      shots: { [players[0]]: [], [players[1]]: [] },
      sunk: { [players[0]]: 0, [players[1]]: 0 },
      turn: starter,
    },
  };
}

/**
 * Fire at the other person's board. A hit keeps the turn; a miss passes it.
 * Sinking every ship wins, and then both fleets are shown.
 */
export function applyShot(
  match: BattleshipMatch,
  fleets: Record<string, number[][]>,
  me: string,
  cell: number,
  players: [string, string],
): { match: BattleshipMatch; end?: { winnerId: string } } {
  if (match.turn !== me) throw new GameError('No es tu turno.');
  const cells = match.size * match.size;
  if (!Number.isInteger(cell) || cell < 0 || cell >= cells) throw new GameError('Esa casilla no existe.');
  const mine = match.shots[me] ?? [];
  if (mine.some((s) => s.cell === cell)) throw new GameError('Ya tiraste ahí.');

  const other = players[0] === me ? players[1] : players[0];
  const fleet = fleets[other] ?? [];
  const ship = fleet.find((s) => s.includes(cell));
  const hit = Boolean(ship);
  const shots = { ...match.shots, [me]: [...mine, { cell, hit }] };

  const hitCells = new Set(shots[me]!.filter((s) => s.hit).map((s) => s.cell));
  const sank = ship ? ship.every((c) => hitCells.has(c)) : false;
  const sunk = { ...match.sunk, [me]: (match.sunk[me] ?? 0) + (sank ? 1 : 0) };

  const next: BattleshipMatch = { ...match, shots, sunk, turn: hit ? me : other };
  if (sunk[me] === match.ships.length) {
    return { match: { ...next, fleets }, end: { winnerId: me } };
  }
  return { match: next };
}
