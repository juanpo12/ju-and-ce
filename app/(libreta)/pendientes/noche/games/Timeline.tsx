'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import { Poster } from '@/components/Poster';
import type { TimelineMatch } from '@/lib/movie-night';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import type { Table } from '../types';

/**
 * Five movies from the library, to order from oldest to newest. Tapping a
 * tile sends it to the next free spot in the row; tapping it there brings it
 * back. Both order on their own, then the years come out.
 */
export function Timeline({
  table,
  match,
  pending,
}: {
  table: Table;
  match: TimelineMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const sent = match.orders[me.id];
  const theirsSent = Boolean(match.orders[other.id]);
  const [order, setOrder] = useState<number[]>([]);
  const shown = sent ?? order;
  const complete = shown.length === match.items.length;
  const revealed = match.years !== undefined;

  function place(i: number) {
    if (sent) return;
    setOrder((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));
  }

  function submit() {
    if (!complete || busy || sent) return;
    void send(() => playAction(night.id, { game: 'linea', order }));
  }

  const tile = (i: number, position?: number) => {
    const item = match.items[i]!;
    const year = match.years?.[i];
    const rightSpot = revealed && position !== undefined && match.correct?.[position] === i;
    return (
      <motion.button
        layout
        layoutId={`timeline-${i}`}
        key={i}
        type="button"
        disabled={Boolean(sent) || busy}
        onClick={() => place(i)}
        aria-label={position === undefined ? `Poner ${item.title}` : `Sacar ${item.title} del lugar ${position + 1}`}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'foco relative flex w-full flex-col gap-1 text-left disabled:cursor-default',
          revealed && position !== undefined && !rightSpot && 'opacity-60',
        )}
      >
        <span
          className={cn(
            'block w-full overflow-hidden rounded-[calc(var(--radio)-4px)] shadow-baja',
            rightSpot && 'ring-[3px] ring-acento',
          )}
        >
          <Poster path={item.posterPath} titulo={item.title} tamano="chico" />
        </span>
        <span className="line-clamp-2 text-[0.65rem] leading-tight text-tinta">{item.title}</span>
        {position !== undefined && (
          <span className="absolute left-1 top-1 flex size-6 items-center justify-center rounded-full bg-acento font-cartel text-sm text-sobre-acento shadow-baja">
            {position + 1}
          </span>
        )}
        {year !== undefined && (
          <span className="absolute bottom-7 right-1 rounded-full bg-superficie px-1.5 font-cartel text-sm text-tinta shadow-baja">
            {year}
          </span>
        )}
      </motion.button>
    );
  };

  return (
    <section>
      <GameHeader table={table} pending={pending} name="Línea de tiempo" detail="De la más vieja a la más nueva. Más posiciones acertadas gana." />

      {/* The ordered row: five slots. */}
      <div className="tarjeta p-3">
        <p className="mb-2 flex items-center justify-between text-xs text-tinta-suave">
          <span>Más vieja →</span>
          <span>→ más nueva</span>
        </p>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: match.items.length }, (_, k) => {
            const i = shown[k];
            return (
              <div key={k} className="min-h-24">
                {i === undefined ? (
                  <span className="flex aspect-[2/3] w-full items-center justify-center rounded-[calc(var(--radio)-4px)] border border-dashed border-borde font-cartel text-lg text-tinta-suave">
                    {k + 1}
                  </span>
                ) : (
                  tile(i, k)
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* The ones still to place. */}
      {!sent && (
        <div className="mt-3 grid grid-cols-5 gap-2" aria-label="Pelis por ordenar">
          <AnimatePresence>
            {match.items.map((_, i) => (order.includes(i) ? null : tile(i)))}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-4 flex min-h-12 flex-col items-center justify-center gap-2 text-center" aria-live="polite">
        {sent ? (
          <p className="flex items-center gap-1.5 text-sm text-tinta-suave">
            <Avatar persona={other} medida="chico" vacio={!theirsSent} />
            {revealed ? 'Esos son los años.' : theirsSent ? 'Ya ordenaron los dos…' : `Esperando a ${other.nombre}…`}
          </p>
        ) : (
          <>
            <p className="text-xs text-tinta-suave">
              {complete ? 'Si estás conforme, mandalo.' : 'Tocá las pelis en orden. Tocá una puesta para sacarla.'}
            </p>
            <Boton onClick={submit} disabled={!complete || busy} className="h-11 px-6">
              Listo
            </Boton>
          </>
        )}
      </div>
    </section>
  );
}
