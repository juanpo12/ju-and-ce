import type { Card, MemoryMatch } from '@/lib/movie-night';
import { shuffle, type Rng } from './random';
import { GameError } from './error';

/** With fewer than 3 watched movies there is no board worth playing. */
export const MIN_MEMORY_CARDS = 3;
const MAX_PAIRS = 7;

/**
 * How many pairs go in: odd, so a tie is impossible. With 7 or more watched
 * movies, 7 pairs (14 cards, fits a phone); with fewer, the largest odd count.
 */
export function pairCount(cards: number) {
  const n = Math.min(cards, MAX_PAIRS);
  return n % 2 === 0 ? n - 1 : n;
}

/** The real board, with faces. Lives in the secret: publicly only flipped cards show. */
export function buildBoard(cards: readonly Card[], rng: Rng): Card[] {
  if (cards.length < MIN_MEMORY_CARDS) throw new GameError('Faltan pelis vistas para la memoria.');
  const chosen = shuffle(cards, rng).slice(0, pairCount(cards.length));
  return shuffle([...chosen, ...chosen], rng);
}

export function startMemory(
  cards: readonly Card[],
  players: [string, string],
  starter: string,
  rng: Rng,
): { match: MemoryMatch; board: Card[] } {
  const board = buildBoard(cards, rng);
  return {
    board,
    match: {
      game: 'memoria',
      cards: board.map(() => ({ faceUp: null, ownedBy: null })),
      flipped: [],
      turn: starter,
      pairs: { [players[0]]: 0, [players[1]]: 0 },
      totalPairs: board.length / 2,
    },
  };
}

/**
 * Flip a card. The first one of the turn stays visible; the second one settles
 * it: a match is kept and the turn goes on, otherwise the server hides both
 * right away and leaves what was there in `lastMove`, so the phone can show
 * them for a moment before flipping them back.
 */
export function applyMemory(
  match: MemoryMatch,
  board: readonly Card[],
  me: string,
  card: number,
  players: [string, string],
): { match: MemoryMatch; end?: { winnerId: string } } {
  if (match.turn !== me) throw new GameError('No es tu turno.');
  if (!Number.isInteger(card) || card < 0 || card >= match.cards.length) {
    throw new GameError('Esa carta no existe.');
  }
  if (match.cards[card]!.ownedBy || match.flipped.includes(card)) {
    throw new GameError('Esa carta ya está dada vuelta.');
  }

  const face = board[card]!;
  const cards = match.cards.map((c) => ({ ...c }));

  if (match.flipped.length === 0) {
    cards[card] = { faceUp: face, ownedBy: null };
    return { match: { ...match, cards, flipped: [card] } };
  }

  const first = match.flipped[0]!;
  const hit = board[first]!.entryId === face.entryId;
  const n = (match.lastMove?.n ?? 0) + 1;
  const lastMove = {
    n,
    by: me,
    cards: [first, card] as [number, number],
    faces: [board[first]!, face] as [Card, Card],
    hit,
  };

  if (hit) {
    cards[first] = { faceUp: board[first]!, ownedBy: me };
    cards[card] = { faceUp: face, ownedBy: me };
    const pairs = { ...match.pairs, [me]: (match.pairs[me] ?? 0) + 1 };
    const next: MemoryMatch = { ...match, cards, flipped: [], pairs, lastMove };
    const won = Object.values(pairs).reduce((s, v) => s + v, 0);
    if (won === match.totalPairs) {
      const [a, b] = players;
      return { match: next, end: { winnerId: (pairs[a] ?? 0) > (pairs[b] ?? 0) ? a : b } };
    }
    return { match: next };
  }

  cards[first] = { faceUp: null, ownedBy: null };
  cards[card] = { faceUp: null, ownedBy: null };
  const other = players[0] === me ? players[1] : players[0];
  return { match: { ...match, cards, flipped: [], turn: other, lastMove } };
}
