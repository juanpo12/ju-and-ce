'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { clearPickedAction, createNightAction } from '@/app/acciones';
import { Boton, BotonLink } from '@/components/Boton';
import { Poster } from '@/components/Poster';
import { Avatar } from '@/components/Avatar';
import { AT_GAME } from '@/lib/movie-night';
import { varColor } from '@/lib/personas';
import type { Pendiente } from '@/db/queries';
import { Coin, COIN_DURATION_MS } from './Coin';
import { Candidates } from './Candidates';
import { personOf, nameOf, type Table } from './types';

/**
 * The ending: the winning movie in the winner's color (just the winner, when
 * they played for fun), or "coincidieron", or "cerró la sesión". If the coin settled it (because they chose it or because
 * the game tied), it is seen falling first.
 */
export function Outcome({ table, pending }: { table: Table; pending: Pendiente[] }) {
  const router = useRouter();
  const { night, me, other, send, busy } = table;
  const casual = Boolean(night.state.casual);
  const [clearing, start] = useTransition();

  const byCoin = night.game === 'moneda' || Boolean(night.state.tiebreak);
  const [falling, setFalling] = useState(byCoin);
  useEffect(() => {
    if (!byCoin) return;
    const id = setTimeout(() => setFalling(false), COIN_DURATION_MS + 400);
    return () => clearTimeout(id);
  }, [byCoin]);

  if (night.phase === 'cancelada') {
    const who = night.state.closedBy;
    return (
      <section className="tarjeta flex flex-col items-center gap-3 px-6 py-10 text-center">
        <p className="font-titulo text-3xl leading-tight text-tinta">
          {who === me.id ? 'Cerraste la sesión' : `${nameOf(table, who)} cerró la sesión`}
        </p>
        <p className="max-w-xs text-sm text-tinta-suave">No pasa nada: se puede abrir otra cuando quieran.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Boton onClick={() => send(() => createNightAction(casual))} disabled={busy}>
            Abrir otra
          </Boton>
          <BotonLink href={casual ? '/' : '/pendientes'} variante="secundario">
            {casual ? 'Volver a la biblioteca' : 'Volver a pendientes'}
          </BotonLink>
        </div>
      </section>
    );
  }

  const winner = personOf(table, night.winnerId);
  const movie = pending.find((p) => p.id === night.entryId) ?? null;

  if (falling && winner) {
    return (
      <section className="flex flex-col items-center gap-2 py-6 text-center">
        <p className="font-titulo text-3xl text-tinta">
          {night.state.tiebreak ? 'Empataron: lo define la moneda' : 'Cara o cruz'}
        </p>
        <Coin heads={table.players[0] === me.id ? me : other} tails={table.players[0] === me.id ? other : me} result={winner.id} />
      </section>
    );
  }

  function clear() {
    start(async () => {
      await clearPickedAction();
      router.refresh();
    });
  }

  const title = !winner
    ? '¡Coincidieron!'
    : winner.id === me.id
      ? '¡Ganaste!'
      : `Ganó ${winner.nombre}`;
  const surrendered = night.state.surrenderedBy;
  const detail = !winner
    ? 'Los dos propusieron la misma. No hubo nada que definir.'
    : surrendered
      ? `${surrendered === me.id ? 'Te rendiste' : `${nameOf(table, surrendered)} se rindió`}${night.game ? ` ${AT_GAME[night.game]}` : ''}.`
      : [
          night.game ? `${winner.id === me.id ? 'Ganaste' : 'Ganó'} ${AT_GAME[night.game]}` : null,
          night.state.tiebreak ? 'después de empatar: lo definió la moneda' : null,
        ]
          .filter(Boolean)
          .join(', ');

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.35, duration: 0.6 }}
      className="overflow-hidden rounded-tema bg-acento text-sobre-acento shadow-alta"
      style={winner ? { backgroundColor: varColor(winner.color), color: 'var(--sobre-persona)' } : undefined}
    >
      <div className="flex flex-col items-center gap-3 px-6 pt-8 text-center">
        {winner && <Avatar persona={winner} medida="grande" className="ring-4 ring-sobre-persona/50" />}
        <p className="font-titulo text-5xl leading-none">{title}</p>
        <p className="max-w-sm text-sm opacity-90">{detail}</p>
      </div>

      {casual ? (
        <div className="mt-6 flex flex-wrap justify-center gap-2 bg-superficie/15 px-6 py-4">
          <Boton onClick={() => send(() => createNightAction(true))} disabled={busy} className="bg-superficie text-tinta">
            Revancha
          </Boton>
          <BotonLink href="/" variante="fantasma" className="text-current opacity-85 hover:text-current hover:opacity-100">
            Volver a la biblioteca
          </BotonLink>
        </div>
      ) : (
        <MovieOfTheNight table={table} pending={pending} movie={movie} clear={clear} clearing={clearing} />
      )}
    </motion.section>
  );
}

/** The non-casual ending: what they are watching, and the way to pick again. */
function MovieOfTheNight({
  table,
  pending,
  movie,
  clear,
  clearing,
}: {
  table: Table;
  pending: Pendiente[];
  movie: Pendiente | null;
  clear: () => void;
  clearing: boolean;
}) {
  const { night } = table;
  return (
    <>
      <div className="flex flex-col items-center gap-3 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-85">La de esta noche</p>
        {movie ? (
          <Link href={`/peli/${movie.id}`} className="foco tocable w-36 overflow-hidden rounded-tema shadow-alta sm:w-44">
            <Poster path={movie.posterPath} titulo={movie.titulo} anio={movie.anio} tamano="grilla" prioridad />
          </Link>
        ) : (
          <p className="text-sm opacity-85">Una que ya no está en pendientes.</p>
        )}
        {movie && <p className="font-titulo text-3xl leading-tight">{movie.titulo}</p>}
      </div>

      {night.game && night.game !== 'moneda' && (
        <div className="px-6 pb-4 opacity-90">
          <Candidates table={table} pending={pending} small winner={night.winnerId} />
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 bg-superficie/15 px-6 py-4">
        <BotonLink href="/pendientes" className="bg-superficie text-tinta">
          Ir a pendientes
        </BotonLink>
        <Boton variante="fantasma" onClick={clear} disabled={clearing} className="text-current opacity-85 hover:text-current hover:opacity-100">
          Elegir otra
        </Boton>
      </div>
    </>
  );
}
