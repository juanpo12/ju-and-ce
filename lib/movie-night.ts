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
export const GAMES = [
  'ppt', 'memoria', 'ahorcado', 'wordle', 'tateti', 'dados', 'trivia', 'mayormenor',
  'cuatro', 'nim', 'cajas', 'carta', 'taps', 'numero', 'simon', 'naval', 'poster', 'linea',
  'moneda',
] as const;

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
  cuatro: 'Cuatro en línea',
  nim: 'Nim',
  cajas: 'Puntos y cajas',
  carta: 'La carta maldita',
  taps: 'Carrera de taps',
  numero: 'El número secreto',
  simon: 'Simón dice',
  naval: 'Batalla naval',
  poster: 'Adiviná el póster',
  linea: 'Línea de tiempo',
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
  cuatro: 'al cuatro en línea',
  nim: 'al nim',
  cajas: 'a puntos y cajas',
  carta: 'a la carta maldita',
  taps: 'a la carrera de taps',
  numero: 'al número secreto',
  simon: 'a simón dice',
  naval: 'a la batalla naval',
  poster: 'a adivinar el póster',
  linea: 'a la línea de tiempo',
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

export type HangmanRun = {
  /** The title with the letters this person has not found yet as "_". */
  mask: string;
  letters: { letter: string; hit: boolean }[];
  misses: number;
  /** Out of the race: hanged, or a wrong full guess. */
  done: boolean;
  guess?: { text: string; hit: boolean };
};

export type HangmanMatch = {
  game: 'ahorcado';
  /** The shape of the title before any letter: "_" per letter, spaces and punctuation visible. */
  pattern: string;
  /** Something to go on: the year, or the genre. */
  hint: string | null;
  maxMisses: number;
  /** Each person races on their own copy of the same title. */
  runs: Record<string, HangmanRun>;
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

/* ---- the ten that came later. None of the first seven needs the library. ---- */

export type ConnectFourMatch = {
  game: 'cuatro';
  cols: number;
  rows: number;
  /** `rows * cols` cells, row 0 at the top, index = row * cols + col. */
  cells: (string | null)[];
  turn: string;
  /** The four cells that won, when someone did. */
  line?: number[];
};

export type NimMatch = {
  game: 'nim';
  /** Matches left per row (starts at 3, 5, 7). Whoever takes the last one loses. */
  rows: number[];
  turn: string;
  last?: { by: string; row: number; count: number };
};

export type BoxesMatch = {
  game: 'cajas';
  /** Boxes per side (3 → 9 boxes, odd so there is no tie). */
  size: number;
  /** `(size + 1) * size` horizontal edges: index = row * size + col, row 0 at the top. */
  horizontal: (string | null)[];
  /** `size * (size + 1)` vertical edges: index = row * (size + 1) + col. */
  vertical: (string | null)[];
  /** `size * size` boxes, who closed each. */
  boxes: (string | null)[];
  turn: string;
  score: Record<string, number>;
};

export type CursedCardMatch = {
  game: 'carta';
  /** How many cards are face down on the table. */
  cards: number;
  /** Cards already flipped (all safe, or the game would be over). */
  flipped: { card: number; by: string }[];
  turn: string;
  /** Revealed when the match ends: which one was cursed. */
  cursed?: number;
};

export type TapRaceMatch = {
  game: 'taps';
  seconds: number;
  /** Final count per person, once they ran their race. */
  counts: Record<string, number>;
};

export type SecretNumberMatch = {
  game: 'numero';
  max: number;
  /** Who already picked (without saying what). */
  picked: string[];
  /** Revealed when both picked. */
  picks?: Record<string, number>;
  target?: number;
};

export type SimonMatch = {
  game: 'simon';
  /** Colors 0–3. The whole thing is public: it is a memory game, not a secret one. */
  sequence: number[];
  /** `reached` = levels completed; `done` once they failed or finished the sequence. */
  runs: Record<string, { reached: number; done: boolean }>;
};

export type BattleshipMatch = {
  game: 'naval';
  size: number;
  /** Ship lengths of each fleet, e.g. [3, 2, 2]. */
  ships: number[];
  /** Shots each person fired at the other's board. */
  shots: Record<string, { cell: number; hit: boolean }[]>;
  /** Ships each person has sunk. */
  sunk: Record<string, number>;
  turn: string;
  /** Revealed when the match ends: each person's ship cells. */
  fleets?: Record<string, number[][]>;
};

export type PosterGuessMatch = {
  game: 'poster';
  posterPath: string;
  hint: string | null;
  /** Epoch ms when it started: the poster gets clearer with time, on every phone alike. */
  startedAt: number;
  stages: number;
  stageSeconds: number;
  guesses: Record<string, { text: string; hit: boolean }[]>;
  maxGuesses: number;
  /** Revealed when the match ends. */
  title?: string;
};

export type TimelineMatch = {
  game: 'linea';
  /** Shuffled; the years are the secret. */
  items: { entryId: string; title: string; posterPath: string | null }[];
  /** Each person's order, as item indexes from oldest to newest. */
  orders: Record<string, number[]>;
  /** Revealed when the match ends. */
  correct?: number[];
  years?: number[];
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
  | ConnectFourMatch
  | NimMatch
  | BoxesMatch
  | CursedCardMatch
  | TapRaceMatch
  | SecretNumberMatch
  | SimonMatch
  | BattleshipMatch
  | PosterGuessMatch
  | TimelineMatch
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
  /**
   * Just for fun: no candidates and no pick, straight to choosing a game. The
   * same row and the same rules, so it shares the one-live-session limit.
   */
  casual?: boolean;
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
  cursedCard?: { cursed: number };
  secretNumber?: { picks: Record<string, number> };
  battleship?: { fleets: Record<string, number[][]> };
  poster?: { title: string };
  timeline?: { correct: number[]; years: number[] };
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
  | { game: 'mayormenor'; guess: Guess }
  | { game: 'cuatro'; col: number }
  | { game: 'nim'; row: number; count: number }
  | { game: 'cajas'; edge: 'h' | 'v'; index: number }
  | { game: 'carta'; card: number }
  | { game: 'taps'; count: number }
  | { game: 'numero'; pick: number }
  | { game: 'simon'; input: number[] }
  | { game: 'naval'; cell: number }
  | { game: 'poster'; guess: string }
  | { game: 'linea'; order: number[] };

/* -------------------------------- helpers -------------------------------- */

export const LIVE_PHASES: Phase[] = ['esperando', 'candidatas', 'juego', 'jugando'];

export const isLive = (phase: Phase) => LIVE_PHASES.includes(phase);

/** Where each kind of session lives. */
export const sessionPath = (night: Pick<PublicNight, 'state'>) =>
  night.state.casual ? '/jugar' : '/pendientes/noche';

/** The other one of the two. */
export const otherOf = (players: [string, string], me: string) =>
  players[0] === me ? players[1] : players[0];
