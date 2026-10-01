import type { Night, Tipo } from '@/db/schema';

/**
 * The types behind a "movie night": the session in which the couple picks what
 * to watch.
 *
 * This file is imported by the schema, the server actions, the game logic and
 * the browser components, so nothing in it runs: only types, constants and a
 * couple of pure functions.
 */

/** The same values as the checks on `noches` in the database. */
export const NIGHT_MODES = ['individual', 'duo'] as const;
export const NIGHT_PHASES = ['esperando', 'candidatas', 'juego', 'jugando', 'terminada', 'cancelada'] as const;
export const GAMES = ['ppt', 'memoria', 'ahorcado', 'wordle', 'tateti', 'dados', 'trivia', 'mayormenor', 'moneda'] as const;

export type Mode = (typeof NIGHT_MODES)[number];

/**
 * esperando   → whoever opened the session waits for the other one
 * candidatas  → both present; each proposes a candidate
 * juego       → the candidates differ: pick the game that settles it
 * jugando     → the match is in progress
 * terminada   → there is a pick (and a winner, unless they agreed)
 * cancelada   → someone closed the session before it ended
 */
export type Phase = (typeof NIGHT_PHASES)[number];

export type Game = (typeof GAMES)[number];

export const GAME_NAME: Record<Game, string> = {
  ppt: 'Piedra, papel o tijera',
  memoria: 'Memoria',
  ahorcado: 'Ahorcado',
  wordle: 'La palabra',
  tateti: 'Tateti',
  dados: 'Dados',
  trivia: 'Trivia de la libreta',
  mayormenor: 'Mayor o menor',
  moneda: 'Moneda',
};

/** "ganó Juan al ahorcado", "ganó Ceci a la moneda". */
export const AT_GAME: Record<Game, string> = {
  ppt: 'a piedra, papel o tijera',
  memoria: 'a la memoria',
  ahorcado: 'al ahorcado',
  wordle: 'a la palabra',
  tateti: 'al tateti',
  dados: 'a los dados',
  trivia: 'a la trivia',
  mayormenor: 'a mayor o menor',
  moneda: 'a la moneda',
};

export type Candidate = { entryId: string; how: 'picked' | 'random' };

export type DrawFilters = { type?: Tipo; genre?: string; maxDuration?: number };

/** What a pending entry needs in order to go through the draw filters. */
export type Filterable = { tipo: Tipo; generos: string[]; duracionMin: number | null };

/**
 * The candidates left once the filters apply. Runs the same in the browser (to
 * say "7 candidatas" while picking filters) and on the server (to actually
 * draw). An entry without a runtime passes the duration cap: nobody knows how
 * long it is.
 */
export function filterPending<T extends Filterable>(list: readonly T[], f: DrawFilters): T[] {
  return list.filter(
    (p) =>
      (!f.type || p.tipo === f.type) &&
      (!f.genre || p.generos.includes(f.genre)) &&
      (!f.maxDuration || p.duracionMin === null || p.duracionMin <= f.maxDuration),
  );
}

export function validFilters(input: unknown): DrawFilters {
  if (!input || typeof input !== 'object') return {};
  const o = input as Record<string, unknown>;
  return {
    ...(o.type === 'pelicula' || o.type === 'serie' ? { type: o.type } : {}),
    ...(typeof o.genre === 'string' && o.genre ? { genre: o.genre.slice(0, 60) } : {}),
    ...(typeof o.maxDuration === 'number' && o.maxDuration > 0 ? { maxDuration: o.maxDuration } : {}),
  };
}

/* -------------------------------- the games ------------------------------- */

export type Throw = 'rock' | 'paper' | 'scissors';
export const THROWS: Throw[] = ['rock', 'paper', 'scissors'];

export type RpsMatch = {
  game: 'ppt';
  /** Rounds already settled. `winner: null` is a tie, replayed. */
  rounds: { throws: Record<string, Throw>; winner: string | null }[];
  /** Who already chose in the current round (without saying what). */
  chosen: string[];
  score: Record<string, number>;
  /** Points needed to win: 2 is "best of 3". */
  target: number;
};

/** A board card: a movie from the library, with what `Poster` needs. */
export type Card = {
  entryId: string;
  title: string;
  year: number | null;
  posterPath: string | null;
};

export type MemoryMatch = {
  game: 'memoria';
  /** One per position. `faceUp` is the visible face (flipped or already won). */
  cards: { faceUp: Card | null; ownedBy: string | null }[];
  /** Positions flipped in the current turn (0 or 1). */
  flipped: number[];
  turn: string;
  pairs: Record<string, number>;
  totalPairs: number;
  /**
   * The last pair attempted. On a miss the server already hid both: the
   * client shows them for a moment when `n` changes, then flips them back.
   */
  lastMove?: {
    n: number;
    by: string;
    cards: [number, number];
    faces: [Card, Card];
    hit: boolean;
  };
};

export type HangmanMatch = {
  game: 'ahorcado';
  /** The title with missing letters as "_". Spaces and punctuation stay visible. */
  mask: string;
  letters: { letter: string; by: string; hit: boolean }[];
  turn: string;
  misses: number;
  maxMisses: number;
  /** Something to go on: the year, or the genre. */
  hint: string | null;
  guess?: { by: string; text: string; hit: boolean };
  /** Revealed when the match ends. */
  title?: string;
};

export type WordleHint = 'hit' | 'near' | 'miss';

export type WordleMatch = {
  game: 'wordle';
  attempts: Record<string, { letters: string; hints: WordleHint[] }[]>;
  result: Record<string, 'solved' | 'failed'>;
  maxAttempts: number;
  /** Revealed when the match ends. */
  word?: string;
};

export type CoinMatch = {
  game: 'moneda';
  result: string;
  tossedBy: string;
};

export type TicTacToeMatch = {
  game: 'tateti';
  /** Nine cells, each the id of who marked it. */
  board: (string | null)[];
  turn: string;
  /** Who opened the current board: it alternates after a draw. */
  starter: string;
  /** Drawn boards so far. At `maxDraws` the coin settles it. */
  draws: number;
  maxDraws: number;
  /** The winning line, when there is one. */
  line?: number[];
};

export type Roll = [number, number];

export type DiceMatch = {
  game: 'dados';
  /** Rounds already settled. `winner: null` is a tie, replayed. */
  rounds: { rolls: Record<string, Roll>; winner: string | null }[];
  /** The rolls of the current round, as they come in. */
  rolls: Record<string, Roll>;
  score: Record<string, number>;
  target: number;
};

export type TriviaQuestion = {
  text: string;
  options: string[];
  /** The movie the question is about, to show its poster. */
  about?: { title: string; year: number | null; posterPath: string | null };
};

export type TriviaMatch = {
  game: 'trivia';
  questions: TriviaQuestion[];
  /** Each person's answers so far (option indexes), in question order. */
  answers: Record<string, number[]>;
  /** Revealed when the match ends. */
  correct?: number[];
};

export type Guess = 'higher' | 'lower';

export type HigherLowerMatch = {
  game: 'mayormenor';
  /** The first card, the same for both. */
  first: number;
  /** How many cards the sequence has. */
  length: number;
  /** Each person's run: the cards they have seen and how many guesses they got right. */
  runs: Record<string, { seen: number[]; streak: number; done: boolean }>;
};

export type Match =
  | RpsMatch
  | MemoryMatch
  | HangmanMatch
  | WordleMatch
  | TicTacToeMatch
  | DiceMatch
  | TriviaMatch
  | HigherLowerMatch
  | CoinMatch;

/** A watched movie with everything the trivia can ask about. */
export type LibraryEntry = {
  entryId: string;
  title: string;
  year: number | null;
  director: string | null;
  durationMin: number | null;
  genres: string[];
  posterPath: string | null;
  /** Stars per person id. */
  ratings: Record<string, number>;
};

/* ----------------------------- state and secret --------------------------- */

export type NightState = {
  /** Who entered the session. */
  present?: string[];
  candidates?: Record<string, Candidate>;
  match?: Match;
  /** When the game tied, a coin settles it. */
  tiebreak?: { result: string };
  /** Who cancelled. */
  closedBy?: string;
  /** Who gave up mid-game: the other one wins. */
  surrenderedBy?: string;
};

/** What the server needs to referee and must not be shown. */
export type NightSecret = {
  rps?: Record<string, Throw>;
  memory?: { board: Card[] };
  hangman?: { title: string };
  wordle?: { word: string };
  trivia?: { correct: number[] };
  higherLower?: { sequence: number[] };
};

/** The row without the secret: the only thing that travels to the browser. */
export type PublicNight = Omit<Night, 'secret'>;

/** A move, per game. What a phone sends to the server. */
export type Move =
  | { game: 'ppt'; throw: Throw }
  | { game: 'memoria'; card: number }
  | { game: 'ahorcado'; letter: string }
  | { game: 'ahorcado'; guess: string }
  | { game: 'wordle'; attempt: string }
  | { game: 'tateti'; cell: number }
  | { game: 'dados' }
  | { game: 'trivia'; answer: number }
  | { game: 'mayormenor'; guess: Guess };

/* -------------------------------- helpers -------------------------------- */

export const LIVE_PHASES: Phase[] = ['esperando', 'candidatas', 'juego', 'jugando'];

export const isLive = (phase: Phase) => LIVE_PHASES.includes(phase);

/** The other one of the two. */
export const otherOf = (players: [string, string], me: string) =>
  players[0] === me ? players[1] : players[0];
