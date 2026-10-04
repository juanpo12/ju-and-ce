'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar } from '@/components/Avatar';
import type { ConocerMatch, ConocerRound } from '@/lib/games/conocer';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

export const meta = {
  description: 'Uno contesta sobre sí mismo, el otro adivina qué eligió. Seis preguntas: ¿quién conoce más a quién?',
  icon: (
    <>
      <path d="M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z" />
      <path d="M10.3 11.2a1.8 1.8 0 1 1 2.6 1.6c-.6.3-.9.7-.9 1.3M12 16.2v.01" />
    </>
  ),
};

const REVEAL_MS = 2800;
const MATCH_LINES = ['¡Coincidieron!', '¡Leído como un libro!', '¡Conexión total!', '¡Te tiene re junado!', '¡Mente a mente!', '¡Bingo!'];
const MISS_LINES = ['Casi…', 'Ups, no era esa.', 'Hay cosas por descubrir.', 'Plot twist.', 'Nop, sorpresa.', 'Para la próxima.'];

/**
 * A question about one of the two: the subject answers for real, the other
 * guesses; neither choice is seen until both are in. Then both answers show
 * side by side, with a cheer when they match.
 */
export function KnowMe({ table, match, pending }: { table: Table; match: ConocerMatch; pending: Pendiente[] }) {
  const { me, other, play, busy } = table;
  const round = match.rounds[match.rounds.length - 1]!;
  const resolved = match.rounds.filter((r) => r.answer !== undefined);

  const [revealed, setRevealed] = useState(resolved.length);
  const revealing = resolved.length > revealed;
  useEffect(() => {
    if (!revealing) return;
    const id = setTimeout(() => setRevealed(resolved.length), REVEAL_MS);
    return () => clearTimeout(id);
  }, [revealing, resolved.length]);
  const last = resolved[resolved.length - 1];

  const iAmSubject = round.subject === me.id;
  const iChose = round.chosen.includes(me.id);
  const otherChose = round.chosen.includes(other.id);

  return (
    <section>
      <GameHeader
        table={table}
        pending={pending}
        name="¿Cuánto me conocés?"
        detail={`Pregunta ${Math.min(match.rounds.length, match.total)} de ${match.total}`}
      />

      <div className="mb-4 flex items-center justify-center gap-6">
        {[me, other].map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <Avatar persona={p} />
            <span className="font-cartel text-2xl leading-none" style={{ color: varColor(p.color) }}>
              {match.score[p.id] ?? 0}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {revealing && last ? (
          <Reveal key={`reveal-${resolved.length}`} table={table} round={last} n={resolved.length} />
        ) : iChose ? (
          <motion.div
            key={`wait-${match.rounds.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="tarjeta flex flex-col items-center gap-2 px-4 py-8 text-center"
          >
            <span className="relative flex">
              <Avatar persona={other} medida="grande" vacio={!otherChose} />
              {!otherChose && <span aria-hidden className="absolute -inset-1.5 animate-ping rounded-full border-2 border-acento opacity-50" />}
            </span>
            <p className="font-titulo text-2xl text-tinta">
              {iAmSubject ? `${other.nombre} está tratando de adivinar…` : `Esperando que ${other.nombre} conteste…`}
            </p>
            <p className="text-xs text-tinta-suave">Tu elección queda escondida hasta que elijan los dos.</p>
          </motion.div>
        ) : (
          <motion.div
            key={`ask-${match.rounds.length}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="text-center">
              <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-tinta-suave">
                <Avatar persona={iAmSubject ? me : other} medida="chico" />
                {iAmSubject ? 'Sobre vos' : `Sobre ${other.nombre}`}
              </p>
              <p className="mt-2 font-titulo text-3xl leading-tight text-tinta">{iAmSubject ? toSecondPerson(round.question) : round.question}</p>
              <p className="mt-1 text-sm text-tinta-suave">
                {iAmSubject ? 'Contestá con la verdad.' : `¿Qué habrá elegido ${other.nombre}?`}
                {otherChose && (iAmSubject ? ` ${other.nombre} ya arriesgó.` : ` ${other.nombre} ya contestó.`)}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {round.options.map((option, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={busy}
                  onClick={() => play({ game: 'conocer', choice: i })}
                  className="foco tocable tarjeta flex items-center gap-3 px-4 py-3 text-left text-base text-tinta transition-colors hover:bg-acento-suave disabled:opacity-60"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-acento-suave font-cartel text-sm text-acento">
                    {'ABCD'[i]}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {resolved.length > 0 && !revealing && (
        <ol className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-tinta-suave" aria-label="Preguntas">
          {resolved.map((r, i) => {
            const guesser = personOf(table, r.guesser);
            const hit = r.answer === r.guess;
            return (
              <li key={i} className="flex items-center gap-1 rounded-full border border-borde px-2 py-0.5">
                {guesser && <Avatar persona={guesser} medida="chico" />}
                {hit ? 'acertó' : 'no acertó'}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/** «Su talento oculto» reads «Tu talento oculto» to the one it is about. */
function toSecondPerson(question: string) {
  return question.replace(/^Su /, 'Tu ').replace(/^Sus /, 'Tus ');
}

function Reveal({ table, round, n }: { table: Table; round: ConocerRound; n: number }) {
  const { me } = table;
  const subject = personOf(table, round.subject)!;
  const guesser = personOf(table, round.guesser)!;
  const hit = round.answer === round.guess;
  const line = (hit ? MATCH_LINES : MISS_LINES)[n % MATCH_LINES.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="tarjeta flex flex-col items-center gap-3 px-4 py-6 text-center"
    >
      <p className="text-sm text-tinta-suave">{round.question}</p>
      <div className="grid w-full grid-cols-2 gap-2">
        {[
          { who: subject, label: subject.id === me.id ? 'Vos elegiste' : `${subject.nombre} eligió`, value: round.answer! },
          { who: guesser, label: guesser.id === me.id ? 'Vos dijiste' : `${guesser.nombre} dijo`, value: round.guess! },
        ].map(({ who, label, value }, i) => (
          <motion.div
            key={i}
            initial={{ rotateY: 90 }}
            animate={{ rotateY: 0 }}
            transition={{ delay: 0.12 + i * 0.12, type: 'spring', bounce: 0.4 }}
            className="flex flex-col items-center gap-1.5 rounded-tema px-2 py-3 text-sobre-persona"
            style={{ backgroundColor: varColor(who.color) }}
          >
            <span className="text-xs opacity-90">{label}</span>
            <span className="font-titulo text-xl leading-tight">{round.options[value]}</span>
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={hit ? { scale: 0.6 } : { opacity: 0 }}
        animate={hit ? { scale: 1 } : { opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', bounce: 0.6 }}
        className={cn('font-titulo text-3xl', hit ? 'text-acento' : 'text-tinta')}
      >
        {line}
        {hit && ` +1 para ${guesser.id === me.id ? 'vos' : guesser.nombre}`}
      </motion.p>
    </motion.div>
  );
}
