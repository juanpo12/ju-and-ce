'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import type { NimMatch } from '@/lib/movie-night';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, nameOf, type Table } from '../types';

/**
 * Nim with three rows of matches. Tap a match to choose how many to take from
 * its row (that one and everything to its right), then confirm. Whoever takes
 * the last one loses.
 */
export function Nim({
  table,
  match,
  pending,
}: {
  table: Table;
  match: NimMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const myTurn = match.turn === me.id;
  const whose = personOf(table, match.turn);
  const [selection, setSelection] = useState<{ row: number; count: number } | null>(null);

  // A new turn (someone played) clears whatever was half-chosen.
  useEffect(() => setSelection(null), [match.turn, match.last?.count]);

  function take() {
    if (!selection) return;
    const { row, count } = selection;
    setSelection(null);
    void send(() => playAction(night.id, { game: 'nim', row, count }));
  }

  const left = match.rows.reduce((s, n) => s + n, 0);

  return (
    <section>
      <GameHeader table={table} pending={pending} name="Nim" detail="Sacá los que quieras de una fila. El que saca el último pierde." />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-tinta-suave">
          {left} {left === 1 ? 'fósforo' : 'fósforos'} en la mesa
          {match.last && ` · ${nameOf(table, match.last.by)} sacó ${match.last.count}`}
        </p>
        <p
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={whose ? { backgroundColor: varColor(whose.color), color: 'var(--sobre-persona)' } : undefined}
          aria-live="polite"
        >
          {myTurn ? 'Te toca' : `Le toca a ${other.nombre}`}
        </p>
      </div>

      <div className="tarjeta flex flex-col items-center gap-3 px-4 py-5">
        {match.rows.map((count, row) => (
          <div key={row} className="flex min-h-14 items-end justify-center gap-1.5" role="group" aria-label={`Fila ${row + 1}: ${count}`}>
            {Array.from({ length: count }, (_, i) => {
              const fromRight = count - i;
              const selected = selection?.row === row && fromRight <= selection.count;
              return (
                <motion.button
                  key={i}
                  type="button"
                  layout
                  disabled={!myTurn || busy}
                  onClick={() => setSelection(selected && selection?.count === fromRight ? null : { row, count: fromRight })}
                  aria-label={`Sacar ${fromRight} de la fila ${row + 1}`}
                  aria-pressed={selected}
                  whileTap={{ scale: 0.92 }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: selected ? -6 : 0 }}
                  exit={{ opacity: 0 }}
                  className={cn('foco rounded-sm disabled:cursor-default', selected ? 'text-acento' : 'text-tinta')}
                >
                  <Match selected={selected} />
                </motion.button>
              );
            })}
            {count === 0 && <span className="text-xs text-tinta-suave">—</span>}
          </div>
        ))}
      </div>

      <div className="mt-4 flex min-h-11 items-center justify-center gap-2">
        {myTurn ? (
          <>
            <Boton onClick={take} disabled={!selection || busy} className="h-11 px-6">
              {selection ? `Sacar ${selection.count}` : 'Elegí cuántos sacar'}
            </Boton>
            {selection && (
              <Boton variante="fantasma" onClick={() => setSelection(null)} disabled={busy}>
                Cancelar
              </Boton>
            )}
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-sm text-tinta-suave">
            <Avatar persona={other} medida="chico" /> Esperando a {other.nombre}…
          </span>
        )}
      </div>
    </section>
  );
}

/** A match: a stick with a round head, drawn in the current color. */
function Match({ selected }: { selected: boolean }) {
  return (
    <svg viewBox="0 0 10 44" className="h-12 w-3 sm:h-14 sm:w-3.5" aria-hidden>
      <rect x="3.5" y="10" width="3" height="32" rx="1.5" fill="currentColor" opacity={selected ? 1 : 0.55} />
      <ellipse cx="5" cy="7" rx="4.2" ry="6" fill={selected ? 'var(--acento)' : 'var(--tinta-suave)'} />
    </svg>
  );
}
