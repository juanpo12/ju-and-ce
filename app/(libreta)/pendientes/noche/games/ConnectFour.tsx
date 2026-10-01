'use client';

import { motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import type { ConnectFourMatch } from '@/lib/movie-night';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

/**
 * Connect four on one shared board. Tap a column and the piece drops to the
 * lowest free hole, in the color of whoever played it.
 */
export function ConnectFour({
  table,
  match,
  pending,
}: {
  table: Table;
  match: ConnectFourMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const myTurn = match.turn === me.id;
  const whose = personOf(table, match.turn);
  const columnFull = (col: number) => Boolean(match.cells[col]);

  return (
    <section>
      <GameHeader table={table} pending={pending} name="Cuatro en línea" detail="Cuatro seguidas, en cualquier dirección." />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-tinta-suave">
          <span className="flex items-center gap-1"><Avatar persona={me} medida="chico" /> vos</span>
          <span className="flex items-center gap-1"><Avatar persona={other} medida="chico" /> {other.nombre}</span>
        </div>
        <p
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={whose ? { backgroundColor: varColor(whose.color), color: 'var(--sobre-persona)' } : undefined}
          aria-live="polite"
        >
          {myTurn ? 'Te toca' : `Le toca a ${other.nombre}`}
        </p>
      </div>

      <div className="mx-auto w-full max-w-sm rounded-tema bg-acento-suave p-2 shadow-baja">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${match.cols}, minmax(0, 1fr))` }}
          role="grid"
          aria-label="Tablero"
        >
          {Array.from({ length: match.cols }, (_, col) => (
            <button
              key={col}
              type="button"
              disabled={!myTurn || busy || columnFull(col)}
              onClick={() => send(() => playAction(night.id, { game: 'cuatro', col }))}
              aria-label={`Columna ${col + 1}${columnFull(col) ? ', llena' : ''}`}
              className={cn(
                'foco flex flex-col gap-1 rounded-[calc(var(--radio)-6px)] p-0.5 transition-colors disabled:cursor-default',
                myTurn && !busy && !columnFull(col) && 'hover:bg-acento/15',
              )}
            >
              {Array.from({ length: match.rows }, (_, row) => {
                const index = row * match.cols + col;
                const owner = personOf(table, match.cells[index]);
                const inLine = match.line?.includes(index);
                return (
                  <span
                    key={row}
                    className={cn(
                      'relative flex aspect-square w-full items-center justify-center rounded-full bg-superficie shadow-[inset_0_1px_3px_rgb(0_0_0/0.12)]',
                      inLine && 'ring-[3px] ring-tinta',
                    )}
                  >
                    {owner && (
                      <motion.span
                        aria-label={owner.nombre}
                        initial={{ y: -(row + 1) * 40, opacity: 0.6 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: 'spring', bounce: 0.35, duration: 0.55 }}
                        className="block size-[84%] rounded-full shadow-baja"
                        style={{ backgroundColor: varColor(owner.color) }}
                      />
                    )}
                  </span>
                );
              })}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
