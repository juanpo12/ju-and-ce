import type { CursedCardMatch } from '@/lib/movie-night';
import type { Rng } from './random';
import { GameError } from './error';

export const CARDS = 12;

export function startCursedCard(starter: string, rng: Rng): { match: CursedCardMatch; cursed: number } {
  return {
    cursed: rng.int(CARDS),
    match: { game: 'carta', cards: CARDS, flipped: [], turn: starter },
  };
}

/**
 * Flip a card on your turn. A safe one passes the turn; the cursed one ends
 * the game, and whoever flipped it loses. There is no tie: someone always
 * finds it.
 */
export function applyFlip(
  match: CursedCardMatch,
  cursed: number,
  me: string,
  card: number,
  players: [string, string],
): { match: CursedCardMatch; end?: { winnerId: string } } {
  if (match.turn !== me) throw new GameError('No es tu turno.');
  if (!Number.isInteger(card) || card < 0 || card >= match.cards) throw new GameError('Esa carta no existe.');
  if (match.flipped.some((f) => f.card === card)) throw new GameError('Esa carta ya está dada vuelta.');

  const other = players[0] === me ? players[1] : players[0];
  if (card === cursed) {
    return { match: { ...match, cursed }, end: { winnerId: other } };
  }
  return { match: { ...match, flipped: [...match.flipped, { card, by: me }], turn: other } };
}
