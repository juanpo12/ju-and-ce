'use client';

import { motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import type { TicTacToeMatch } from '@/lib/movie-night';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

/**
 * Tic-tac-toe on one shared board. Each mark is the initial of whoever placed
 * it, in their color. A draw resets the board; three draws and the coin decides.
 */
export function TicTacToe({
  table,
  match,
  pending,
}: {
  table: Table;
  match: TicTacToeMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const myTurn = match.turn === me.id;
  const whose = personOf(table, match.turn);

  return (
    <section>
      <GameHeader
        table={table}
        pending={pending}
        name="Tateti"
        detail={match.draws > 0 ? `${match.draws} ${match.draws === 1 ? 'empate' : 'empates'} de ${match.maxDraws}` : 'Tres en línea gana.'}
      />

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

      <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2" role="grid" aria-label="Tablero">
        {match.board.map((cell, i) => {
          const owner = personOf(table, cell);
          const inLine = match.line?.includes(i);
          return (
            <motion.button
              key={`${i}-${match.draws}`}
              type="button"
              role="gridcell"
              disabled={!myTurn || busy || Boolean(cell)}
              onClick={() => send(() => playAction(night.id, { game: 'tateti', cell: i }))}
              aria-label={owner ? `${owner.nombre}` : `Casilla ${i + 1}, libre`}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'foco tarjeta flex aspect-square items-center justify-center font-cartel text-5xl leading-none transition-colors disabled:cursor-default',
                !cell && myTurn && !busy && 'hover:bg-acento-suave',
                inLine && 'ring-[3px]',
              )}
              style={{
                color: owner ? varColor(owner.color) : undefined,
                ...(inLine && owner ? { '--tw-ring-color': varColor(owner.color) } : {}),
              } as React.CSSProperties}
            >
              {owner && (
                <motion.span initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.45 }}>
                  {owner.nombre.charAt(0).toUpperCase()}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
