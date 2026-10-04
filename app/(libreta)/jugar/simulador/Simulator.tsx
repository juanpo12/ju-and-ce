'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Boton } from '@/components/Boton';
import { Avatar } from '@/components/Avatar';
import { GAME_NAME, MODULAR_GAMES, type ModularGame, type ModularMatch, type PublicNight } from '@/lib/movie-night';
import { MODULES } from '@/lib/games/modules';
import { GameError } from '@/lib/games/error';
import { seededRng } from '@/lib/games/random';
import type { Persona } from '@/lib/personas';
import { cn } from '@/lib/utils';
import { SCREENS } from '../../pendientes/noche/games/registry';
import { PrivateViewOverride } from '../../pendientes/noche/games/usePrivateView';
import type { Table } from '../../pendientes/noche/types';

type Run = {
  match: ModularMatch;
  secret: unknown;
  version: number;
  winner?: string | null;
};

const rng = seededRng(Date.now() % 2 ** 31);

function start(game: ModularGame, me: Persona, other: Persona): Run | string {
  const players: [string, string] = [me.id, other.id];
  try {
    const r = MODULES[game].start(
      { players, starter: other.id, cards: [], titles: [], library: [], names: { [me.id]: me.nombre, [other.id]: other.nombre } },
      rng,
      Date.now(),
    );
    return { match: r.match, secret: r.secret, version: 1, winner: r.end ? r.end.winnerId : undefined };
  } catch (e) {
    return e instanceof Error ? e.message : 'No arrancó';
  }
}

/**
 * Both seats on one phone: the screen of the chosen game, a switch to sit on
 * the other side, and the module applied locally on every move.
 */
export function Simulator({ me, other, initialGame }: { me: Persona; other: Persona; initialGame: ModularGame | null }) {
  const router = useRouter();
  const [game, setGame] = useState<ModularGame | null>(initialGame);
  const [seat, setSeat] = useState<'me' | 'other'>('me');
  const [follow, setFollow] = useState(true);
  // Dealt in the browser only: dealing during the server render too would
  // shuffle twice and the two would not match.
  const [run, setRun] = useState<Run | string | null>(null);
  useEffect(() => {
    if (initialGame) setRun(start(initialGame, me, other));
    // Only the first deal; later ones come from `choose`.
  }, []);

  const players: [string, string] = [me.id, other.id];
  const sitting = seat === 'me' ? me : other;
  const facing = seat === 'me' ? other : me;

  function choose(g: ModularGame) {
    setGame(g);
    setSeat('me');
    setRun(start(g, me, other));
    router.replace(`/jugar/simulador?juego=${g}`);
  }

  const table: Table | null = useMemo(() => {
    if (!game || !run || typeof run === 'string') return null;
    const night = {
      id: 'simulator',
      spaceId: 'simulator',
      mode: 'duo',
      phase: run.winner === undefined ? 'jugando' : 'terminada',
      game,
      createdBy: me.id,
      winnerId: run.winner ?? null,
      entryId: null,
      state: { present: players, casual: true, match: run.match },
      version: run.version,
      createdAt: new Date(),
      updatedAt: new Date(),
      finishedAt: null,
    } as PublicNight;

    return {
      night,
      me: sitting,
      other: facing,
      players,
      busy: false,
      send: async () => {
        toast('En el simulador eso no hace nada.');
        return null;
      },
      play: async (move, options) => {
        if (run.winner !== undefined) return 'La partida ya terminó.';
        try {
          const r = MODULES[game].apply({ match: run.match, secret: run.secret, me: sitting.id, move, players, rng, now: Date.now() });
          setRun({ match: r.match as ModularMatch, secret: r.secret, version: run.version + 1, winner: r.end ? r.end.winnerId : undefined });
          if (follow && !r.end) {
            // Turn-based games say whose turn it is (extra turns included);
            // otherwise hand the phone to the other seat.
            const turn = (r.match as { turn?: unknown }).turn;
            if (turn === me.id || turn === other.id) setSeat(turn === me.id ? 'me' : 'other');
            else setSeat((s) => (s === 'me' ? 'other' : 'me'));
          }
          return null;
        } catch (e) {
          const message = e instanceof GameError ? e.message : 'Algo falló.';
          if (!(e instanceof GameError)) console.error('[simulator]', e);
          if (!options?.quiet) toast(message);
          return message;
        }
      },
    };
    // `players` is rebuilt every render, but only from these stable ids.
  }, [game, run, sitting, facing, follow, me.id, other.id]);

  const view = useMemo(() => {
    if (!game || !run || typeof run === 'string') return null;
    return { value: MODULES[game].privateView?.({ match: run.match, secret: run.secret, me: sitting.id }) ?? null };
  }, [game, run, sitting.id]);

  const Screen = game ? SCREENS[game].Component : null;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-titulo text-4xl leading-none text-tinta">Simulador</h1>
        <p className="mt-1 text-sm text-tinta-suave">Los dos lugares en un celular, sin servidor. Solo para probar.</p>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {MODULAR_GAMES.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => choose(g)}
            className={cn(
              'foco rounded-full border border-borde px-2.5 py-1 text-xs',
              g === game ? 'bg-acento text-sobre-acento' : 'text-tinta-suave',
            )}
          >
            {GAME_NAME[g]}
          </button>
        ))}
      </div>

      {game && (
        <div className="tarjeta flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
          <span className="flex items-center gap-1.5">
            <Avatar persona={sitting} medida="chico" /> Jugando como <strong>{sitting.nombre}</strong>
          </span>
          <Boton variante="secundario" className="h-8 px-3 text-xs" onClick={() => setSeat((s) => (s === 'me' ? 'other' : 'me'))}>
            Cambiar de lugar
          </Boton>
          <label className="flex items-center gap-1.5 text-xs text-tinta-suave">
            <input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} />
            Cambiar solo después de cada jugada
          </label>
          <Boton variante="fantasma" className="ml-auto h-8 px-3 text-xs" onClick={() => choose(game)}>
            Reiniciar
          </Boton>
        </div>
      )}

      {typeof run === 'string' && <p className="text-sm text-acento">{run}</p>}

      {table && run && typeof run !== 'string' && run.winner !== undefined && (
        <p className="tarjeta px-4 py-3 text-center font-titulo text-2xl text-tinta">
          {run.winner === null ? 'Empate: lo definiría la moneda' : `Ganó ${run.winner === me.id ? me.nombre : other.nombre}`}
        </p>
      )}

      {Screen && table && (
        <PrivateViewOverride.Provider value={view}>
          {/* Keyed by seat: each seat is its own phone, with its own local state. */}
          <Screen key={sitting.id} table={table} match={table.night.state.match as never} pending={[]} />
        </PrivateViewOverride.Provider>
      )}
    </div>
  );
}
