'use client';

import { AnimatePresence, motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import type { HigherLowerMatch } from '@/lib/movie-night';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import type { Table } from '../types';

const FACE: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
const face = (v: number) => FACE[v] ?? String(v);

/**
 * Same deck for both, each at their own pace: is the next card higher or
 * lower? One mistake ends your run. The longer run wins.
 */
export function HigherLower({
  table,
  match,
  pending,
}: {
  table: Table;
  match: HigherLowerMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const run = match.runs[me.id] ?? { seen: [match.first], streak: 0, done: false };
  const theirs = match.runs[other.id] ?? { seen: [match.first], streak: 0, done: false };
  const currentCard = run.seen[run.seen.length - 1]!;
  const remaining = match.length - run.seen.length;
  const lastWasWrong = run.done && run.seen.length < match.length;

  return (
    <section>
      <GameHeader table={table} pending={pending} name="Mayor o menor" detail="¿La próxima carta es más alta o más baja? Un error y se corta la racha." />

      <div className="mb-4 flex items-center justify-between text-xs text-tinta-suave">
        {[{ p: me, r: run, label: 'vos' }, { p: other, r: theirs, label: other.nombre }].map(({ p, r, label }) => (
          <span key={p.id} className="flex items-center gap-1.5">
            <Avatar persona={p} medida="chico" />
            <span className="font-semibold text-tinta">{label}</span>
            <span className="font-cartel text-xl leading-none" style={{ color: varColor(p.color) }}>
              {r.streak}
            </span>
            {r.done && <span>· {r.seen.length === match.length ? 'llegó al final' : 'se cortó'}</span>}
          </span>
        ))}
      </div>

      {/* The cards seen so far, the current one big. */}
      <div className="flex items-end justify-center gap-1.5 overflow-x-auto py-2 [scrollbar-width:none]">
        {run.seen.map((v, i) => {
          const isLast = i === run.seen.length - 1;
          const wrong = isLast && lastWasWrong;
          return (
            <motion.div
              key={i}
              layout
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
              className={cn(
                'flex shrink-0 flex-col justify-between rounded-[calc(var(--radio)-4px)] border bg-superficie-alta font-cartel shadow-baja',
                isLast ? 'h-28 w-20 border-acento p-2 text-4xl text-tinta shadow-alta' : 'h-14 w-10 border-borde p-1 text-lg text-tinta-suave',
                wrong && 'border-tinta-suave opacity-70',
              )}
              aria-label={`Carta ${face(v)}`}
            >
              <span className="leading-none">{face(v)}</span>
              <span className="self-end leading-none">{face(v)}</span>
            </motion.div>
          );
        })}
        {Array.from({ length: Math.max(0, remaining) }, (_, i) => (
          <div key={`back-${i}`} className="h-14 w-10 shrink-0 rounded-[calc(var(--radio)-4px)] border border-dashed border-borde bg-acento-suave/40" aria-hidden />
        ))}
      </div>

      <div className="mt-4 flex min-h-14 flex-col items-center justify-center gap-2 text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {run.done ? (
            <motion.p key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-tinta-suave">
              {run.seen.length === match.length ? `Llegaste al final con ${run.streak}. ` : `Se cortó en ${run.streak}. `}
              {theirs.done ? 'Contando…' : `Esperando a ${other.nombre}…`}
            </motion.p>
          ) : (
            <motion.div key="guess" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
              <p className="text-sm text-tinta-suave">
                Tenés un {face(currentCard)}. ¿La próxima es…?
              </p>
              <div className="flex gap-2">
                <Boton onClick={() => send(() => playAction(night.id, { game: 'mayormenor', guess: 'higher' }))} disabled={busy} className="h-11 px-5">
                  <Arrow up /> Más alta
                </Boton>
                <Boton variante="secundario" onClick={() => send(() => playAction(night.id, { game: 'mayormenor', guess: 'lower' }))} disabled={busy} className="h-11 px-5">
                  <Arrow /> Más baja
                </Boton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Arrow({ up = false }: { up?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-4', up && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}
