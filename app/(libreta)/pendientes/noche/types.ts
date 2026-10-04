import type { NightResponse } from '@/app/acciones';
import type { ModularMove, PublicNight } from '@/lib/movie-night';
import type { Persona } from '@/lib/personas';

/**
 * Sends an action to the server and adopts the row that comes back. Resolves
 * with the error message when the rules rejected the move (and shows it as a
 * toast unless `quiet`, for screens that display it inline), or null when it went through.
 */
export type Send = (
  action: () => Promise<NightResponse>,
  options?: { quiet?: boolean },
) => Promise<string | null>;

/** What every screen of the session needs: the row, the two people and how to move. */
export type Table = {
  night: PublicNight;
  me: Persona;
  other: Persona;
  /** In session order: the one who opened it first. */
  players: [string, string];
  send: Send;
  /**
   * Plays a move of a modular game. Modular screens use this instead of
   * `send(() => playAction(...))`, so the simulator can run them locally.
   */
  play: (move: ModularMove, options?: { quiet?: boolean }) => Promise<string | null>;
  busy: boolean;
};

/** The person behind an id, to paint with their color. */
export const personOf = (table: Pick<Table, 'me' | 'other'>, id: string | null | undefined) =>
  id === table.me.id ? table.me : id === table.other.id ? table.other : null;

/** "vos" or the name, depending on who. */
export const nameOf = (table: Pick<Table, 'me' | 'other'>, id: string | null | undefined) =>
  id === table.me.id ? 'vos' : (personOf(table, id)?.nombre ?? 'alguien');
