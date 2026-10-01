'use client';

import { motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import type { BoxesMatch } from '@/lib/movie-night';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

/**
 * Dots and boxes on a 4×4 grid of dots. Tap the gap between two dots to draw
 * that edge; close a box and it is yours, and you go again.
 */
export function Boxes({
  table,
  match,
  pending,
}: {
  table: Table;
  match: BoxesMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const myTurn = match.turn === me.id;
  const whose = personOf(table, match.turn);
  const { size } = match;
  // The grid alternates dot / edge tracks: dots are fixed, edges stretch.
  const tracks = Array.from({ length: 2 * size + 1 }, (_, i) => (i % 2 === 0 ? '0.75rem' : 'minmax(0, 1fr)')).join(' ');

  function edgeButton(edge: 'h' | 'v', index: number) {
    const owner = personOf(table, (edge === 'h' ? match.horizontal : match.vertical)[index]);
    const free = !owner;
    return (
      <button
        key={`${edge}${index}`}
        type="button"
        disabled={!myTurn || busy || !free}
        onClick={() => send(() => playAction(night.id, { game: 'cajas', edge, index }))}
        aria-label={`${edge === 'h' ? 'Línea horizontal' : 'Línea vertical'} ${index + 1}${owner ? `, de ${owner.nombre}` : ''}`}
        className={cn(
          'foco group flex items-center justify-center disabled:cursor-default',
          edge === 'h' ? 'h-3 w-full' : 'h-full w-3',
        )}
      >
        <motion.span
          initial={false}
          animate={{ scale: owner ? 1 : 0.92, opacity: owner ? 1 : 0.6 }}
          className={cn(
            'block rounded-full transition-colors',
            edge === 'h' ? 'h-1 w-full' : 'h-full w-1',
            free && 'bg-borde',
            free && myTurn && !busy && 'group-hover:bg-acento group-hover:opacity-100',
          )}
          style={owner ? { backgroundColor: varColor(owner.color), height: edge === 'h' ? '0.3rem' : undefined, width: edge === 'v' ? '0.3rem' : undefined } : undefined}
        />
      </button>
    );
  }

  const cells: React.ReactNode[] = [];
  for (let gr = 0; gr < 2 * size + 1; gr++) {
    for (let gc = 0; gc < 2 * size + 1; gc++) {
      const dotRow = gr % 2 === 0;
      const dotCol = gc % 2 === 0;
      if (dotRow && dotCol) {
        cells.push(<span key={`d${gr}-${gc}`} className="size-3 rounded-full bg-tinta" aria-hidden />);
      } else if (dotRow) {
        cells.push(edgeButton('h', (gr / 2) * size + (gc - 1) / 2));
      } else if (dotCol) {
        cells.push(edgeButton('v', ((gr - 1) / 2) * (size + 1) + gc / 2));
      } else {
        const b = ((gr - 1) / 2) * size + (gc - 1) / 2;
        const owner = personOf(table, match.boxes[b]);
        cells.push(
          <span key={`b${b}`} className="flex items-center justify-center" aria-label={owner ? `Cuadrado de ${owner.nombre}` : undefined}>
            {owner && (
              <motion.span
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.4 }}
                className="flex size-full items-center justify-center rounded-[calc(var(--radio)-6px)] font-cartel text-2xl"
                style={{ backgroundColor: `color-mix(in srgb, ${varColor(owner.color)} 22%, transparent)`, color: varColor(owner.color) }}
              >
                {owner.nombre.charAt(0).toUpperCase()}
              </motion.span>
            )}
          </span>,
        );
      }
    }
  }

  return (
    <section>
      <GameHeader table={table} pending={pending} name="Puntos y cajas" detail="Cerrás un cuadrado, seguís. Más cuadrados gana." />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {[me, other].map((p) => (
            <span key={p.id} className="flex items-center gap-1.5 text-sm text-tinta">
              <Avatar persona={p} />
              <span className="font-cartel text-2xl tracking-wide" style={{ color: varColor(p.color) }}>
                {match.score[p.id] ?? 0}
              </span>
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

      <div className="tarjeta mx-auto w-full max-w-xs p-4">
        <div
          className="grid aspect-square w-full items-center justify-items-center"
          style={{ gridTemplateColumns: tracks, gridTemplateRows: tracks }}
          role="grid"
          aria-label="Tablero"
        >
          {cells}
        </div>
      </div>
    </section>
  );
}
