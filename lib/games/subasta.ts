import type { GameModule } from './module';
import { GameError } from './error';
import { shuffle } from './random';

export const SUBASTA_CARDS = 9;

export type SubastaRound = {
  prize: number;
  bids: Record<string, number>;
  /** Null when the bids tied and the prize was thrown away. */
  winner: string | null;
};

export type SubastaMatch = {
  game: 'subasta';
  /** The prize up for auction now; null once the deck is done. */
  prize: number | null;
  /** How many prizes are still face down after this one. */
  prizesLeft: number;
  /** The cards each one can still bid. Updated only when a round resolves. */
  hands: Record<string, number[]>;
  rounds: SubastaRound[];
  /** Who already bid this round (not with what). */
  chosen: string[];
  score: Record<string, number>;
};

export type SubastaMove = { game: 'subasta'; card: number };

type SubastaSecret = {
  /** The face-down prizes, in the order they will come out. */
  deck: number[];
  /** The bids made so far this round, until both are in. */
  bids: Record<string, number>;
};

const fullHand = () => Array.from({ length: SUBASTA_CARDS }, (_, i) => i + 1);

/**
 * Subasta (Goofspiel): each one holds cards 1 to 9, and so does the prize
 * deck, shuffled. Each round one prize comes up; both bid a card in secret and
 * the higher bid takes the prize's points. Equal bids throw the prize away.
 * Spent cards are gone, so every big bid is a bet on what is still to come.
 */
const subasta: GameModule<SubastaMatch, SubastaMove, SubastaSecret> = {
  start: ({ players }, rng) => {
    const [first, ...deck] = shuffle(fullHand(), rng);
    return {
      match: {
        game: 'subasta',
        prize: first!,
        prizesLeft: deck.length,
        hands: { [players[0]]: fullHand(), [players[1]]: fullHand() },
        rounds: [],
        chosen: [],
        score: { [players[0]]: 0, [players[1]]: 0 },
      },
      secret: { deck, bids: {} },
    };
  },

  apply({ match, secret, me, move, players }) {
    if (match.prize === null) throw new GameError('Ya no quedan premios.');
    if (match.chosen.includes(me)) throw new GameError('Ya ofertaste. Esperá al otro.');
    if (!match.hands[me]?.includes(move.card)) throw new GameError('Esa carta ya no la tenés.');

    const bids = { ...secret.bids, [me]: move.card };
    const chosen = [...match.chosen, me];
    const [a, b] = players;
    if (bids[a] === undefined || bids[b] === undefined) {
      return { match: { ...match, chosen }, secret: { ...secret, bids } };
    }

    const prize = match.prize;
    const winner = bids[a] === bids[b] ? null : bids[a]! > bids[b]! ? a : b;
    const score = { ...match.score };
    if (winner) score[winner] = (score[winner] ?? 0) + prize;
    const hands = {
      [a]: match.hands[a]!.filter((c) => c !== bids[a]),
      [b]: match.hands[b]!.filter((c) => c !== bids[b]),
    };
    const [nextPrize, ...deck] = secret.deck;
    const next: SubastaMatch = {
      ...match,
      prize: nextPrize ?? null,
      prizesLeft: deck.length,
      hands,
      rounds: [...match.rounds, { prize, bids: { [a]: bids[a], [b]: bids[b] }, winner }],
      chosen: [],
      score,
    };
    const end =
      nextPrize === undefined
        ? { winnerId: score[a] === score[b] ? null : score[a]! > score[b]! ? a : b }
        : undefined;
    return { match: next, secret: { deck, bids: {} }, end };
  },

  isValidMove: (o) => typeof o.card === 'number' && Number.isInteger(o.card),
};

export default subasta;
