'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { cancelNightAction, chooseGameAction, proposeCandidateAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import { Poster } from '@/components/Poster';
import { filterPending, GAME_NAME, GAMES, isModularGame, type DrawFilters, type Game, type ModularGame } from '@/lib/movie-night';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { Candidates } from './Candidates';
import { SCREENS } from './games/registry';
import { FilterChips } from './FilterChips';
import type { Table } from './types';

const DESCRIPTION: Record<Exclude<Game, ModularGame>, string> = {
  ppt: 'Al mejor de 3. Cada uno elige en su celular y se revela a la vez.',
  memoria: 'Un tablero con pósters de lo que ya vieron. Por turnos: acertás, seguís.',
  ahorcado: 'Un título de la biblioteca, cada uno lo adivina por su lado. El primero que lo completa gana.',
  wordle: 'La misma palabra de cinco letras para los dos. Menos intentos gana.',
  tateti: 'El de siempre, por turnos. Si empatan tres veces, moneda.',
  dados: 'Cada uno tira dos dados. El número más alto se lleva la ronda, al mejor de 3.',
  trivia: 'Cinco preguntas sobre lo que ya vieron: años, directores, quién puso más estrellas.',
  mayormenor: 'Las mismas cartas para los dos: ¿la próxima es más alta o más baja? La racha más larga gana.',
  cuatro: 'Fichas que caen por columna. Cuatro seguidas, en cualquier dirección, ganan.',
  nim: 'Tres filas de fósforos. Sacás los que quieras de una fila; el que saca el último pierde.',
  cajas: 'Unir puntos para cerrar cuadrados. Cerrás uno, seguís. Más cuadrados gana.',
  carta: 'Doce cartas boca abajo, una está maldita. Por turnos: el que la da vuelta pierde.',
  taps: 'Diez segundos tocando la pantalla lo más rápido que puedas. Más toques gana.',
  numero: 'Cada uno elige un número del 1 al 100 a escondidas. Gana el más cercano al que sale.',
  simon: 'Una secuencia de colores que crece. El que la repite más larga gana.',
  naval: 'Tres barcos cada uno en una grilla de 6×6, puestos al azar. El primero que hunde todos gana.',
  poster: 'Un póster de la biblioteca que se va aclarando. El primero que adivina el título gana.',
  linea: 'Cinco pelis de la biblioteca: ordenalas por año. Más posiciones acertadas gana.',
  moneda: 'Sin jugar: cara o cruz.',
};

/**
 * The three phases before playing: waiting for the other person, each one
 * proposing a candidate, and choosing how to settle it if they did not agree.
 * Just for fun, the middle one is skipped.
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
          {night.state.casual
            ? 'Cuando abra Jugar en su celular entra directo. Ahí eligen a qué.'
            : 'Cuando abra Pendientes en su celular va a ver que la estás esperando. Pueden seguir cuando entre.'}
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

  // 'juego': they did not agree and something has to settle it, or they are
  // just here to play.
  const casual = night.state.casual;
  return (
    <>
      {!casual && <Candidates table={table} pending={pending} />}
      <p className={cn('text-center font-titulo text-3xl leading-tight text-tinta', !casual && 'mt-5')}>
        {casual ? '¿A qué jugamos?' : '¿Con qué se define?'}
      </p>
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
                  <span className="mt-1 block text-xs leading-relaxed text-tinta-suave">{reason ?? (isModularGame(game) ? SCREENS[game].description : DESCRIPTION[game])}</span>
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
        {isModularGame(game) && SCREENS[game].icon}
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
        {game === 'tateti' && (
          <>
            <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
            <path d="M4.5 4.5l3 3M7.5 4.5l-3 3" />
            <circle cx="18" cy="18" r="1.6" />
          </>
        )}
        {game === 'dados' && (
          <>
            <rect x="3" y="3" width="11" height="11" rx="2.5" />
            <circle cx="6.5" cy="6.5" r="0.9" fill="currentColor" />
            <circle cx="10.5" cy="10.5" r="0.9" fill="currentColor" />
            <path d="M14 10h4.5a2.5 2.5 0 0 1 2.5 2.5V18.5a2.5 2.5 0 0 1-2.5 2.5H12.5a2.5 2.5 0 0 1-2.5-2.5V14" />
            <circle cx="16" cy="16" r="0.9" fill="currentColor" />
          </>
        )}
        {game === 'trivia' && (
          <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M9.6 9.5a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1 .9-1 1.6v.4" />
            <circle cx="12" cy="16.6" r="0.7" fill="currentColor" />
          </>
        )}
        {game === 'mayormenor' && (
          <>
            <rect x="4" y="5" width="9" height="13" rx="1.8" />
            <path d="M13 7.5l4.5-1.2a1.5 1.5 0 0 1 1.8 1.1l2.2 8.6a1.5 1.5 0 0 1-1.1 1.8L17 19" />
            <path d="M8.5 9.5v4M6.5 11.5h4" />
          </>
        )}
        {game === 'cuatro' && (
          <>
            <rect x="3" y="5" width="18" height="15" rx="2" />
            <circle cx="7.5" cy="16" r="1.4" fill="currentColor" />
            <circle cx="12" cy="16" r="1.4" fill="currentColor" />
            <circle cx="16.5" cy="16" r="1.4" fill="currentColor" />
            <circle cx="7.5" cy="11" r="1.4" />
            <circle cx="12" cy="11" r="1.4" />
          </>
        )}
        {game === 'nim' && (
          <>
            <path d="M6 20V8M10 20V8M14 20V8M18 20V8" />
            <circle cx="6" cy="6" r="1.4" fill="currentColor" />
            <circle cx="10" cy="6" r="1.4" fill="currentColor" />
            <circle cx="14" cy="6" r="1.4" fill="currentColor" />
            <circle cx="18" cy="6" r="1.4" fill="currentColor" />
          </>
        )}
        {game === 'cajas' && (
          <>
            <circle cx="5" cy="5" r="1.2" fill="currentColor" />
            <circle cx="12" cy="5" r="1.2" fill="currentColor" />
            <circle cx="19" cy="5" r="1.2" fill="currentColor" />
            <circle cx="5" cy="12" r="1.2" fill="currentColor" />
            <circle cx="12" cy="12" r="1.2" fill="currentColor" />
            <circle cx="19" cy="12" r="1.2" fill="currentColor" />
            <circle cx="5" cy="19" r="1.2" fill="currentColor" />
            <circle cx="12" cy="19" r="1.2" fill="currentColor" />
            <circle cx="19" cy="19" r="1.2" fill="currentColor" />
            <path d="M5 5h7v7H5zM12 12h7" />
          </>
        )}
        {game === 'carta' && (
          <>
            <rect x="7" y="3" width="10" height="15" rx="1.8" />
            <path d="M4 7v12.5a1.5 1.5 0 0 0 1.5 1.5H16" />
            <path d="M12 7.5c-1.5-1.8-4 0-2.2 2.2L12 12l2.2-2.3c1.8-2.2-.7-4-2.2-2.2z" fill="currentColor" stroke="none" />
          </>
        )}
        {game === 'taps' && (
          <>
            <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11M12 10V9a1.5 1.5 0 0 1 3 0v3M15 11.5a1.5 1.5 0 0 1 3 0V15a5 5 0 0 1-5 5h-1a5 5 0 0 1-4.3-2.4L5.5 14a1.4 1.4 0 0 1 2.3-1.6L9 14" />
            <path d="M6.5 5.5l-2-2M16.5 4.5l1.5-2M11 3V1" />
          </>
        )}
        {game === 'numero' && (
          <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M9 15V9l-1.5 1.2M13.5 9h3l-2.2 2.6a1.7 1.7 0 1 1-1.3 3" />
          </>
        )}
        {game === 'simon' && (
          <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 3.5v17M3.5 12h17" />
            <path d="M12 12L6 6a8.5 8.5 0 0 1 6-2.5z" fill="currentColor" stroke="none" />
          </>
        )}
        {game === 'naval' && (
          <>
            <path d="M3 15h18l-2.5 4H5.5z" />
            <path d="M7 15v-4h7l3 4M10 11V7h3v4" />
            <path d="M3 20c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0" />
          </>
        )}
        {game === 'poster' && (
          <>
            <rect x="5" y="3" width="14" height="18" rx="1.5" />
            <rect x="8" y="6" width="3" height="3" fill="currentColor" stroke="none" opacity="0.4" />
            <rect x="13" y="6" width="3" height="3" fill="currentColor" stroke="none" opacity="0.7" />
            <rect x="8" y="11" width="3" height="3" fill="currentColor" stroke="none" opacity="0.9" />
            <rect x="13" y="11" width="3" height="3" fill="currentColor" stroke="none" opacity="0.3" />
            <path d="M8 17.5h8" />
          </>
        )}
        {game === 'linea' && (
          <>
            <path d="M3 12h18" />
            <circle cx="6" cy="12" r="1.8" fill="currentColor" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="18" cy="12" r="1.8" fill="currentColor" />
            <path d="M6 7v3M12 14v3M18 7v3" />
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
