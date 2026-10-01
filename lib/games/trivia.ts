import type { LibraryEntry, TriviaMatch, TriviaQuestion } from '@/lib/movie-night';
import { pickOne, shuffle, type Rng } from './random';
import { GameError } from './error';

export const TRIVIA_QUESTIONS = 5;
/** Fewer watched movies than this and there is nothing to ask about. */
export const MIN_LIBRARY_FOR_TRIVIA = 4;

type Built = { question: TriviaQuestion; correct: number };

/** Shuffles the options and remembers where the right one landed. */
function withOptions(
  text: string,
  right: string,
  wrong: string[],
  about: LibraryEntry,
  rng: Rng,
): Built {
  const options = shuffle([right, ...wrong], rng);
  return {
    question: {
      text,
      options,
      about: { title: about.title, year: about.year, posterPath: about.posterPath },
    },
    correct: options.indexOf(right),
  };
}

/** Three distinct values other than `right`, from the pool first, then by nudging. */
function distractors(right: number, pool: number[], nudge: () => number, rng: Rng): number[] {
  const out = new Set<number>();
  for (const v of shuffle(pool, rng)) {
    if (out.size === 3) break;
    if (v !== right) out.add(v);
  }
  let guard = 0;
  while (out.size < 3 && guard++ < 50) {
    const v = right + nudge();
    if (v !== right && v > 0) out.add(v);
  }
  return [...out].slice(0, 3);
}

type Builder = (entry: LibraryEntry, library: LibraryEntry[], names: Record<string, string>, rng: Rng) => Built | null;

const BUILDERS: Builder[] = [
  // Year
  (e, lib, _n, rng) => {
    if (e.year === null) return null;
    const pool = lib.map((x) => x.year).filter((y): y is number => y !== null);
    const wrong = distractors(e.year, pool, () => (rng.int(2) ? 1 : -1) * (rng.int(6) + 1), rng);
    return withOptions(`¿De qué año es ${e.title}?`, String(e.year), wrong.map(String), e, rng);
  },
  // Director
  (e, lib, _n, rng) => {
    if (!e.director) return null;
    const others = [...new Set(lib.map((x) => x.director).filter((d): d is string => Boolean(d) && d !== e.director))];
    if (others.length < 3) return null;
    return withOptions(`¿Quién dirigió ${e.title}?`, e.director, shuffle(others, rng).slice(0, 3), e, rng);
  },
  // Duration
  (e, lib, _n, rng) => {
    if (e.durationMin === null) return null;
    const pool = lib.map((x) => x.durationMin).filter((d): d is number => d !== null);
    const wrong = distractors(e.durationMin, pool, () => (rng.int(2) ? 1 : -1) * (10 + rng.int(35)), rng);
    const fmt = (m: number) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
    return withOptions(`¿Cuánto dura ${e.title}?`, fmt(e.durationMin), wrong.map(fmt), e, rng);
  },
  // Who rated it higher
  (e, _lib, names, rng) => {
    const ids = Object.keys(e.ratings).filter((id) => names[id]);
    if (ids.length !== 2) return null;
    const [a, b] = ids as [string, string];
    if (e.ratings[a] === e.ratings[b]) return null;
    const right = e.ratings[a]! > e.ratings[b]! ? names[a]! : names[b]!;
    const wrong = right === names[a] ? names[b]! : names[a]!;
    return withOptions(`¿Quién le puso más estrellas a ${e.title}?`, right, [wrong], e, rng);
  },
  // Genre
  (e, lib, _n, rng) => {
    const genre = e.genres[0];
    if (!genre) return null;
    const others = [...new Set(lib.flatMap((x) => x.genres).filter((g) => !e.genres.includes(g)))];
    if (others.length < 3) return null;
    return withOptions(`¿De qué género es ${e.title}?`, genre, shuffle(others, rng).slice(0, 3), e, rng);
  },
];

/**
 * Five questions about what they already watched, each about a different
 * movie, mixing the kinds of question as much as the data allows.
 */
export function buildTrivia(
  library: LibraryEntry[],
  names: Record<string, string>,
  rng: Rng,
): { questions: TriviaQuestion[]; correct: number[] } {
  if (library.length < MIN_LIBRARY_FOR_TRIVIA) throw new GameError('Hacen falta más pelis vistas para la trivia.');
  const built: Built[] = [];
  const entries = shuffle(library, rng);
  let kind = rng.int(BUILDERS.length);

  for (const entry of entries) {
    if (built.length === TRIVIA_QUESTIONS) break;
    // Try the kinds in rotation so the same movie does not repeat and the
    // questions vary.
    for (let i = 0; i < BUILDERS.length; i++) {
      const b = BUILDERS[(kind + i) % BUILDERS.length]!(entry, library, names, rng);
      if (b) {
        built.push(b);
        kind = (kind + i + 1) % BUILDERS.length;
        break;
      }
    }
  }
  if (built.length < 3) throw new GameError('Las pelis vistas no alcanzan para armar preguntas.');
  return { questions: built.map((b) => b.question), correct: built.map((b) => b.correct) };
}

export function startTrivia(
  library: LibraryEntry[],
  names: Record<string, string>,
  rng: Rng,
): { match: TriviaMatch; correct: number[] } {
  const { questions, correct } = buildTrivia(library, names, rng);
  return { match: { game: 'trivia', questions, answers: {} }, correct };
}

/**
 * Each one answers at their own pace. When both finished, more right answers
 * wins; the same number is a tie for the coin.
 */
export function applyAnswer(
  match: TriviaMatch,
  correct: number[],
  me: string,
  answer: number,
  players: [string, string],
): { match: TriviaMatch; end?: { winnerId: string | null } } {
  const mine = match.answers[me] ?? [];
  if (mine.length >= match.questions.length) throw new GameError('Ya respondiste todo. Esperá al otro.');
  const question = match.questions[mine.length]!;
  if (!Number.isInteger(answer) || answer < 0 || answer >= question.options.length) {
    throw new GameError('Esa opción no existe.');
  }

  const answers = { ...match.answers, [me]: [...mine, answer] };
  const next: TriviaMatch = { ...match, answers };
  const [a, b] = players;
  const finished = (who: string) => (answers[who]?.length ?? 0) >= match.questions.length;
  if (!finished(a) || !finished(b)) return { match: next };

  const hits = (who: string) => answers[who]!.filter((x, i) => x === correct[i]).length;
  const ha = hits(a);
  const hb = hits(b);
  return { match: { ...next, correct }, end: { winnerId: ha === hb ? null : ha > hb ? a : b } };
}

/** How many a person got right so far: only meaningful once `correct` is public. */
export function hitsOf(match: TriviaMatch, who: string) {
  if (!match.correct) return null;
  return (match.answers[who] ?? []).filter((x, i) => x === match.correct![i]).length;
}

