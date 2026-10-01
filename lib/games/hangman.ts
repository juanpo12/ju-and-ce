import type { HangmanMatch, HangmanRun } from '@/lib/movie-night';
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

/**
 * The same title for both, but each one guesses on their own: your letters do
 * not show up on the other's screen, your misses are yours. First to complete
 * it wins. Hanged, or a wrong full guess, and you are out; if both end up out,
 * the coin decides.
 */
export function startHangman(
  titles: readonly HangmanTitle[],
  players: [string, string],
  rng: Rng,
): { match: HangmanMatch; title: string } {
  const eligible = titles.filter((t) => isEligible(t.title));
  if (eligible.length === 0) throw new GameError('No hay títulos para el ahorcado.');
  const { title, year, genre } = pickOne(eligible, rng);
  const pattern = mask(title, new Set());
  const run = (): HangmanRun => ({ mask: pattern, letters: [], misses: 0, done: false });
  return {
    title,
    match: {
      game: 'ahorcado',
      pattern,
      hint: [year, genre].filter(Boolean).join(' · ') || null,
      maxMisses: MAX_MISSES,
      runs: { [players[0]]: run(), [players[1]]: run() },
    },
  };
}

type Result = { match: HangmanMatch; end?: { winnerId: string | null } };

function runOf(match: HangmanMatch, me: string): HangmanRun {
  const run = match.runs[me];
  if (!run) throw new GameError('No estás en esta partida.');
  if (run.done) throw new GameError('Ya quedaste afuera. Esperá al otro.');
  return run;
}

/** When everyone is out and nobody completed it, the coin takes over. */
function settle(match: HangmanMatch, players: [string, string], title: string): Result {
  const allOut = players.every((p) => match.runs[p]?.done);
  return allOut ? { match: { ...match, title }, end: { winnerId: null } } : { match };
}

export function applyLetter(
  match: HangmanMatch,
  title: string,
  me: string,
  letter: string,
  players: [string, string],
): Result {
  const run = runOf(match, me);
  const l = normalize(letter);
  if (!IS_LETTER.test(l)) throw new GameError('Eso no es una letra.');
  if (run.letters.some((x) => x.letter === l)) throw new GameError('Esa letra ya la probaste.');

  const hit = lettersOf(title).has(l);
  const guessed = new Set([...run.letters.map((x) => x.letter), l]);
  const masked = mask(title, guessed);
  const misses = run.misses + (hit ? 0 : 1);
  const hanged = misses >= match.maxMisses;

  const next: HangmanMatch = {
    ...match,
    runs: {
      ...match.runs,
      [me]: { ...run, mask: masked, letters: [...run.letters, { letter: l, hit }], misses, done: hanged },
    },
  };

  if (!masked.includes('_')) return { match: { ...next, title }, end: { winnerId: me } };
  return settle(next, players, title);
}

/** Guess the whole title: right and you win, wrong and you are out. */
export function applyGuess(
  match: HangmanMatch,
  title: string,
  me: string,
  text: string,
  players: [string, string],
): Result {
  const run = runOf(match, me);
  if (!text.trim()) throw new GameError('Escribí el título para arriesgar.');

  const hit = lettersOnly(text) === lettersOnly(title);
  const next: HangmanMatch = {
    ...match,
    runs: { ...match.runs, [me]: { ...run, done: !hit, guess: { text: text.trim(), hit } } },
  };
  if (hit) return { match: { ...next, title }, end: { winnerId: me } };
  return settle(next, players, title);
}
