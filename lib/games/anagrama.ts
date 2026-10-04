import type { GameModule } from './module';
import { pickOne, shuffle, type Rng } from './random';
import { GameError } from './error';
import { TARGETS, isValidWord } from './words';

/** First to 3 rounds. */
export const ANAGRAMA_TARGET = 3;
/** Wrong guesses each player gets per round, so typing at random does not pay. */
export const MAX_MISSES = 6;

export type AnagramaRound = {
  /** The scrambled letters and the word they hid. */
  letters: string;
  word: string;
  /** Null: both passed. */
  winner: string | null;
  /** What the winner typed (another valid word with the same letters counts). */
  answer?: string;
};

export type AnagramaMatch = {
  game: 'anagrama';
  /** The current round's scrambled letters. */
  letters: string;
  rounds: AnagramaRound[];
  /** Wrong guesses per player in the current round. */
  misses: Record<string, number>;
  /** Who gave up on the current word. When both do, it is revealed and replaced. */
  passed: string[];
  score: Record<string, number>;
  target: number;
  maxMisses: number;
};

export type AnagramaMove = { game: 'anagrama'; guess?: string; pass?: boolean };

type AnagramaSecret = { word: string; used: string[] };

export { normalize } from './normalize';
import { normalize } from './normalize';

const sorted = (w: string) => [...w].sort().join('');

/** Real words only (the frequency list has names in it), with at least two different letters. */
const WORDS = TARGETS.filter((w) => isValidWord(w) && new Set(w).size > 2);

/** A word not used yet in this match, and its letters in an order that is not the word. */
function deal(rng: Rng, used: string[]): { word: string; letters: string } {
  const fresh = WORDS.filter((w) => !used.includes(w));
  const word = pickOne(fresh.length ? fresh : WORDS, rng);
  let letters = word;
  for (let i = 0; i < 20 && letters === word; i++) letters = shuffle([...word], rng).join('');
  return { word, letters };
}

/**
 * Anagrama: the same scrambled letters on both phones, and a race to find the
 * word. The first correct guess takes the round; any real word with exactly
 * those letters counts. The word stays in the secret until the round ends.
 */
const anagrama: GameModule<AnagramaMatch, AnagramaMove, AnagramaSecret> = {
  start: ({ players }, rng) => {
    const { word, letters } = deal(rng, []);
    return {
      match: {
        game: 'anagrama',
        letters,
        rounds: [],
        misses: { [players[0]]: 0, [players[1]]: 0 },
        passed: [],
        score: { [players[0]]: 0, [players[1]]: 0 },
        target: ANAGRAMA_TARGET,
        maxMisses: MAX_MISSES,
      },
      secret: { word, used: [word] },
    };
  },

  apply({ match, secret, me, move, players, rng }) {
    const nextRound = (winner: string | null, answer?: string) => {
      const score = winner ? { ...match.score, [winner]: (match.score[winner] ?? 0) + 1 } : match.score;
      const { word, letters } = deal(rng, secret.used);
      const next: AnagramaMatch = {
        ...match,
        letters,
        rounds: [...match.rounds, { letters: match.letters, word: secret.word, winner, ...(answer ? { answer } : {}) }],
        misses: { [players[0]]: 0, [players[1]]: 0 },
        passed: [],
        score,
      };
      return {
        match: next,
        secret: { word, used: [...secret.used, word] },
        end: winner && score[winner]! >= match.target ? { winnerId: winner } : undefined,
      };
    };

    if (move.pass) {
      if (match.passed.includes(me)) throw new GameError('Ya pasaste. Esperá al otro.');
      const passed = [...match.passed, me];
      if (players.every((p) => passed.includes(p))) return nextRound(null);
      return { match: { ...match, passed }, secret };
    }

    if ((match.misses[me] ?? 0) >= match.maxMisses) throw new GameError('Te quedaste sin intentos en esta palabra.');
    const guess = normalize(move.guess ?? '');
    if (guess.length !== secret.word.length) {
      throw new GameError(`Tiene que tener ${secret.word.length} letras.`);
    }
    const right = guess === secret.word || (sorted(guess) === sorted(secret.word) && isValidWord(guess));
    if (right) return nextRound(me, guess);
    return { match: { ...match, misses: { ...match.misses, [me]: (match.misses[me] ?? 0) + 1 } }, secret };
  },

  isValidMove: (o) => o.pass === true || (typeof o.guess === 'string' && o.guess.length <= 20),
};

export default anagrama;
