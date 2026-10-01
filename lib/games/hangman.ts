import type { HangmanMatch } from '@/lib/movie-night';
import { pickOne, type Rng } from './random';
import { GameError } from './error';

export const MAX_MISSES = 6;
const MIN_DISTINCT_LETTERS = 3;

/** A watched title, with what serves as a hint. */
export type HangmanTitle = { title: string; year: number | null; genre: string | null };

/**
 * Uppercase and without accents, keeping the Ñ: letters are what gets guessed,
 * and "Anatomía" is guessed with a plain I. Spaces and punctuation stay as is.
 */
export function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-̂̄-ͯ]/g, '')
    .normalize('NFC')
    .toUpperCase();
}

const IS_LETTER = /^[A-ZÑ]$/;

export function lettersOf(title: string) {
  return new Set([...normalize(title)].filter((c) => IS_LETTER.test(c)));
}

/** Usable if it has letters to guess and nothing the keyboard cannot type. */
export function isEligible(title: string) {
  const n = normalize(title);
  if (lettersOf(title).size < MIN_DISTINCT_LETTERS) return false;
  return /^[A-ZÑ0-9\s.,:;'’!?¡¿&()\-]+$/.test(n);
}

/** The title with the missing letters covered. */
export function mask(title: string, guessed: ReadonlySet<string>) {
  return [...normalize(title)]
    .map((c) => (IS_LETTER.test(c) && !guessed.has(c) ? '_' : c))
    .join('');
}

/** Letters only, so an extra space does not ruin a full guess. */
const lettersOnly = (text: string) => [...normalize(text)].filter((c) => IS_LETTER.test(c)).join('');

export function startHangman(
  titles: readonly HangmanTitle[],
  starter: string,
  rng: Rng,
): { match: HangmanMatch; title: string } {
  const eligible = titles.filter((t) => isEligible(t.title));
  if (eligible.length === 0) throw new GameError('No hay títulos para el ahorcado.');
  const { title, year, genre } = pickOne(eligible, rng);
  return {
    title,
    match: {
      game: 'ahorcado',
      mask: mask(title, new Set()),
      letters: [],
      turn: starter,
      misses: 0,
      maxMisses: MAX_MISSES,
      hint: [year, genre].filter(Boolean).join(' · ') || null,
    },
  };
}

type Result = { match: HangmanMatch; end?: { winnerId: string | null } };

/**
 * One letter per turn. Completing the title wins; misses are shared, and if
 * they reach the maximum nobody guessed it: the coin settles it.
 */
export function applyLetter(
  match: HangmanMatch,
  title: string,
  me: string,
  letter: string,
  players: [string, string],
): Result {
  if (match.turn !== me) throw new GameError('No es tu turno.');
  const l = normalize(letter);
  if (!IS_LETTER.test(l)) throw new GameError('Eso no es una letra.');
  if (match.letters.some((x) => x.letter === l)) throw new GameError('Esa letra ya salió.');

  const hit = lettersOf(title).has(l);
  const guessed = new Set([...match.letters.map((x) => x.letter), l]);
  const masked = mask(title, guessed);
  const misses = match.misses + (hit ? 0 : 1);
  const other = players[0] === me ? players[1] : players[0];

  const next: HangmanMatch = {
    ...match,
    mask: masked,
    letters: [...match.letters, { letter: l, by: me, hit }],
    misses,
    turn: other,
  };

  if (!masked.includes('_')) return { match: { ...next, title }, end: { winnerId: me } };
  if (misses >= match.maxMisses) return { match: { ...next, title }, end: { winnerId: null } };
  return { match: next };
}

/** Guess the whole title: right and you win, wrong and the other one does. */
export function applyGuess(
  match: HangmanMatch,
  title: string,
  me: string,
  text: string,
  players: [string, string],
): Result {
  if (match.turn !== me) throw new GameError('No es tu turno.');
  if (!text.trim()) throw new GameError('Escribí el título para arriesgar.');

  const hit = lettersOnly(text) === lettersOnly(title);
  const other = players[0] === me ? players[1] : players[0];
  return {
    match: { ...match, title, guess: { by: me, text: text.trim(), hit } },
    end: { winnerId: hit ? me : other },
  };
}
