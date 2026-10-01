import type { Card, Game, LibraryEntry, Match, Move, NightSecret } from '@/lib/movie-night';
import { pickOne, type Rng } from './random';
import { GameError } from './error';
import { startRps, applyRps } from './rps';
import { startMemory, applyMemory, MIN_MEMORY_CARDS } from './memory';
import { startHangman, applyLetter, applyGuess, isEligible, type HangmanTitle } from './hangman';
import { startWordle, applyAttempt } from './wordle';
import { startTicTacToe, applyCell } from './tictactoe';
import { startDice, applyRoll } from './dice';
import { startTrivia, applyAnswer, MIN_LIBRARY_FOR_TRIVIA } from './trivia';
import { startHigherLower, applyHigherLower } from './higherlower';
import { startConnectFour, applyDrop } from './connectfour';
import { startNim, applyTake } from './nim';
import { startBoxes, applyEdge } from './boxes';
import { startCursedCard, applyFlip } from './cursedcard';
import { startTapRace, applyTapCount } from './taprace';
import { startSecretNumber, applyPick } from './secretnumber';
import { startSimon, applySimonInput } from './simon';
import { startBattleship, applyShot } from './battleship';
import { startPosterGuess, applyPosterGuess, hasPosterCandidates } from './posterguess';
import { startTimeline, applyOrder, hasTimelineCandidates, TIMELINE_ITEMS } from './timeline';

export { GameError };

/** What a game needs to start. */
export type MatchContext = {
  players: [string, string];
  /** Who opens the match, in turn-based games. */
  starter: string;
  /** The watched movies: cards for memory, titles for hangman, everything for trivia. */
  cards: Card[];
  titles: HangmanTitle[];
  library: LibraryEntry[];
  /** Each person's name by id, for questions like "who rated it higher". */
  names: Record<string, string>;
};

export type Availability = Pick<MatchContext, 'cards' | 'titles' | 'library'>;

/** Why a game cannot be played today (a message for the UI), or null if it can. */
export function whyUnavailable(game: Game, ctx: Availability) {
  if (game === 'memoria' && ctx.cards.length < MIN_MEMORY_CARDS) {
    return `Hacen falta ${MIN_MEMORY_CARDS} pelis vistas para armar el tablero.`;
  }
  if (game === 'ahorcado' && !ctx.titles.some((t) => isEligible(t.title))) {
    return 'Hace falta alguna peli vista para adivinar.';
  }
  if (game === 'trivia' && ctx.library.length < MIN_LIBRARY_FOR_TRIVIA) {
    return `Hacen falta ${MIN_LIBRARY_FOR_TRIVIA} pelis vistas para armar preguntas.`;
  }
  if (game === 'poster' && !hasPosterCandidates(ctx.library)) {
    return 'Hace falta alguna peli vista con póster.';
  }
  if (game === 'linea' && !hasTimelineCandidates(ctx.library)) {
    return `Hacen falta ${TIMELINE_ITEMS} pelis vistas de años distintos.`;
  }
  return null;
}

export type MatchStart = { match: Match; secret: NightSecret; end?: { winnerId: string } };

export function startMatch(game: Game, ctx: MatchContext, rng: Rng, now = Date.now()): MatchStart {
  const reason = whyUnavailable(game, ctx);
  if (reason) throw new GameError(reason);

  switch (game) {
    case 'ppt':
      return { match: startRps(ctx.players), secret: {} };
    case 'memoria': {
      const { match, board } = startMemory(ctx.cards, ctx.players, ctx.starter, rng);
      return { match, secret: { memory: { board } } };
    }
    case 'ahorcado': {
      const { match, title } = startHangman(ctx.titles, ctx.starter, rng);
      return { match, secret: { hangman: { title } } };
    }
    case 'wordle': {
      const { match, word } = startWordle(rng);
      return { match, secret: { wordle: { word } } };
    }
    case 'tateti':
      return { match: startTicTacToe(ctx.starter), secret: {} };
    case 'dados':
      return { match: startDice(ctx.players), secret: {} };
    case 'trivia': {
      const { match, correct } = startTrivia(ctx.library, ctx.names, rng);
      return { match, secret: { trivia: { correct } } };
    }
    case 'mayormenor': {
      const { match, sequence } = startHigherLower(ctx.players, rng);
      return { match, secret: { higherLower: { sequence } } };
    }
    case 'cuatro':
      return { match: startConnectFour(ctx.starter), secret: {} };
    case 'nim':
      return { match: startNim(ctx.starter), secret: {} };
    case 'cajas':
      return { match: startBoxes(ctx.starter, ctx.players), secret: {} };
    case 'carta': {
      const { match, cursed } = startCursedCard(ctx.starter, rng);
      return { match, secret: { cursedCard: { cursed } } };
    }
    case 'taps':
      return { match: startTapRace(), secret: {} };
    case 'numero':
      return { match: startSecretNumber(), secret: { secretNumber: { picks: {} } } };
    case 'simon':
      return { match: startSimon(ctx.players, rng), secret: {} };
    case 'naval': {
      const { match, fleets } = startBattleship(ctx.players, ctx.starter, rng);
      return { match, secret: { battleship: { fleets } } };
    }
    case 'poster': {
      const { match, title } = startPosterGuess(ctx.library, rng, now);
      return { match, secret: { poster: { title } } };
    }
    case 'linea': {
      const { match, correct, years } = startTimeline(ctx.library, rng);
      return { match, secret: { timeline: { correct, years } } };
    }
    case 'moneda': {
      const result = pickOne(ctx.players, rng);
      return {
        match: { game: 'moneda', result, tossedBy: ctx.starter },
        secret: {},
        end: { winnerId: result },
      };
    }
  }
}

export type MoveResult = {
  match: Match;
  secret: NightSecret;
  /** `winnerId: null` is a tie: the coin settles it. */
  end?: { winnerId: string | null };
};

export function applyMove(
  match: Match,
  secret: NightSecret,
  me: string,
  move: Move,
  players: [string, string],
  rng: Rng,
): MoveResult {
  if (move.game !== match.game) throw new GameError('Esa jugada no es de este juego.');

  switch (match.game) {
    case 'ppt': {
      if (move.game !== 'ppt') break;
      const r = applyRps(match, secret.rps ?? {}, me, move.throw, players);
      return { match: r.match, secret: { ...secret, rps: r.secret }, end: r.end };
    }
    case 'memoria': {
      if (move.game !== 'memoria') break;
      const board = secret.memory?.board;
      if (!board) throw new GameError('El tablero se perdió.');
      const r = applyMemory(match, board, me, move.card, players);
      return { match: r.match, secret, end: r.end };
    }
    case 'ahorcado': {
      if (move.game !== 'ahorcado') break;
      const title = secret.hangman?.title;
      if (!title) throw new GameError('El título se perdió.');
      const r =
        'letter' in move
          ? applyLetter(match, title, me, move.letter, players)
          : applyGuess(match, title, me, move.guess, players);
      return { match: r.match, secret, end: r.end };
    }
    case 'wordle': {
      if (move.game !== 'wordle') break;
      const word = secret.wordle?.word;
      if (!word) throw new GameError('La palabra se perdió.');
      const r = applyAttempt(match, word, me, move.attempt, players);
      return { match: r.match, secret, end: r.end };
    }
    case 'tateti': {
      if (move.game !== 'tateti') break;
      const r = applyCell(match, me, move.cell, players);
      return { match: r.match, secret, end: r.end };
    }
    case 'dados': {
      if (move.game !== 'dados') break;
      const r = applyRoll(match, me, players, rng);
      return { match: r.match, secret, end: r.end };
    }
    case 'trivia': {
      if (move.game !== 'trivia') break;
      const correct = secret.trivia?.correct;
      if (!correct) throw new GameError('Las respuestas se perdieron.');
      const r = applyAnswer(match, correct, me, move.answer, players);
      return { match: r.match, secret, end: r.end };
    }
    case 'mayormenor': {
      if (move.game !== 'mayormenor') break;
      const sequence = secret.higherLower?.sequence;
      if (!sequence) throw new GameError('Las cartas se perdieron.');
      const r = applyHigherLower(match, sequence, me, move.guess, players);
      return { match: r.match, secret, end: r.end };
    }
    case 'cuatro': {
      if (move.game !== 'cuatro') break;
      const r = applyDrop(match, me, move.col, players);
      return { match: r.match, secret, end: r.end };
    }
    case 'nim': {
      if (move.game !== 'nim') break;
      const r = applyTake(match, me, move.row, move.count, players);
      return { match: r.match, secret, end: r.end };
    }
    case 'cajas': {
      if (move.game !== 'cajas') break;
      const r = applyEdge(match, me, move.edge, move.index, players);
      return { match: r.match, secret, end: r.end };
    }
    case 'carta': {
      if (move.game !== 'carta') break;
      const cursed = secret.cursedCard?.cursed;
      if (cursed === undefined) throw new GameError('La carta se perdió.');
      const r = applyFlip(match, cursed, me, move.card, players);
      return { match: r.match, secret, end: r.end };
    }
    case 'taps': {
      if (move.game !== 'taps') break;
      const r = applyTapCount(match, me, move.count, players);
      return { match: r.match, secret, end: r.end };
    }
    case 'numero': {
      if (move.game !== 'numero') break;
      const r = applyPick(match, secret.secretNumber?.picks ?? {}, me, move.pick, players, rng);
      return { match: r.match, secret: { ...secret, secretNumber: { picks: r.picks } }, end: r.end };
    }
    case 'simon': {
      if (move.game !== 'simon') break;
      const r = applySimonInput(match, me, move.input, players);
      return { match: r.match, secret, end: r.end };
    }
    case 'naval': {
      if (move.game !== 'naval') break;
      const fleets = secret.battleship?.fleets;
      if (!fleets) throw new GameError('Los barcos se perdieron.');
      const r = applyShot(match, fleets, me, move.cell, players);
      return { match: r.match, secret, end: r.end };
    }
    case 'poster': {
      if (move.game !== 'poster') break;
      const title = secret.poster?.title;
      if (!title) throw new GameError('El título se perdió.');
      const r = applyPosterGuess(match, title, me, move.guess, players);
      return { match: r.match, secret, end: r.end };
    }
    case 'linea': {
      if (move.game !== 'linea') break;
      const t = secret.timeline;
      if (!t) throw new GameError('Los años se perdieron.');
      const r = applyOrder(match, t.correct, t.years, me, move.order, players);
      return { match: r.match, secret, end: r.end };
    }
  }
  // The coin is not played: it already fell when it was chosen.
  throw new GameError('Esa jugada no es de este juego.');
}

/** When the game tied: heads or tails. */
export function tiebreak(players: [string, string], rng: Rng) {
  return pickOne(players, rng);
}

const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);
const isIntList = (v: unknown, max = 64): v is number[] =>
  Array.isArray(v) && v.length <= max && v.every(isInt);

/** Whether what arrived from the browser has the shape of a move. */
export function isValidMove(x: unknown): x is Move {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  switch (o.game) {
    case 'ppt':
      return o.throw === 'rock' || o.throw === 'paper' || o.throw === 'scissors';
    case 'memoria':
      return isInt(o.card);
    case 'ahorcado':
      return (
        (typeof o.letter === 'string' && o.letter.length === 1) ||
        (typeof o.guess === 'string' && o.guess.length <= 200)
      );
    case 'wordle':
      return typeof o.attempt === 'string' && o.attempt.length <= 10;
    case 'tateti':
      return isInt(o.cell);
    case 'dados':
      return true;
    case 'trivia':
      return isInt(o.answer);
    case 'mayormenor':
      return o.guess === 'higher' || o.guess === 'lower';
    case 'cuatro':
      return isInt(o.col);
    case 'nim':
      return isInt(o.row) && isInt(o.count);
    case 'cajas':
      return (o.edge === 'h' || o.edge === 'v') && isInt(o.index);
    case 'carta':
      return isInt(o.card);
    case 'taps':
      return isInt(o.count) && o.count >= 0 && o.count <= 5000;
    case 'numero':
      return isInt(o.pick);
    case 'simon':
      return isIntList(o.input);
    case 'naval':
      return isInt(o.cell);
    case 'poster':
      return typeof o.guess === 'string' && o.guess.length <= 200;
    case 'linea':
      return isIntList(o.order, 12);
    default:
      return false;
  }
}
