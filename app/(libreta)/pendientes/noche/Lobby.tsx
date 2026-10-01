'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { cancelNightAction, chooseGameAction, proposeCandidateAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import { Poster } from '@/components/Poster';
import { filterPending, GAME_NAME, GAMES, type DrawFilters, type Game } from '@/lib/movie-night';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { Candidates } from './Candidates';
import { FilterChips } from './FilterChips';
import type { Table } from './types';

const DESCRIPTION: Record<Game, string> = {
  ppt: 'Al mejor de 3. Cada uno elige en su celular y se revela a la vez.',
  memoria: 'Un tablero con pósters de lo que ya vieron. Por turnos: acertás, seguís.',
  ahorcado: 'Un título de la biblioteca. Una letra por turno, o arriesgá.',
  wordle: 'La misma palabra de cinco letras para los dos. Menos intentos gana.',
  moneda: 'Sin jugar: cara o cruz.',
};

/**
 * The three phases before playing: waiting for the other person, each one
 * proposing a candidate, and choosing how to settle it if they did not agree.
 */
export function Lobby({
  table,
  pending,
  availability,
}: {
  table: Table;
  pending: Pendiente[];
  availability: Record<Game, string | null>;
}) {
  const { night, other, send, busy } = table;

  const cancel = (
    <div className="mt-6 flex justify-center">
      <Boton variante="fantasma" onClick={() => send(() => cancelNightAction(night.id))} disabled={busy}>
        Cerrar la sesión
      </Boton>
    </div>
  );

  if (night.phase === 'esperando') {
    return (
      <section className="tarjeta flex flex-col items-center gap-4 px-6 py-10 text-center">
        <span className="relative flex">
          <Avatar persona={other} medida="grande" vacio className="size-16 text-2xl" />
          <span aria-hidden className="absolute -inset-2 animate-ping rounded-full border-2 border-acento opacity-50" />
        </span>
        <p className="font-titulo text-3xl leading-tight text-tinta">Esperando a {other.nombre}…</p>
        <p className="max-w-xs text-sm leading-relaxed text-tinta-suave">
          Cuando abra Pendientes en su celular va a ver que la estás esperando. Pueden seguir cuando entre.
        </p>
        {cancel}
      </section>
    );
  }

  if (night.phase === 'candidatas') {
    return (
      <>
        <Propose table={table} pending={pending} />
        {cancel}
      </>
    );
  }

  // 'juego': they did not agree, something has to settle it.
  return (
    <>
      <Candidates table={table} pending={pending} />
      <p className="mt-5 text-center font-titulo text-3xl leading-tight text-tinta">¿Con qué se define?</p>
      <p className="mb-4 mt-1 text-center text-sm text-tinta-suave">
        El primero que toca elige. Si es por turnos, empieza el otro.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {GAMES.map((game) => {
          const reason = availability[game];
          return (
            <li key={game}>
              <button
                type="button"
                disabled={Boolean(reason) || busy}
                onClick={() => send(() => chooseGameAction(night.id, game))}
                className="foco tocable tarjeta flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-acento-suave disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-superficie"
              >
                <GameIcon game={game} />
                <span className="min-w-0 flex-1">
                  <span className="block font-titulo text-2xl leading-none text-tinta">{GAME_NAME[game]}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-tinta-suave">{reason ?? DESCRIPTION[game]}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {cancel}
    </>
  );
}

/** Each one proposes theirs: from the list, or let the die pick. */
function Propose({ table, pending }: { table: Table; pending: Pendiente[] }) {
  const { night, me, other, send, busy } = table;
  const candidates = night.state.candidates ?? {};
  const mine = candidates[me.id];
  const theirs = candidates[other.id];
  const [filters, setFilters] = useState<DrawFilters>({});
  const [mode, setMode] = useState<'list' | 'random'>('list');
  const possible = filterPending(pending, filters);
  const eligible = pending.filter((p) => !p.pickedAt);

  if (mine) {
    const movie = pending.find((p) => p.id === mine.entryId);
    return (
      <section className="tarjeta flex flex-col items-center gap-3 px-6 py-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tinta-suave">Tu candidata</p>
        {movie && (
          <div className="w-28 overflow-hidden rounded-tema shadow-alta">
            <Poster path={movie.posterPath} titulo={movie.titulo} anio={movie.anio} tamano="chico" />
          </div>
        )}
        <p className="font-titulo text-3xl leading-tight text-tinta">{movie?.titulo ?? 'Una que ya no está'}</p>
        <p className="flex items-center justify-center gap-1.5 text-sm text-tinta-suave">
          <Avatar persona={other} medida="chico" vacio={!theirs} />
          {theirs ? `${other.nombre} ya eligió. Un momento…` : `Esperando a que ${other.nombre} elija la suya…`}
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="text-center">
        <p className="font-titulo text-3xl leading-tight text-tinta">¿Cuál proponés?</p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-tinta-suave">
          <Avatar persona={other} medida="chico" vacio={!theirs} />
          {theirs ? `${other.nombre} ya eligió la suya` : `${other.nombre} también está eligiendo`}
        </p>
      </div>

      <div className="mx-auto flex rounded-full border border-borde bg-superficie p-1">
        {(['list', 'random'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              'foco rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              mode === m ? 'bg-acento text-sobre-acento' : 'text-tinta-suave',
            )}
          >
            {m === 'list' ? 'Elijo yo' : 'Al azar'}
          </button>
        ))}
      </div>

      {mode === 'random' ? (
        <div className="tarjeta flex flex-col items-center gap-4 p-4">
          <FilterChips pending={pending} filters={filters} onChange={setFilters} />
          <p className="text-sm text-tinta-suave">
            {possible.length === 0 ? 'No queda ninguna con esos filtros.' : `${possible.length} candidatas`}
          </p>
          <Boton
            disabled={busy || possible.length === 0}
            onClick={() => send(() => proposeCandidateAction(night.id, { how: 'random', filters }))}
            className="h-11 px-6"
          >
            Que elija el dado
          </Boton>
        </div>
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {eligible.map((p, i) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 12) * 0.03 }}
            >
              <button
                type="button"
                disabled={busy}
                onClick={() => send(() => proposeCandidateAction(night.id, { how: 'picked', entryId: p.id }))}
                className="foco tocable group flex w-full flex-col gap-1 text-left disabled:opacity-60"
                aria-label={`Proponer ${p.titulo}`}
              >
                <span className="block w-full overflow-hidden rounded-tema shadow-baja ring-acento transition-shadow group-hover:ring-[3px]">
                  <Poster path={p.posterPath} titulo={p.titulo} anio={p.anio} tamano="grilla" />
                </span>
                <span className="line-clamp-2 text-xs leading-tight text-tinta">{p.titulo}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}

function GameIcon({ game }: { game: Game }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-acento-suave text-acento">
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {game === 'ppt' && (
          <>
            <path d="M7 11V7.5a1.5 1.5 0 0 1 3 0V11M10 10V5.5a1.5 1.5 0 0 1 3 0V11M13 10.5V6.5a1.5 1.5 0 0 1 3 0V12" />
            <path d="M16 12v1.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5v-1.8a1.5 1.5 0 0 1 3 0" />
          </>
        )}
        {game === 'memoria' && (
          <>
            <rect x="3.5" y="5" width="7" height="10" rx="1.5" />
            <rect x="13.5" y="9" width="7" height="10" rx="1.5" />
            <path d="M7 8.5v3M5.5 10h3" />
          </>
        )}
        {game === 'ahorcado' && (
          <>
            <path d="M5 20V4h9M14 4v3" />
            <circle cx="14" cy="9.5" r="2.2" />
            <path d="M14 11.7v4.3M14 13l-2.5 2M14 13l2.5 2M14 16l-2 3M14 16l2 3" />
          </>
        )}
        {game === 'wordle' && (
          <>
            <rect x="3" y="3" width="5" height="5" rx="1" />
            <rect x="9.5" y="3" width="5" height="5" rx="1" />
            <rect x="16" y="3" width="5" height="5" rx="1" />
            <rect x="3" y="9.5" width="5" height="5" rx="1" fill="currentColor" />
            <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
            <rect x="16" y="9.5" width="5" height="5" rx="1" />
            <rect x="3" y="16" width="5" height="5" rx="1" />
            <rect x="9.5" y="16" width="5" height="5" rx="1" fill="currentColor" />
            <rect x="16" y="16" width="5" height="5" rx="1" />
          </>
        )}
        {game === 'moneda' && (
          <>
            <circle cx="12" cy="12" r="8.5" />
            <circle cx="12" cy="12" r="5" />
            <path d="M12 9.5v5" />
          </>
        )}
      </svg>
    </span>
  );
}
