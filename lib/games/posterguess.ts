import type { LibraryEntry, PosterGuessMatch } from '@/lib/movie-night';
import { pickOne, type Rng } from './random';
import { GameError } from './error';
import { isEligible, normalize } from './hangman';

export const POSTER_STAGES = 5;
export const POSTER_STAGE_SECONDS = 8;
export const POSTER_MAX_GUESSES = 4;

const candidates = (library: LibraryEntry[]) =>
  library.filter((e) => Boolean(e.posterPath) && isEligible(e.title));

/** Something to blur: a watched movie with a poster and a typeable title. */
export function hasPosterCandidates(library: LibraryEntry[]) {
  return candidates(library).length > 0;
}

/** Only the letters, so "La La Land!" and "la la land" are the same guess. */
export const lettersOnly = (text: string) => [...normalize(text)].filter((c) => /[A-ZÑ]/.test(c)).join('');

export function startPosterGuess(
  library: LibraryEntry[],
  rng: Rng,
  now: number,
): { match: PosterGuessMatch; title: string } {
  const pool = candidates(library);
  if (pool.length === 0) throw new GameError('Hace falta alguna peli vista con póster.');
  const entry = pickOne(pool, rng);
  return {
    title: entry.title,
    match: {
      game: 'poster',
      posterPath: entry.posterPath!,
      hint: [entry.year, entry.genres[0]].filter(Boolean).join(' · ') || null,
      startedAt: now,
      stages: POSTER_STAGES,
      stageSeconds: POSTER_STAGE_SECONDS,
      guesses: {},
      maxGuesses: POSTER_MAX_GUESSES,
    },
  };
}

/**
 * A race: the first right guess wins. Each person has a few tries; if both
 * run out, nobody got it and the coin decides.
 */
export function applyPosterGuess(
  match: PosterGuessMatch,
  title: string,
  me: string,
  guess: string,
  players: [string, string],
): { match: PosterGuessMatch; end?: { winnerId: string | null } } {
  const text = guess.trim();
  if (!text) throw new GameError('Escribí un título.');
  const mine = match.guesses[me] ?? [];
  if (mine.some((g) => g.hit)) throw new GameError('Ya la adivinaste.');
  if (mine.length >= match.maxGuesses) throw new GameError('Se te acabaron los intentos.');

  const hit = lettersOnly(text) === lettersOnly(title);
  const guesses = { ...match.guesses, [me]: [...mine, { text, hit }] };
  const next: PosterGuessMatch = { ...match, guesses };

  if (hit) return { match: { ...next, title }, end: { winnerId: me } };

  const exhausted = players.every((p) => (guesses[p]?.length ?? 0) >= match.maxGuesses);
  if (exhausted) return { match: { ...next, title }, end: { winnerId: null } };
  return { match: next };
}
