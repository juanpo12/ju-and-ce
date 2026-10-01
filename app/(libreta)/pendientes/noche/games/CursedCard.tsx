'use client';

import { motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import type { CursedCardMatch } from '@/lib/movie-night';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

/**
 * Twelve cards face down, one of them cursed. By turns, flip one: safe ones
 * stay on the table with the flipper's mark; the cursed one ends it, and the
 * Outcome screen says who lost. The fewer cards left, the sweatier the tap.
 */
export function CursedCard({
  table,
  match,
  pending,
}: {
  table: Table;
  match: CursedCardMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const myTurn = match.turn === me.id;
  const whose = personOf(table, match.turn);
  const left = match.cards - match.flipped.length;

  return (
    <section>
      <GameHeader table={table} pending={pending} name="La carta maldita" detail="Una está maldita. El que la da vuelta pierde." />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-tinta-suave" aria-live="polite">
          {left === 1 ? 'Queda una carta, y es la maldita' : `Quedan ${left} cartas, una está maldita`}
        </p>
        <p
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={whose ? { backgroundColor: varColor(whose.color), color: 'var(--sobre-persona)' } : undefined}
        >
          {myTurn ? 'Te toca' : `Le toca a ${other.nombre}`}
        </p>
      </div>

      <ul className="grid grid-cols-4 gap-2" aria-label="Cartas">
        {Array.from({ length: match.cards }, (_, i) => {
          const flip = match.flipped.find((f) => f.card === i);
          const by = flip ? personOf(table, flip.by) : null;
          return (
            <li key={i} className="[perspective:600px]">
              <motion.button
                type="button"
                disabled={!myTurn || busy || Boolean(flip)}
                onClick={() => send(() => playAction(night.id, { game: 'carta', card: i }))}
                aria-label={flip ? `Carta ${i + 1}, segura, la dio vuelta ${by?.nombre ?? 'alguien'}` : `Carta ${i + 1}, tapada`}
                animate={{ rotateY: flip ? 180 : 0 }}
                whileTap={!flip && myTurn ? { scale: 0.95 } : undefined}
                transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                className="foco relative aspect-[2/3] w-full rounded-[calc(var(--radio)-4px)] [transform-style:preserve-3d] disabled:cursor-default"
              >
                <span className="absolute inset-0 flex items-center justify-center rounded-[inherit] border border-borde bg-acento-suave text-acento shadow-baja [backface-visibility:hidden]">
                  <Skull />
                </span>
                <span
                  className={cn(
                    'absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-[inherit] border bg-superficie-alta text-tinta-suave shadow-baja [backface-visibility:hidden] [transform:rotateY(180deg)]',
                  )}
                  style={by ? { borderColor: varColor(by.color) } : undefined}
                >
                  <Check />
                  {by && <Avatar persona={by} medida="chico" />}
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** The back of every card: nobody knows which one bites. */
function Skull() {
  return (
    <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3a7 7 0 0 0-7 7c0 2.4 1.1 4.3 2.8 5.5V19a1 1 0 0 0 1 1h6.4a1 1 0 0 0 1-1v-3.5A7 7 0 0 0 12 3z" />
      <circle cx="9.3" cy="11" r="1.4" fill="currentColor" />
      <circle cx="14.7" cy="11" r="1.4" fill="currentColor" />
      <path d="M11 17v2M13 17v2" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
