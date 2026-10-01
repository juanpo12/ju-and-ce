'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import type { TapRaceMatch } from '@/lib/movie-night';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import type { Table } from '../types';

/**
 * Ten seconds of tapping as fast as you can. The phone keeps the count and
 * the clock; the first tap starts it, and when time is up the total goes to
 * the server once. More taps wins.
 */
export function TapRace({
  table,
  match,
  pending,
}: {
  table: Table;
  match: TapRaceMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const reduced = useReducedMotion();
  const mine = match.counts[me.id];
  const theirs = match.counts[other.id];
  const finished = mine !== undefined;

  const [count, setCount] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [left, setLeft] = useState(match.seconds);
  const [bump, setBump] = useState(0);
  const sent = useRef(false);

  // The clock: a tick every 100 ms from the first tap, and the report when it runs out.
  useEffect(() => {
    if (startedAt === null || finished) return;
    const id = setInterval(() => {
      const remaining = Math.max(0, match.seconds - (Date.now() - startedAt) / 1000);
      setLeft(remaining);
      if (remaining === 0 && !sent.current) {
        sent.current = true;
        clearInterval(id);
        void send(() => playAction(night.id, { game: 'taps', count }));
      }
    }, 100);
    return () => clearInterval(id);
  }, [startedAt, finished, match.seconds, night.id, send, count]);

  const running = startedAt !== null && left > 0 && !finished;
  const over = startedAt !== null && left === 0;

  function tap() {
    if (finished || over || busy) return;
    if (startedAt === null) setStartedAt(Date.now());
    setCount((c) => c + 1);
    setBump((b) => b + 1);
  }

  return (
    <section>
      <GameHeader table={table} pending={pending} name="Carrera de taps" detail={`${match.seconds} segundos. Más toques gana.`} />

      <div className="mb-4 flex items-center justify-between text-xs text-tinta-suave">
        {[{ p: me, label: 'vos', n: finished ? mine : null }, { p: other, label: other.nombre, n: theirs ?? null }].map(({ p, label, n }) => (
          <span key={p.id} className="flex items-center gap-1.5">
            <Avatar persona={p} medida="chico" />
            <span className="font-semibold text-tinta">{label}</span>
            <span className="font-cartel text-xl leading-none" style={{ color: varColor(p.color) }}>
              {n ?? '—'}
            </span>
          </span>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="font-cartel text-6xl leading-none tabular-nums text-tinta" aria-live="off">
          {startedAt === null ? match.seconds.toFixed(1) : left.toFixed(1)}
        </p>

        <motion.button
          type="button"
          onClick={tap}
          disabled={finished || over || busy}
          animate={reduced ? undefined : { scale: bump ? [1.08, 1] : 1 }}
          transition={{ duration: 0.12 }}
          className={cn(
            'foco flex size-52 select-none flex-col items-center justify-center rounded-full bg-acento text-sobre-acento shadow-alta [touch-action:manipulation] disabled:opacity-60',
            running && 'ring-8 ring-acento/30',
          )}
          aria-label={finished ? `Terminaste con ${mine} toques` : running ? `${count} toques` : 'Tocá para empezar'}
        >
          <span className="font-cartel text-7xl leading-none tabular-nums">{finished ? mine : count}</span>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] opacity-85">
            {finished ? 'listo' : running ? 'toques' : 'tocá para empezar'}
          </span>
        </motion.button>

        <p className="min-h-5 text-center text-sm text-tinta-suave" aria-live="polite">
          {finished
            ? theirs === undefined
              ? `Hiciste ${mine}. Esperando a ${other.nombre}…`
              : 'Contando…'
            : over
              ? 'Se acabó el tiempo. Mandando…'
              : running
                ? '¡Dale, dale, dale!'
                : 'El reloj arranca con el primer toque.'}
        </p>
      </div>
    </section>
  );
}
