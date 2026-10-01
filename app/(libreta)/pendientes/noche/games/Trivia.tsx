'use client';

import { AnimatePresence, motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Poster } from '@/components/Poster';
import type { TriviaMatch } from '@/lib/movie-night';
import { varColor } from '@/lib/personas';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import type { Table } from '../types';

/**
 * Five questions about what they already watched. Each one answers at their
 * own pace; nobody learns whether they were right until both finished, so the
 * second one cannot copy.
 */
export function Trivia({
  table,
  match,
  pending,
}: {
  table: Table;
  match: TriviaMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const mine = match.answers[me.id] ?? [];
  const theirs = match.answers[other.id] ?? [];
  const total = match.questions.length;
  const done = mine.length >= total;
  const question = match.questions[mine.length];

  return (
    <section>
      <GameHeader table={table} pending={pending} name="Trivia de la libreta" detail={`${total} preguntas sobre lo que ya vieron.`} />

      <div className="mb-4 flex items-center justify-between text-xs text-tinta-suave">
        <Progress label="vos" color={varColor(me.color)} answered={mine.length} total={total} />
        <Progress label={other.nombre} color={varColor(other.color)} answered={theirs.length} total={total} />
      </div>

      <AnimatePresence mode="wait">
        {done || !question ? (
          <motion.section key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tarjeta flex flex-col items-center gap-2 px-6 py-10 text-center">
            <span className="relative flex">
              <Avatar persona={other} medida="grande" vacio={theirs.length < total} />
              {theirs.length < total && (
                <span aria-hidden className="absolute -inset-1.5 animate-ping rounded-full border-2 border-acento opacity-50" />
              )}
            </span>
            <p className="font-titulo text-2xl text-tinta">Respondiste las {total}</p>
            <p className="text-sm text-tinta-suave">
              {theirs.length < total ? `${other.nombre} va por la ${theirs.length + 1}…` : 'Contando…'}
            </p>
          </motion.section>
        ) : (
          <motion.section
            key={mine.length}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            <div className="tarjeta flex items-center gap-4 p-4">
              {question.about && (
                <div className="w-16 shrink-0 overflow-hidden rounded-[calc(var(--radio)-4px)] shadow-baja sm:w-20">
                  <Poster path={question.about.posterPath} titulo={question.about.title} anio={question.about.year} tamano="chico" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs text-tinta-suave">
                  Pregunta {mine.length + 1} de {total}
                </p>
                <p className="mt-1 font-titulo text-2xl leading-tight text-tinta">{question.text}</p>
              </div>
            </div>

            <ul className="grid gap-2 sm:grid-cols-2">
              {question.options.map((option, i) => (
                <li key={i}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => send(() => playAction(night.id, { game: 'trivia', answer: i }))}
                    className="foco tocable tarjeta flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-tinta transition-colors hover:bg-acento-suave disabled:opacity-60"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-acento-suave font-cartel text-base text-acento">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="min-w-0 flex-1">{option}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.section>
        )}
      </AnimatePresence>
    </section>
  );
}

function Progress({ label, color, answered, total }: { label: string; color: string; answered: number; total: number }) {
  return (
    <span className="flex items-center gap-1.5" aria-label={`${label}: ${answered} de ${total}`}>
      <span className="font-semibold text-tinta">{label}</span>
      <span className="flex gap-0.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="size-2.5 rounded-full border"
            style={{ borderColor: color, backgroundColor: i < answered ? color : 'transparent' }}
          />
        ))}
      </span>
    </span>
  );
}
