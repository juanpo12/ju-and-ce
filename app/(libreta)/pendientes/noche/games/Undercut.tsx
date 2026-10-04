'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar } from '@/components/Avatar';
import { PORUNO_MAX_PICK, type PorunoMatch } from '@/lib/games/poruno';
import { varColor } from '@/lib/personas';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

export const meta = {
  description: 'Cada uno elige del 1 al 5 a escondidas. Alto suma más, pero si el otro elige justo uno menos, se lleva los dos. Gana el primero a 25.',
  icon: (
    <>
      <rect x="3.5" y="9" width="7" height="10" rx="1.5" />
      <rect x="13.5" y="5" width="7" height="14" rx="1.5" />
      <path d="M7 13.5v2M17 9v6M10.5 4.5l3 2-3 2" />
    </>
  ),
};

const REVEAL_MS = 2000;

/**
 * Both pick at once, hidden until the other is in. On the reveal the two
 * numbers face each other: one below the other steals the sum, otherwise each
 * keeps their own. A bar per person shows how close they are to 25.
 */
export function Undercut({ table, match, pending }: { table: Table; match: PorunoMatch; pending: Pendiente[] }) {
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
  const roundNumber = Math.min(match.rounds.length + (revealing ? 0 : 1), match.maxRounds);

  return (
    <section>
      <GameHeader
        table={table}
        pending={pending}
        name="Por uno"
        detail={`Ronda ${roundNumber} de ${match.maxRounds} · gana el primero a ${match.target}`}
      />

      <div className="mb-5 flex flex-col gap-2">
        {[me, other].map((p) => {
          const points = match.score[p.id] ?? 0;
          return (
            <div key={p.id} className="flex items-center gap-2">
              <Avatar persona={p} medida="chico" />
              <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-acento-suave">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: varColor(p.color) }}
                  animate={{ width: `${Math.min(100, (points / match.target) * 100)}%` }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              </div>
              <span className="w-8 text-right font-cartel text-xl leading-none text-tinta tabular-nums">{points}</span>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {revealing && last ? (
          <motion.div
            key={`round-${match.rounds.length}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="tarjeta flex flex-col items-center gap-4 px-4 py-6"
          >
            <div className="flex items-end gap-6">
              {[me, other].map((p, i) => {
                const stole = last.undercut === p.id;
                const robbed = last.undercut !== null && !stole;
                return (
                  <div key={p.id} className="flex flex-col items-center gap-1.5">
                    <motion.span
                      initial={{ y: 30, opacity: 0, rotate: i ? 8 : -8 }}
                      animate={{ y: stole ? -8 : 0, opacity: robbed ? 0.45 : 1, rotate: 0 }}
                      transition={{ delay: 0.1 + i * 0.12, type: 'spring', bounce: 0.5 }}
                      className="flex size-20 items-center justify-center rounded-tema font-cartel text-5xl text-sobre-persona shadow-alta"
                      style={{ backgroundColor: varColor(p.color) }}
                    >
                      {last.picks[p.id]}
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="font-cartel text-lg text-tinta"
                    >
                      +{last.points[p.id]}
                    </motion.span>
                  </div>
                );
              })}
            </div>
            <p className="text-center font-titulo text-3xl leading-tight text-tinta">
              {last.undercut === null
                ? 'Cada uno suma lo suyo'
                : last.undercut === me.id
                  ? `¡Por uno! Te llevás ${last.points[me.id]}`
                  : `¡Por uno! ${personOf(table, last.undercut)?.nombre} se lleva ${last.points[other.id]}`}
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
              {!otherChose && (
                <span aria-hidden className="absolute -inset-1.5 animate-ping rounded-full border-2 border-acento opacity-50" />
              )}
            </span>
            <p className="font-titulo text-2xl text-tinta">{`Esperando a ${other.nombre}…`}</p>
            <p className="text-xs text-tinta-suave">Tu número queda escondido hasta que elijan los dos.</p>
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
              <span className="font-titulo text-3xl text-tinta">¿Qué número jugás?</span>
              <span className="block text-sm text-tinta-suave">
                {otherChose ? `${other.nombre} ya eligió. ` : ''}Uno menos que el otro se lleva todo.
              </span>
            </p>
            <div className="grid w-full max-w-sm grid-cols-5 gap-2">
              {Array.from({ length: PORUNO_MAX_PICK }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={busy}
                  onClick={() => play({ game: 'poruno', pick: n })}
                  className="foco tocable tarjeta flex aspect-[3/4] items-center justify-center font-cartel text-4xl text-acento transition-colors hover:bg-acento-suave disabled:opacity-60"
                  aria-label={`Jugar el ${n}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {match.rounds.length > 0 && !revealing && (
        <ol className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-tinta-suave" aria-label="Rondas">
          {match.rounds.map((r, i) => {
            const thief = personOf(table, r.undercut);
            return (
              <li key={i} className="flex items-center gap-1 rounded-full border border-borde px-2 py-0.5 tabular-nums">
                {thief && <Avatar persona={thief} medida="chico" />}
                {r.picks[me.id]} · {r.picks[other.id]}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
