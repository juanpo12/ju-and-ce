'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HandGrab, Handshake } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import type { RobarChoice, RobarMatch, RobarRound } from '@/lib/games/robar';
import { varColor, type Persona } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import type { Table } from '../types';

export const meta = {
  description: 'Cinco pozos de puntos. Cada uno decide a escondidas si comparte o roba. Si los dos comparten, mitad y mitad; si uno roba, se lleva todo; si roban los dos, nadie.',
  icon: (
    <>
      <path d="M12 3.5c-3 0-5.5 1-5.5 3 0 1.4 1.4 2.4 3 2.8L6.8 13a5.5 5.5 0 0 0 5.2 7.5 5.5 5.5 0 0 0 5.2-7.5l-2.7-3.7c1.6-.4 3-1.4 3-2.8 0-2-2.5-3-5.5-3z" />
      <path d="M12 12.5v5M10.3 14h3.4" />
    </>
  ),
};

const REVEAL_MS = 2600;
const LABEL: Record<RobarChoice, string> = { share: 'Compartir', steal: 'Robar' };

/**
 * The pot sits in the middle. Each one picks a card in secret; the reveal
 * flips both cards one after the other, and the trust history below keeps who
 * shared and who stole, round by round.
 */
export function StealOrShare({ table, match, pending }: { table: Table; match: RobarMatch; pending: Pendiente[] }) {
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
  const index = revealing ? match.rounds.length - 1 : match.rounds.length;
  const pot = match.pots[Math.min(index, match.pots.length - 1)]!;
  const finished = match.rounds.length >= match.pots.length && !revealing;

  return (
    <section>
      <GameHeader
        table={table}
        pending={pending}
        name="Robar o compartir"
        detail={`Pozo ${Math.min(index + 1, match.pots.length)} de ${match.pots.length}`}
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

      {!finished && (
        <div className="mb-4 flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-tinta-suave">En juego</span>
          <motion.span
            key={index}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="font-cartel text-6xl leading-none text-acento"
          >
            {pot}
          </motion.span>
          <span className="text-xs text-tinta-suave">{pot === 1 ? 'punto' : 'puntos'}</span>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {revealing && last ? (
          <motion.div
            key={`round-${match.rounds.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="tarjeta flex flex-col items-center gap-4 px-4 py-6"
          >
            <div className="flex gap-4 [perspective:600px]">
              {[me, other].map((p, i) => (
                <FlipCard key={p.id} person={p} choice={last.choices[p.id]!} delay={0.3 + i * 0.7} />
              ))}
            </div>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="text-center font-titulo text-3xl leading-tight text-tinta"
            >
              {verdict(last, me, other)}
            </motion.p>
          </motion.div>
        ) : finished ? null : iChose ? (
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
            <p className="font-titulo text-2xl text-tinta">{`¿Qué hará ${other.nombre}?`}</p>
            <p className="text-xs text-tinta-suave">Tu carta queda boca abajo hasta que elijan los dos.</p>
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
              {otherChose ? `${other.nombre} ya eligió su carta.` : 'Elegí sin que te vea.'}
            </p>
            <div className="grid w-full max-w-sm grid-cols-2 gap-3">
              {(['share', 'steal'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={busy}
                  onClick={() => play({ game: 'robar', choice: c })}
                  className={cn(
                    'foco tocable tarjeta flex aspect-[3/4] flex-col items-center justify-center gap-3 transition-colors hover:bg-acento-suave disabled:opacity-60',
                    c === 'steal' ? 'text-acento' : 'text-tinta',
                  )}
                >
                  <ChoiceIcon choice={c} className="size-12" />
                  <span className="font-cartel text-2xl tracking-wide">{LABEL[c]}</span>
                  <span className="px-2 text-center text-xs text-tinta-suave">
                    {c === 'share' ? `Si comparten, ${Math.ceil(pot / 2)} cada uno` : `Si te deja, ${pot} para vos`}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {match.rounds.length > 0 && (!revealing || match.rounds.length > 1) && (
        <div className="mt-5">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-tinta-suave">Confianza</p>
          <div className="mx-auto flex w-fit flex-col gap-1.5">
            {[me, other].map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <Avatar persona={p} medida="chico" />
                {match.rounds.slice(0, revealing ? -1 : undefined).map((r, i) => {
                  const c = r.choices[p.id]!;
                  return (
                    <span
                      key={i}
                      title={`Pozo ${i + 1}: ${LABEL[c].toLowerCase()}`}
                      className={cn(
                        'flex size-7 items-center justify-center rounded-full border-2',
                        c === 'share' ? 'text-sobre-persona' : 'bg-transparent',
                      )}
                      style={{
                        borderColor: varColor(p.color),
                        backgroundColor: c === 'share' ? varColor(p.color) : undefined,
                        color: c === 'share' ? undefined : varColor(p.color),
                      }}
                    >
                      <ChoiceIcon choice={c} className="size-4" />
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function verdict(round: RobarRound, me: Persona, other: Persona): string {
  const mine = round.choices[me.id];
  const theirs = round.choices[other.id];
  if (mine === 'share' && theirs === 'share') return `Compartieron: ${round.points[me.id]} para cada uno`;
  if (mine === 'steal' && theirs === 'steal') return 'Robaron los dos: nadie se lleva nada';
  if (mine === 'steal') return `¡Robaste! ${round.points[me.id]} para vos`;
  return `¡${other.nombre} te robó ${round.points[other.id]}!`;
}

/** A face-down card that flips to show what this person chose. */
function FlipCard({ person, choice, delay }: { person: Persona; choice: RobarChoice; delay: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.div
        initial={{ rotateY: 180 }}
        animate={{ rotateY: 0 }}
        transition={{ delay, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative h-36 w-24 [transform-style:preserve-3d]"
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-tema text-sobre-persona shadow-alta [backface-visibility:hidden]"
          style={{ backgroundColor: varColor(person.color) }}
        >
          <ChoiceIcon choice={choice} className="size-10" />
          <span className="font-cartel text-lg tracking-wide">{LABEL[choice]}</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-tema border-2 border-borde bg-superficie-alta shadow-alta [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="font-cartel text-4xl text-tinta-suave">?</span>
        </div>
      </motion.div>
      <span className="text-xs text-tinta-suave">{person.nombre}</span>
    </div>
  );
}

function ChoiceIcon({ choice, className }: { choice: RobarChoice; className?: string }) {
  const Icon = choice === 'share' ? Handshake : HandGrab;
  return <Icon className={className} strokeWidth={1.8} aria-hidden />;
}
