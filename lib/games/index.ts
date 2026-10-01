import type { Card, Game, Match, Move, NightSecret } from '@/lib/movie-night';
import { pickOne, type Rng } from './random';
import { GameError } from './error';
import { startRps, applyRps } from './rps';
import { startMemory, applyMemory, MIN_MEMORY_CARDS } from './memory';
import { startHangman, applyLetter, applyGuess, isEligible, type HangmanTitle } from './hangman';
import { startWordle, applyAttempt } from './wordle';

export { GameError };

/** What a game needs to start. */
export type MatchContext = {
  players: [string, string];
  /** Who opens the match, in turn-based games. */
  starter: string;
  /** The watched movies: cards for memory, titles for hangman. */
  cards: Card[];
  titles: HangmanTitle[];
};

/** Why a game cannot be played today (a message for the UI), or null if it can. */
export function whyUnavailable(game: Game, ctx: Pick<MatchContext, 'cards' | 'titles'>) {
  if (game === 'memoria' && ctx.cards.length < MIN_MEMORY_CARDS) {
    return `Hacen falta ${MIN_MEMORY_CARDS} pelis vistas para armar el tablero.`;
  }
  if (game === 'ahorcado' && !ctx.titles.some((t) => isEligible(t.title))) {
    return 'Hace falta alguna peli vista para adivinar.';
  }
  return null;
}

export type MatchStart = { match: Match; secret: NightSecret; end?: { winnerId: string } };

export function startMatch(game: Game, ctx: MatchContext, rng: Rng): MatchStart {
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
  }
  // The coin is not played: it already fell when it was chosen.
  throw new GameError('Esa jugada no es de este juego.');
}

/** When the game tied: heads or tails. */
export function tiebreak(players: [string, string], rng: Rng) {
  return pickOne(players, rng);
}

/** Whether what arrived from the browser has the shape of a move. */
export function isValidMove(x: unknown): x is Move {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  switch (o.game) {
    case 'ppt':
      return o.throw === 'rock' || o.throw === 'paper' || o.throw === 'scissors';
    case 'memoria':
      return typeof o.card === 'number' && Number.isInteger(o.card);
    case 'ahorcado':
      return (
        (typeof o.letter === 'string' && o.letter.length === 1) ||
        (typeof o.guess === 'string' && o.guess.length <= 200)
      );
    case 'wordle':
      return typeof o.attempt === 'string' && o.attempt.length <= 10;
    default:
      return false;
  }
}
