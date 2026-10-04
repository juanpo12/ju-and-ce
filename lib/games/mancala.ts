import type { GameModule } from './module';
import { GameError } from './error';

export const MANCALA_PITS = 6;
export const MANCALA_SEEDS = 4;

export type MancalaMatch = {
  game: 'mancala';
  /**
   * Each player's six pits, in sowing order: from their left to their store on
   * the right. Pit `i` of one faces pit `5 - i` of the other.
   */
  pits: Record<string, number[]>;
  stores: Record<string, number>;
  turn: string;
  /** The last sowing, for the screen: which pit, whether it earned another turn, what it captured. */
  last?: { by: string; pit: number; seeds: number; extra: boolean; captured: number };
  /** Set when the game ends: the seeds each side swept into its own store. */
  swept?: Record<string, number>;
};

export type MancalaMove = { game: 'mancala'; pit: number };

/**
 * Kalah with six pits of four seeds. Seeds are sown counter-clockwise into
 * your pits, your store and the other's pits, skipping their store. Ending in
 * your store earns another turn; ending in an empty pit of yours captures it
 * and the pit across. When a side runs out, the other sweeps its seeds home
 * and the bigger store wins.
 */
const mancala: GameModule<MancalaMatch, MancalaMove> = {
  start: ({ players, starter }) => ({
    match: {
      game: 'mancala',
      pits: Object.fromEntries(players.map((p) => [p, Array(MANCALA_PITS).fill(MANCALA_SEEDS)])),
      stores: Object.fromEntries(players.map((p) => [p, 0])),
      turn: starter,
    },
    secret: null,
  }),

  apply({ match, me, move, players }) {
    if (match.turn !== me) throw new GameError('No es tu turno.');
    if (!Number.isInteger(move.pit) || move.pit < 0 || move.pit >= MANCALA_PITS) {
      throw new GameError('Ese hoyo no existe.');
    }
    const other = players.find((p) => p !== me)!;
    const mine = [...match.pits[me]!];
    const theirs = [...match.pits[other]!];
    const stores = { ...match.stores };
    const seeds = mine[move.pit]!;
    if (seeds === 0) throw new GameError('Ese hoyo está vacío.');

    // Positions around the board from my side: 0–5 my pits, 6 my store, 7–12 their pits.
    mine[move.pit] = 0;
    let pos = move.pit;
    for (let left = seeds; left > 0; left--) {
      pos = (pos + 1) % 13;
      if (pos < MANCALA_PITS) mine[pos]!++;
      else if (pos === MANCALA_PITS) stores[me]!++;
      else theirs[pos - MANCALA_PITS - 1]!++;
    }

    const extra = pos === MANCALA_PITS;
    let captured = 0;
    if (pos < MANCALA_PITS && mine[pos] === 1) {
      const across = MANCALA_PITS - 1 - pos;
      if (theirs[across]! > 0) {
        captured = theirs[across]! + 1;
        stores[me]! += captured;
        mine[pos] = 0;
        theirs[across] = 0;
      }
    }

    const pits = { [me]: mine, [other]: theirs };
    const last = { by: me, pit: move.pit, seeds, extra, captured };
    const empty = (row: number[]) => row.every((s) => s === 0);

    if (empty(mine) || empty(theirs)) {
      const swept = { [me]: mine.reduce((s, x) => s + x, 0), [other]: theirs.reduce((s, x) => s + x, 0) };
      stores[me]! += swept[me]!;
      stores[other]! += swept[other]!;
      const finalPits = { [me]: mine.map(() => 0), [other]: theirs.map(() => 0) };
      const a = stores[me]!;
      const b = stores[other]!;
      return {
        match: { ...match, pits: finalPits, stores, last, swept },
        secret: null,
        end: { winnerId: a === b ? null : a > b ? me : other },
      };
    }

    return { match: { ...match, pits, stores, last, turn: extra ? me : other }, secret: null };
  },

  isValidMove: (o) => typeof o.pit === 'number' && Number.isInteger(o.pit),
};

export default mancala;
