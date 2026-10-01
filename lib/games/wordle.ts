import type { WordleHint, WordleMatch } from '@/lib/movie-night';
import { pickOne, type Rng } from './random';
import { GameError } from './error';
import { TARGETS, isValidWord } from './words';

export const MAX_ATTEMPTS = 6;
export const WORD_LENGTH = 5;

/** Lowercase and without accents, keeping the ñ: the way the list is. */
export function normalizeWord(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-̂̄-ͯ]/g, '')
    .normalize('NFC');
}

/**
 * The hints for an attempt. First the letters in place; then, of what is left,
 * the ones somewhere else, counting each letter of the word only once, so
 * "llave" against "calle" does not mark three Ls.
 */
export function score(attempt: string, word: string): WordleHint[] {
  const hints: WordleHint[] = Array(word.length).fill('miss');
  const spare: Record<string, number> = {};

  for (let i = 0; i < word.length; i++) {
    if (attempt[i] === word[i]) hints[i] = 'hit';
    else spare[word[i]!] = (spare[word[i]!] ?? 0) + 1;
  }
  for (let i = 0; i < word.length; i++) {
    const c = attempt[i]!;
    if (hints[i] === 'hit') continue;
    if (spare[c]) {
      hints[i] = 'near';
      spare[c]!--;
    }
  }
  return hints;
}

export function startWordle(rng: Rng): { match: WordleMatch; word: string } {
  return {
    word: pickOne(TARGETS, rng),
    match: { game: 'wordle', attempts: {}, result: {}, maxAttempts: MAX_ATTEMPTS },
  };
}

/**
 * Each one guesses on their own, no turns. Fewest attempts wins. The match
 * ends as soon as the result can no longer change: if the other one already
 * spent more attempts than you needed, there is no point in going on. Same
 * count, or neither solves it: coin.
 */
export function applyAttempt(
  match: WordleMatch,
  word: string,
  me: string,
  attempt: string,
  players: [string, string],
): { match: WordleMatch; end?: { winnerId: string | null } } {
  if (match.result[me]) throw new GameError('Ya terminaste. Esperá al otro.');
  const w = normalizeWord(attempt);
  if (w.length !== WORD_LENGTH || !/^[a-zñ]+$/.test(w)) throw new GameError('Tienen que ser cinco letras.');
  if (!isValidWord(w)) throw new GameError('Esa palabra no está en la lista.');

  const mine = [...(match.attempts[me] ?? []), { letters: w, hints: score(w, word) }];
  const result = { ...match.result };
  if (w === word) result[me] = 'solved';
  else if (mine.length >= match.maxAttempts) result[me] = 'failed';

  const next: WordleMatch = { ...match, attempts: { ...match.attempts, [me]: mine }, result };
  const end = decide(next, players);
  return { match: end ? { ...next, word } : next, end };
}

/**
 * What each one already has locked in and the best they could still get. If
 * neither can change the order, it is decided.
 */
function decide(
  match: WordleMatch,
  players: [string, string],
): { winnerId: string | null } | undefined {
  const [a, b] = players;
  const standing = (who: string) => {
    const used = match.attempts[who]?.length ?? 0;
    const r = match.result[who];
    if (r === 'solved') return { fixed: used, best: used };
    if (r === 'failed') return { fixed: Infinity, best: Infinity };
    return { fixed: null, best: used + 1 };
  };
  const sa = standing(a);
  const sb = standing(b);

  if (sa.fixed !== null && sb.fixed !== null) {
    if (sa.fixed === sb.fixed) return { winnerId: null };
    return { winnerId: sa.fixed < sb.fixed ? a : b };
  }
  // One finished and the other can no longer even tie.
  if (sa.fixed !== null && sa.fixed < sb.best) return { winnerId: a };
  if (sb.fixed !== null && sb.fixed < sa.best) return { winnerId: b };
  return undefined;
}
