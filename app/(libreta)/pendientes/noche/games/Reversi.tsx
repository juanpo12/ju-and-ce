'use client';

import { motion } from 'motion/react';
import { Avatar } from '@/components/Avatar';
import { legalMoves, type ReversiMatch } from '@/lib/games/reversi';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

export const meta = {
  description: 'Fichas que se dan vuelta: encerrá las del otro en línea y pasan a ser tuyas. Más fichas al final gana.',
  icon: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <circle cx="9" cy="9" r="2.3" fill="currentColor" />
      <circle cx="15" cy="15" r="2.3" fill="currentColor" />
      <circle cx="15" cy="9" r="2.3" />
      <circle cx="9" cy="15" r="2.3" />
    </>
  ),
};

/**
 * Reversi on one shared board. The player on turn sees where they can play;
 * the disc just placed is marked and the ones it flipped turn over.
 */
export function Reversi({ table, match, pending }: { table: Table; match: ReversiMatch; pending: Pendiente[] }) {
  const { me, other, play, busy } = table;
  const myTurn = match.turn === me.id;
  const whose = personOf(table, match.turn);
  const legal = new Set(myTurn ? legalMoves(match.cells, match.size, me.id) : []);
  const flipped = new Set(match.last?.flipped ?? []);
  const count = (id: string) => match.cells.filter((c) => c === id).length;
  const passed = personOf(table, match.passed);

  return (
    <section>
      <GameHeader table={table} pending={pending} name="Reversi" detail="Encerrá en línea las fichas del otro para darlas vuelta." />

      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-sm">
          {[me, other].map((p) => (
            <span key={p.id} className="flex items-center gap-1.5" aria-label={`${p.nombre}: ${count(p.id)} fichas`}>
              <span className="size-4 rounded-full shadow-baja" style={{ backgroundColor: varColor(p.color) }} />
              <span className="font-cartel text-xl leading-none text-tinta">{count(p.id)}</span>
              <span className="text-xs text-tinta-suave">{p.id === me.id ? 'vos' : p.nombre}</span>
            </span>
          ))}
        </div>
        <p
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={whose ? { backgroundColor: varColor(whose.color), color: 'var(--sobre-persona)' } : undefined}
          aria-live="polite"
        >
          {myTurn ? 'Te toca' : `Le toca a ${other.nombre}`}
        </p>
      </div>

      {passed && (
        <p className="mb-3 rounded-tema bg-acento-suave px-3 py-2 text-center text-sm text-tinta" aria-live="polite">
          {passed.id === me.id ? 'No tenías jugada: pasaste.' : `${passed.nombre} no tenía jugada: pasa.`}
          {myTurn ? ' Te toca otra vez.' : ''}
        </p>
      )}

      <div className="mx-auto w-full max-w-sm rounded-tema bg-acento-suave p-1.5 shadow-baja">
        <div
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${match.size}, minmax(0, 1fr))` }}
          role="grid"
          aria-label="Tablero"
        >
          {match.cells.map((owner, i) => {
            const row = Math.floor(i / match.size);
            const col = i % match.size;
            const person = personOf(table, owner);
            const canPlay = legal.has(i) && !busy;
            const isLast = match.last?.cell === i;
            return (
              <button
                key={i}
                type="button"
                disabled={!canPlay}
                onClick={() => play({ game: 'reversi', cell: i })}
                aria-label={`Fila ${row + 1}, columna ${col + 1}${person ? `, de ${person.id === me.id ? 'vos' : person.nombre}` : canPlay ? ', podés jugar acá' : ''}`}
                className={cn(
                  'foco relative flex aspect-square items-center justify-center rounded-[3px] bg-superficie [perspective:200px] disabled:cursor-default',
                  canPlay && 'hover:bg-superficie-alta',
                )}
              >
                {person ? (
                  <motion.span
                    key={`${i}-${owner}`}
                    initial={flipped.has(i) ? { rotateY: 180 } : isLast ? { scale: 0.3, opacity: 0 } : false}
                    animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.5, delay: flipped.has(i) ? 0.15 : 0 }}
                    className={cn('block size-[80%] rounded-full shadow-baja', isLast && 'ring-2 ring-tinta ring-offset-1 ring-offset-superficie')}
                    style={{ backgroundColor: varColor(person.color) }}
                  />
                ) : (
                  canPlay && (
                    <span
                      aria-hidden
                      className="block size-[30%] rounded-full opacity-45"
                      style={{ backgroundColor: varColor(me.color) }}
                    />
                  )
                )}
              </button>
            );
          })}
        </div>
      </div>

      {myTurn && legal.size > 0 && (
        <p className="mt-3 text-center text-xs text-tinta-suave">Los puntitos marcan dónde podés jugar.</p>
      )}
      {!myTurn && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-tinta-suave">
          <Avatar persona={other} medida="chico" /> {other.nombre} está pensando…
        </p>
      )}
    </section>
  );
}
