'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar } from '@/components/Avatar';
import { MAX_FINGERS, type ParesMatch } from '@/lib/games/pares';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

export const meta = {
  description: 'Uno es pares, el otro nones. Cada uno saca de 0 a 5 dedos a la vez: la suma decide. Al mejor de 5.',
  icon: (
    <>
      <path d="M8 13V6.5a1.3 1.3 0 0 1 2.6 0V12M10.6 11V5a1.3 1.3 0 0 1 2.6 0v6M13.2 11.5V7a1.3 1.3 0 0 1 2.6 0v6a5 5 0 0 1-5 5h-.6a5 5 0 0 1-4.6-3l-1.5-3.4a1.3 1.3 0 0 1 2.3-1.1L8 13" />
    </>
  ),
};

const REVEAL_MS = 1800;

/**
 * Both hands come out at once: each phone picks how many fingers, hidden until
 * the other is in. When a round resolves, both hands and the sum show for a
 * moment, then the next round, with «pares» on the other side.
 */
export function OddsOrEvens({ table, match, pending }: { table: Table; match: ParesMatch; pending: Pendiente[] }) {
  const { me, other, play, busy } = table;
  const iChose = match.chosen.includes(me.id);
  const otherChose = match.chosen.includes(other.id);
  const iAmEven = match.even === me.id;

  const [revealed, setRevealed] = useState(match.rounds.length);
  const revealing = match.rounds.length > revealed;
  useEffect(() => {
    if (!revealing) return;
    const id = setTimeout(() => setRevealed(match.rounds.length), REVEAL_MS);
    return () => clearTimeout(id);
  }, [revealing, match.rounds.length]);

  const last = match.rounds[match.rounds.length - 1];

  return (
    <section>
      <GameHeader table={table} pending={pending} name="Pares o nones" detail={`El primero en ganar ${match.target} rondas`} />

      <div className="mb-5 flex items-center justify-center gap-6">
        {[me, other].map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <Avatar persona={p} />
            <span className="flex gap-1" aria-label={`${p.nombre}: ${match.score[p.id] ?? 0} rondas`}>
              {Array.from({ length: match.target }, (_, i) => (
                <span
                  key={i}
                  className="size-3 rounded-full border-2"
                  style={{
                    borderColor: varColor(p.color),
                    backgroundColor: i < (match.score[p.id] ?? 0) ? varColor(p.color) : 'transparent',
                  }}
                />
              ))}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {revealing && last ? (
          <motion.div
            key={`round-${match.rounds.length}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="tarjeta flex flex-col items-center gap-3 px-4 py-6"
          >
            <div className="flex items-center gap-4">
              {[me, other].map((p, i) => (
                <div key={p.id} className="contents">
                  {i === 1 && <span className="font-cartel text-3xl text-tinta-suave">+</span>}
                  <motion.span
                    initial={{ y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.1, type: 'spring', bounce: 0.45 }}
                    className="flex size-20 flex-col items-center justify-center rounded-full text-sobre-persona"
                    style={{ backgroundColor: varColor(p.color) }}
                  >
                    <span className="font-cartel text-4xl leading-none">{last.fingers[p.id]}</span>
                  </motion.span>
                </div>
              ))}
              <span className="font-cartel text-3xl text-tinta-suave">=</span>
              <span className="font-cartel text-5xl text-tinta">{(last.fingers[me.id] ?? 0) + (last.fingers[other.id] ?? 0)}</span>
            </div>
            <p className="font-titulo text-3xl text-tinta">
              {(((last.fingers[me.id] ?? 0) + (last.fingers[other.id] ?? 0)) % 2 === 0 ? '¡Pares!' : '¡Nones!') +
                ' ' +
                (last.winner === me.id ? 'Ronda tuya' : `Ronda de ${personOf(table, last.winner)?.nombre}`)}
            </p>
          </motion.div>
        ) : iChose ? (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="tarjeta flex flex-col items-center gap-2 px-4 py-8 text-center"
          >
            <span className="relative flex">
              <Avatar persona={other} medida="grande" vacio={!otherChose} />
              {!otherChose && <span aria-hidden className="absolute -inset-1.5 animate-ping rounded-full border-2 border-acento opacity-50" />}
            </span>
            <p className="font-titulo text-2xl text-tinta">{`Esperando la mano de ${other.nombre}…`}</p>
            <p className="text-xs text-tinta-suave">La tuya queda escondida hasta que muestren los dos.</p>
          </motion.div>
        ) : (
          <motion.div
            key="pick"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-center">
              <span className="font-titulo text-3xl text-tinta">Sos {iAmEven ? 'pares' : 'nones'}</span>
              <span className="block text-sm text-tinta-suave">
                {otherChose ? `${other.nombre} ya mostró su mano. ` : ''}¿Cuántos dedos sacás?
              </span>
            </p>
            <div className="grid w-full max-w-sm grid-cols-3 gap-2">
              {Array.from({ length: MAX_FINGERS + 1 }, (_, n) => (
                <button
                  key={n}
                  type="button"
                  disabled={busy}
                  onClick={() => play({ game: 'pares', fingers: n })}
                  className={cn(
                    'foco tocable tarjeta flex aspect-square flex-col items-center justify-center gap-1 text-acento transition-colors hover:bg-acento-suave disabled:opacity-60',
                  )}
                  aria-label={`${n} ${n === 1 ? 'dedo' : 'dedos'}`}
                >
                  <Fingers n={n} />
                  <span className="font-cartel text-2xl leading-none text-tinta">{n}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {match.rounds.length > 0 && !revealing && (
        <ol className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-tinta-suave" aria-label="Rondas">
          {match.rounds.map((r, i) => {
            const who = personOf(table, r.winner);
            const sum = Object.values(r.fingers).reduce((s, f) => s + f, 0);
            return (
              <li key={i} className="flex items-center gap-1 rounded-full border border-borde px-2 py-0.5">
                {who && <Avatar persona={who} medida="chico" />}
                {sum} · {sum % 2 === 0 ? 'pares' : 'nones'}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/** A palm with `n` raised fingers (0 is a fist). */
function Fingers({ n }: { n: number }) {
  const xs = [7, 9.6, 12.2, 14.8, 17.4];
  return (
    <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
      <rect x="6" y="12" width="12.5" height="8" rx="3.5" />
      {xs.slice(0, n).map((x) => (
        <path key={x} d={`M${x} 12V${x === 7 ? 9 : 5.5}`} />
      ))}
    </svg>
  );
}
