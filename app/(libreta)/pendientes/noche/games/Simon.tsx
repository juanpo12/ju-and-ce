'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import type { SimonMatch } from '@/lib/movie-night';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import type { Table } from '../types';

const STEP_MS = 450;
/** Four pads, four theme tokens: they stay distinct in every theme and mode. */
const PADS = ['var(--acento)', 'var(--durazno)', 'var(--menta)', 'var(--tinta-suave)'];
const PAD_NAMES = ['uno', 'dos', 'tres', 'cuatro'];

/**
 * Four pads light up in a sequence that grows one step per level. Watch it,
 * repeat it. Each one plays on their own; the server checks the whole input
 * when it is complete, so a slip only shows once you finish the level.
 */
export function Simon({
  table,
  match,
  pending,
}: {
  table: Table;
  match: SimonMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const run = match.runs[me.id] ?? { reached: 0, done: false };
  const theirs = match.runs[other.id] ?? { reached: 0, done: false };
  const level = run.reached + 1;
  const target = match.sequence.slice(0, level);

  const [lit, setLit] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [input, setInput] = useState<number[]>([]);
  const [shown, setShown] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // A new level: the input resets and the sequence has to be watched again.
  useEffect(() => {
    setInput([]);
    setShown(false);
  }, [run.reached]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function play() {
    if (playing || run.done) return;
    setPlaying(true);
    setInput([]);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    target.forEach((pad, i) => {
      timers.current.push(setTimeout(() => setLit(pad), i * STEP_MS));
      timers.current.push(setTimeout(() => setLit(null), i * STEP_MS + STEP_MS * 0.65));
    });
    timers.current.push(
      setTimeout(() => {
        setPlaying(false);
        setShown(true);
      }, target.length * STEP_MS),
    );
  }

  function tap(pad: number) {
    if (playing || run.done || busy || !shown) return;
    setLit(pad);
    timers.current.push(setTimeout(() => setLit(null), 180));
    const next = [...input, pad];
    setInput(next);
    if (next.length === target.length) {
      void send(() => playAction(night.id, { game: 'simon', input: next }));
    }
  }

  return (
    <section>
      <GameHeader table={table} pending={pending} name="Simón dice" detail="Mirá la secuencia y repetila. Cada nivel suma un paso." />

      <div className="mb-4 flex items-center justify-between text-xs text-tinta-suave">
        {[{ p: me, r: run, label: 'vos' }, { p: other, r: theirs, label: other.nombre }].map(({ p, r, label }) => (
          <span key={p.id} className="flex items-center gap-1.5">
            <Avatar persona={p} medida="chico" />
            <span className="font-semibold text-tinta">{label}</span>
            <span className="font-cartel text-xl leading-none" style={{ color: varColor(p.color) }}>
              {r.reached}
            </span>
            {r.done && <span>· {r.reached === match.sequence.length ? 'completó todo' : 'se cortó'}</span>}
          </span>
        ))}
      </div>

      <div className="mx-auto grid w-full max-w-xs grid-cols-2 gap-3" role="group" aria-label="Botones">
        {PADS.map((color, i) => (
          <motion.button
            key={i}
            type="button"
            disabled={playing || run.done || busy || !shown}
            onClick={() => tap(i)}
            aria-label={`Botón ${PAD_NAMES[i]}`}
            animate={{ scale: lit === i ? 1.06 : 1, opacity: lit === i ? 1 : 0.55 }}
            transition={{ duration: 0.12 }}
            className={cn(
              'foco aspect-square rounded-tema shadow-baja disabled:cursor-default',
              lit === i && 'shadow-alta',
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="mt-5 flex min-h-14 flex-col items-center justify-center gap-2 text-center" aria-live="polite">
        {run.done ? (
          <p className="text-sm text-tinta-suave">
            {run.reached === match.sequence.length ? `Completaste los ${run.reached}. ` : `Llegaste al nivel ${run.reached}. `}
            {theirs.done ? 'Contando…' : `Esperando a ${other.nombre}…`}
          </p>
        ) : playing ? (
          <p className="text-sm text-tinta-suave">Mirá bien…</p>
        ) : shown ? (
          <p className="text-sm text-tinta-suave">
            Nivel {level}: repetila. {input.length} de {target.length}
          </p>
        ) : (
          <>
            <p className="text-sm text-tinta-suave">Nivel {level}</p>
            <Boton onClick={play} disabled={busy} className="h-11 px-6">
              Ver la secuencia
            </Boton>
          </>
        )}
      </div>
    </section>
  );
}
