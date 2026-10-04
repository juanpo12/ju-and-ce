'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar } from '@/components/Avatar';
import { SUBASTA_CARDS, type SubastaMatch } from '@/lib/games/subasta';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

export const meta = {
  description: 'Sale un premio del 1 al 9 y cada uno ofrece a escondidas una carta de su mano. La más alta se lo lleva; si empatan, se pierde. Cada carta se usa una sola vez.',
  icon: (
    <>
      <path d="M13.5 4.5l6 6M11 7l6 6M12.5 5.5l-4 4M18.5 11.5l-4 4M10.5 9.5l-7 7a1.4 1.4 0 0 0 2 2l7-7" />
      <path d="M13 20.5h8" />
    </>
  ),
};

const REVEAL_MS = 2200;
const ALL = Array.from({ length: SUBASTA_CARDS }, (_, i) => i + 1);

/**
 * The prize card in the middle, your hand below as tappable cards, and the
 * other's spent cards on top: every card already played says something about
 * what they still hold.
 */
export function Auction({ table, match, pending }: { table: Table; match: SubastaMatch; pending: Pendiente[] }) {
  const { me, other, play, busy } = table;
  const iChose = match.chosen.includes(me.id);
  const otherChose = match.chosen.includes(other.id);

  const [revealed, setRevealed] = useState(match.rounds.length);
  const revealing = match.rounds.length > revealed;
  useEffect(() => {
    if (!revealing) return;
    const id = setTimeout(() => setRevealed(match.rounds.length), REVEAL_MS);
    return () => clearTimeout(id);
  }, [revealing, match.rounds.length]);

  const last = match.rounds[match.rounds.length - 1];
  const myHand = match.hands[me.id] ?? [];
  const theirHand = match.hands[other.id] ?? [];

  return (
    <section>
      <GameHeader
        table={table}
        pending={pending}
        name="Subasta"
        detail={`Premio ${Math.min(match.rounds.length + (revealing ? 0 : 1), SUBASTA_CARDS)} de ${SUBASTA_CARDS}`}
      />

      <div className="mb-4 flex items-center justify-center gap-6">
        {[me, other].map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <Avatar persona={p} />
            <span className="font-cartel text-3xl leading-none tabular-nums" style={{ color: varColor(p.color) }}>
              {match.score[p.id] ?? 0}
            </span>
          </div>
        ))}
      </div>

      <p className="mb-1 text-center text-xs text-tinta-suave">
        {`A ${other.nombre} le ${theirHand.length === 1 ? 'queda 1 carta' : `quedan ${theirHand.length} cartas`}`}
      </p>
      <div className="mb-4 flex items-center justify-center gap-1" aria-label={`Cartas de ${other.nombre}`}>
        <Avatar persona={other} medida="chico" className="mr-1" />
        {ALL.map((n) => {
          const spent = !theirHand.includes(n);
          return (
            <span
              key={n}
              className={cn(
                'flex h-7 w-5 items-center justify-center rounded-sm border text-[0.65rem] font-semibold tabular-nums',
                spent ? 'border-borde text-tinta-suave line-through opacity-60' : 'border-transparent',
              )}
              style={spent ? undefined : { backgroundColor: varColor(other.color) }}
              title={spent ? `Ya jugó el ${n}` : 'Boca abajo'}
            >
              {spent ? n : ''}
            </span>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {revealing && last ? (
          <motion.div
            key={`round-${match.rounds.length}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="tarjeta flex flex-col items-center gap-4 px-4 py-6"
          >
            <div className="flex items-center gap-4">
              <Bid value={last.bids[me.id]!} color={varColor(me.color)} won={last.winner === me.id} lost={last.winner === other.id} delay={0.1} />
              <PrizeCard value={last.prize} small />
              <Bid value={last.bids[other.id]!} color={varColor(other.color)} won={last.winner === other.id} lost={last.winner === me.id} delay={0.25} />
            </div>
            <p className="text-center font-titulo text-3xl leading-tight text-tinta">
              {last.winner === null
                ? 'Empate: el premio se pierde'
                : last.winner === me.id
                  ? `Te llevás ${last.prize}`
                  : `${personOf(table, last.winner)?.nombre} se lleva ${last.prize}`}
            </p>
          </motion.div>
        ) : match.prize === null ? null : (
          <motion.div
            key={`prize-${match.prize}-${match.rounds.length}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex flex-col items-center gap-1">
              <PrizeCard value={match.prize} />
              <span className="text-xs text-tinta-suave">
                {match.prizesLeft === 0 ? 'El último premio' : `Quedan ${match.prizesLeft} boca abajo`}
              </span>
            </div>

            {iChose ? (
              <div className="tarjeta flex w-full max-w-sm items-center gap-3 px-4 py-4">
                <span className="relative flex">
                  <Avatar persona={other} medida="grande" vacio={!otherChose} />
                  {!otherChose && (
                    <span aria-hidden className="absolute -inset-1.5 animate-ping rounded-full border-2 border-acento opacity-50" />
                  )}
                </span>
                <p className="text-sm text-tinta-suave">
                  Ya ofertaste. {otherChose ? 'Dan vuelta las cartas…' : `Esperando la oferta de ${other.nombre}…`}
                </p>
              </div>
            ) : (
              <div className="w-full max-w-sm">
                <p className="mb-2 text-center text-sm text-tinta-suave">
                  {otherChose ? `${other.nombre} ya ofertó. ` : ''}¿Con qué carta ofertás?
                </p>
                <div className="grid grid-cols-9 gap-1">
                  {ALL.map((n) => {
                    const have = myHand.includes(n);
                    return (
                      <button
                        key={n}
                        type="button"
                        disabled={busy || !have}
                        onClick={() => play({ game: 'subasta', card: n })}
                        className={cn(
                          'foco tocable flex aspect-[2/3] items-center justify-center rounded-md border-2 font-cartel text-xl transition-transform',
                          have ? 'bg-superficie-alta text-tinta shadow-baja hover:-translate-y-1' : 'border-dashed border-borde text-tinta-suave opacity-40',
                        )}
                        style={have ? { borderColor: varColor(me.color) } : undefined}
                        aria-label={have ? `Ofertar el ${n}` : `El ${n} ya lo usaste`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {match.rounds.length > 0 && !revealing && (
        <ol className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-tinta-suave" aria-label="Premios">
          {match.rounds.map((r, i) => {
            const who = personOf(table, r.winner);
            return (
              <li key={i} className="flex items-center gap-1 rounded-full border border-borde px-2 py-0.5 tabular-nums">
                {who ? <Avatar persona={who} medida="chico" /> : <span>=</span>}
                <span className="font-semibold text-tinta">{r.prize}</span> · {r.bids[me.id]} vs {r.bids[other.id]}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/** The prize up for grabs: a card with its value, crowned. */
function PrizeCard({ value, small = false }: { value: number; small?: boolean }) {
  return (
    <motion.div
      initial={{ rotateY: 90 }}
      animate={{ rotateY: 0 }}
      transition={{ type: 'spring', bounce: 0.35 }}
      className={cn(
        'flex flex-col items-center justify-center rounded-tema bg-acento text-sobre-acento shadow-alta',
        small ? 'h-24 w-16 gap-0.5' : 'h-36 w-24 gap-1',
      )}
    >
      <svg viewBox="0 0 24 24" className={small ? 'size-4' : 'size-6'} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" aria-hidden>
        <path d="M4 17.5L3 7.5l5 4 4-6 4 6 5-4-1 10z" />
      </svg>
      <span className={cn('font-cartel leading-none', small ? 'text-4xl' : 'text-6xl')}>{value}</span>
    </motion.div>
  );
}

function Bid({ value, color, won, lost, delay }: { value: number; color: string; won: boolean; lost: boolean; delay: number }) {
  return (
    <motion.span
      initial={{ y: 28, opacity: 0 }}
      animate={{ y: won ? -6 : 0, opacity: lost ? 0.45 : 1 }}
      transition={{ delay, type: 'spring', bounce: 0.5 }}
      className="flex h-20 w-14 items-center justify-center rounded-md font-cartel text-4xl text-sobre-persona shadow-alta"
      style={{ backgroundColor: color }}
    >
      {value}
    </motion.span>
  );
}
