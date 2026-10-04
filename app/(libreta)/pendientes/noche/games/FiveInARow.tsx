'use client';

import { motion } from 'motion/react';
import { Avatar } from '@/components/Avatar';
import { CINCO_LENGTH, type CincoMatch } from '@/lib/games/cinco';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

export const meta = {
  description: 'Una piedra por turno en un tablero grande. Cinco seguidas, en cualquier dirección, ganan.',
  icon: (
    <>
      <path d="M3 6h18M3 12h18M3 18h18M6 3v18M12 3v18M18 3v18" opacity="0.5" />
      <circle cx="6" cy="18" r="1.8" fill="currentColor" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="18" cy="6" r="1.8" fill="currentColor" />
    </>
  ),
};

/**
 * Gomoku on a go-like board: stones sit on the intersections. The last stone
 * is ringed so the other can see what changed; the winning five glow.
 */
export function FiveInARow({ table, match, pending }: { table: Table; match: CincoMatch; pending: Pendiente[] }) {
  const { me, other, play, busy } = table;
  const myTurn = match.turn === me.id && !match.line;
  // Once someone made five, the badge is theirs, not the (already passed) turn's.
  const whose = personOf(table, match.line ? match.cells[match.last ?? -1] : match.turn);
  const line = new Set(match.line ?? []);
  const n = match.size;

  return (
    <section>
      <GameHeader table={table} pending={pending} name="Cinco en línea" detail={`${CINCO_LENGTH} seguidas, en cualquier dirección.`} />

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-tinta-suave">
          <span className="flex items-center gap-1"><Avatar persona={me} medida="chico" /> vos</span>
          <span className="flex items-center gap-1"><Avatar persona={other} medida="chico" /> {other.nombre}</span>
        </div>
        <p
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={whose ? { backgroundColor: varColor(whose.color), color: 'var(--sobre-persona)' } : undefined}
          aria-live="polite"
        >
          {match.line ? (whose?.id === me.id ? '¡Hiciste cinco!' : `¡Cinco de ${other.nombre}!`) : myTurn ? 'Te toca' : `Le toca a ${other.nombre}`}
        </p>
      </div>

      <div className="mx-auto w-full max-w-md rounded-tema bg-acento-suave p-1 shadow-baja">
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
          role="grid"
          aria-label="Tablero"
        >
          {match.cells.map((owner, i) => {
            const row = Math.floor(i / n);
            const col = i % n;
            const person = personOf(table, owner);
            const free = !owner && myTurn && !busy;
            const isLast = match.last === i;
            return (
              <button
                key={i}
                type="button"
                disabled={!free}
                onClick={() => play({ game: 'cinco', cell: i })}
                aria-label={`Fila ${row + 1}, columna ${col + 1}${person ? `, de ${person.id === me.id ? 'vos' : person.nombre}` : ''}`}
                className="foco group relative flex aspect-square items-center justify-center disabled:cursor-default"
              >
                {/* The grid lines: half a line on each side, cut at the edges. */}
                <span
                  aria-hidden
                  className="absolute top-1/2 h-px -translate-y-1/2 bg-tinta-suave/40"
                  style={{ left: col === 0 ? '50%' : 0, right: col === n - 1 ? '50%' : 0 }}
                />
                <span
                  aria-hidden
                  className="absolute left-1/2 w-px -translate-x-1/2 bg-tinta-suave/40"
                  style={{ top: row === 0 ? '50%' : 0, bottom: row === n - 1 ? '50%' : 0 }}
                />
                {person ? (
                  <motion.span
                    initial={isLast ? { scale: 0.2, opacity: 0 } : false}
                    animate={{ scale: line.has(i) ? [1, 1.18, 1] : 1, opacity: 1 }}
                    transition={line.has(i) ? { duration: 0.9, repeat: Infinity } : { type: 'spring', bounce: 0.45 }}
                    className={cn(
                      'relative block size-[78%] rounded-full shadow-baja',
                      isLast && !line.has(i) && 'ring-2 ring-tinta ring-offset-1 ring-offset-acento-suave',
                      line.has(i) && 'ring-[3px] ring-tinta',
                    )}
                    style={{ backgroundColor: varColor(person.color) }}
                  />
                ) : (
                  free && (
                    <span
                      aria-hidden
                      className="relative block size-[55%] rounded-full opacity-0 transition-opacity group-hover:opacity-40"
                      style={{ backgroundColor: varColor(me.color) }}
                    />
                  )
                )}
              </button>
            );
          })}
        </div>
      </div>

      {!myTurn && !match.line && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-tinta-suave">
          <Avatar persona={other} medida="chico" /> {other.nombre} está pensando…
        </p>
      )}
    </section>
  );
}
