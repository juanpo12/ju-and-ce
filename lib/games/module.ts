import type { ModularGame } from '@/lib/movie-night';
import type { Rng } from './random';
import type { Availability, MatchContext } from './index';

export type Players = [string, string];

/** `winnerId: null` is a tie: the coin settles it. */
export type Outcome = { winnerId: string | null };

/**
 * Everything a modular game needs to be played, in one object. The server
 * calls it; nothing here runs in the browser except the types.
 *
 * - `match` is public: it travels to both phones. Never put in it what the
 *   other person must not see (a throw before the reveal, a hidden die).
 * - `secret` stays on the server. What one player may see of it (their own
 *   dice, the word they draw) goes through `privateView`.
 * - Rule violations throw `GameError` with a message in Spanish for the UI.
 */
export type GameModule<M extends { game: ModularGame }, Mv extends { game: ModularGame }, S = null> = {
  start(ctx: MatchContext, rng: Rng, now: number): { match: M; secret: S; end?: { winnerId: string } };
  apply(args: {
    match: M;
    secret: S;
    me: string;
    move: Mv;
    players: Players;
    rng: Rng;
    now: number;
  }): { match: M; secret: S; end?: Outcome };
  /** Whether what arrived from the browser has the shape of a move (`game` is already checked). */
  isValidMove(move: Record<string, unknown>): boolean;
  /** What only `me` may see right now, or null. Fetched with `privateViewAction`. */
  privateView?(args: { match: M; secret: S; me: string }): unknown;
  /** Why the game cannot be played today (a message for the UI), or null. */
  whyUnavailable?(ctx: Availability): string | null;
};

// biome-ignore lint: the registry holds modules of every shape.
export type AnyGameModule = GameModule<any, any, any>;
