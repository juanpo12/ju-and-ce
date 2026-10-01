'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { THROWS, type RpsMatch, type Throw } from '@/lib/movie-night';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

const THROW_LABEL: Record<Throw, string> = { rock: 'Piedra', paper: 'Papel', scissors: 'Tijera' };
const REVEAL_MS = 1800;

/**
 * Each person picks on their own phone; the throw stays hidden until both have
 * picked. When a resolved round arrives, both hands are shown for a moment and
 * only then does the picking come back.
 */
export function RockPaperScissors({
  table,
  match,
  pending,
}: {
  table: Table;
  match: RpsMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const iChose = match.chosen.includes(me.id);
  const otherChose = match.chosen.includes(other.id);

  // The latest round is revealed when it appears: remember how many there were.
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
      <GameHeader table={table} pending={pending} name="Piedra, papel o tijera" detail="Al mejor de 3" />

      <div className="mb-5 flex items-center justify-center gap-6">
        {[me, other].map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <Avatar persona={p} />
            <span className="flex gap-1" aria-label={`${p.nombre}: ${match.score[p.id] ?? 0} puntos`}>
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
            <div className="flex items-center gap-6">
              {[me, other].map((p) => {
                const t = last.throws[p.id];
                const won = last.winner === p.id;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    transition={{ delay: 0.15, type: 'spring', bounce: 0.4 }}
                    className={cn('flex flex-col items-center gap-2', last.winner && !won && 'opacity-50')}
                  >
                    <span
                      className="flex size-20 items-center justify-center rounded-full text-sobre-persona"
                      style={{ backgroundColor: varColor(p.color) }}
                    >
                      {t && <Hand throw_={t} />}
                    </span>
                    <span className="text-xs text-tinta-suave">{t ? THROW_LABEL[t] : '—'}</span>
                  </motion.div>
                );
              })}
            </div>
            <p className="font-titulo text-3xl text-tinta">
              {last.winner === null
                ? 'Empate: de nuevo'
                : last.winner === me.id
                  ? 'Punto para vos'
                  : `Punto para ${personOf(table, last.winner)?.nombre}`}
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
            <p className="font-titulo text-2xl text-tinta">
              {otherChose ? 'Ya eligieron los dos…' : `Esperando a ${other.nombre}…`}
            </p>
            <p className="text-xs text-tinta-suave">Tu jugada queda escondida hasta que elijan los dos.</p>
          </motion.div>
        ) : (
          <motion.div
            key="pick"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-sm text-tinta-suave">
              {otherChose ? `${other.nombre} ya eligió. Te toca.` : 'Elegí sin que te vea.'}
            </p>
            <div className="grid w-full max-w-sm grid-cols-3 gap-2">
              {THROWS.map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={busy}
                  onClick={() => send(() => playAction(night.id, { game: 'ppt', throw: t }))}
                  className="foco tocable tarjeta flex aspect-square flex-col items-center justify-center gap-2 text-acento transition-colors hover:bg-acento-suave disabled:opacity-60"
                  aria-label={THROW_LABEL[t]}
                >
                  <Hand throw_={t} />
                  <span className="font-cartel text-lg tracking-wide text-tinta">{THROW_LABEL[t]}</span>
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
            return (
              <li key={i} className="flex items-center gap-1 rounded-full border border-borde px-2 py-0.5">
                {who ? <Avatar persona={who} medida="chico" /> : <span>=</span>}
                {THROW_LABEL[r.throws[me.id]!]?.toLowerCase()} · {THROW_LABEL[r.throws[other.id]!]?.toLowerCase()}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/** The three hands, as line drawings. */
function Hand({ throw_ }: { throw_: Throw }) {
  const common = {
    viewBox: '0 0 24 24',
    className: 'size-9',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (throw_ === 'rock') {
    return (
      <svg {...common}>
        <path d="M6 12.5V9a1.5 1.5 0 0 1 3 0v2.5M9 11V7.5a1.5 1.5 0 0 1 3 0V11M12 11V8a1.5 1.5 0 0 1 3 0v3.5M15 11.5V9.5a1.5 1.5 0 0 1 3 0v4a5.5 5.5 0 0 1-5.5 5.5h-1A5.5 5.5 0 0 1 6 13.5v-1" />
      </svg>
    );
  }
  if (throw_ === 'paper') {
    return (
      <svg {...common}>
        <path d="M7 12V5.5a1.5 1.5 0 0 1 3 0V11M10 11V4a1.5 1.5 0 0 1 3 0v7M13 11V5a1.5 1.5 0 0 1 3 0v6.5M16 11.5V7.5a1.5 1.5 0 0 1 3 0v6a5.5 5.5 0 0 1-5.5 5.5h-1A5.5 5.5 0 0 1 7 13.5v-1" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M9.5 12.5L6 5.5a1.4 1.4 0 0 1 2.5-1.2L12 11M14.5 12.5L18 5.5a1.4 1.4 0 0 0-2.5-1.2L12 11" />
      <path d="M9 12.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM15 12.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    </svg>
  );
}
