import type { GameModule } from './module';
import type { Rng } from './random';
import { GameError } from './error';

export const START_DICE = 5;

export type Bid = { by: string; qty: number; face: number };

export type MentirosoReveal = {
  dice: Record<string, number[]>;
  bid: Bid;
  caller: string;
  /** How many dice matched the bid, counting wild ones. */
  matched: number;
  loser: string;
};

export type MentirosoMatch = {
  game: 'mentiroso';
  /** Dice each one still has. */
  counts: Record<string, number>;
  round: number;
  turn: string;
  /** The bids of the current round, latest last. */
  bids: Bid[];
  /** Every round that ended with «¡Mentira!», dice shown. */
  reveals: MentirosoReveal[];
};

export type MentirosoMove =
  | { game: 'mentiroso'; action: 'bid'; qty: number; face: number }
  | { game: 'mentiroso'; action: 'call' };

/** Each one's hidden dice for the current round. */
type MentirosoSecret = { dice: Record<string, number[]> };

const rollDice = (n: number, rng: Rng) => Array.from({ length: n }, () => rng.int(6) + 1).sort((a, b) => a - b);

/** Dice showing `face`, with ones wild unless the bid is on ones. */
export function matching(dice: number[], face: number) {
  return dice.filter((d) => d === face || (face !== 1 && d === 1)).length;
}

/** Whether `next` goes above `current`: more dice, or the same dice of a higher face. */
export const raises = (current: Bid | undefined, qty: number, face: number) =>
  !current || qty > current.qty || (qty === current.qty && face > current.face);

/**
 * Dados mentirosos for two: everyone rolls hidden dice, then by turns you bid
 * «at least N dice of face F» on all the dice on the table, or call «¡Mentira!»
 * on the last bid. Ones are wild. Whoever was wrong loses a die and opens the
 * next round; with no dice left, you lose.
 */
const mentiroso: GameModule<MentirosoMatch, MentirosoMove, MentirosoSecret> = {
  start: ({ players, starter }, rng) => ({
    match: {
      game: 'mentiroso',
      counts: { [players[0]]: START_DICE, [players[1]]: START_DICE },
      round: 1,
      turn: starter,
      bids: [],
      reveals: [],
    },
    secret: { dice: { [players[0]]: rollDice(START_DICE, rng), [players[1]]: rollDice(START_DICE, rng) } },
  }),

  apply({ match, secret, me, move, players, rng }) {
    if (match.turn !== me) throw new GameError('No es tu turno.');
    const other = players[0] === me ? players[1] : players[0];
    const last = match.bids[match.bids.length - 1];

    if (move.action === 'bid') {
      const onTable = match.counts[players[0]]! + match.counts[players[1]]!;
      if (!Number.isInteger(move.qty) || move.qty < 1 || move.qty > onTable) {
        throw new GameError(`Entre 1 y ${onTable} dados.`);
      }
      if (!Number.isInteger(move.face) || move.face < 1 || move.face > 6) throw new GameError('Una cara del 1 al 6.');
      if (!raises(last, move.qty, move.face)) throw new GameError('Tenés que subir: más dados, o la misma cantidad de una cara más alta.');
      return { match: { ...match, bids: [...match.bids, { by: me, qty: move.qty, face: move.face }], turn: other }, secret };
    }

    if (!last) throw new GameError('Todavía no hay apuesta para desmentir.');
    const all = [...secret.dice[players[0]]!, ...secret.dice[players[1]]!];
    const matched = matching(all, last.face);
    const loser = matched >= last.qty ? me : last.by;
    const counts = { ...match.counts, [loser]: match.counts[loser]! - 1 };
    const reveals = [...match.reveals, { dice: secret.dice, bid: last, caller: me, matched, loser }];

    if (counts[loser] === 0) {
      const winner = players[0] === loser ? players[1] : players[0];
      return { match: { ...match, counts, bids: [], reveals }, secret, end: { winnerId: winner } };
    }
    return {
      match: { ...match, counts, round: match.round + 1, turn: loser, bids: [], reveals },
      secret: { dice: { [players[0]]: rollDice(counts[players[0]]!, rng), [players[1]]: rollDice(counts[players[1]]!, rng) } },
    };
  },

  isValidMove: (o) =>
    o.action === 'call' ||
    (o.action === 'bid' && Number.isInteger(o.qty) && Number.isInteger(o.face)),

  privateView: ({ secret, me }) => secret.dice[me] ?? [],
};

export default mentiroso;
