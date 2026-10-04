'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import { cards, INKS, MAX_SCORE, type ColoresMatch, type Ink } from '@/lib/games/colores';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import type { Table } from '../types';

export const meta = {
  description: 'Palabras de colores pintadas de otro color: tocá el color de la tinta, no lo que dice. Veinte segundos cada uno.',
  icon: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" fill="currentColor" />
    </>
  ),
};

/**
 * The game's own four colors: the only fixed hex in the app, because the game
 * is about telling these exact colors apart. Picked to read on the dark board
 * and under dark text, in every theme and mode.
 */
const INK_HEX: Record<Ink, string> = {
  rojo: '#f05252',
  azul: '#4d8dff',
  verde: '#34c46a',
  amarillo: '#facc15',
};

/**
 * Twenty seconds on this phone: a color word painted in another ink, and four
 * buttons. Right +1, wrong −1. Both phones see the same cards (same seed); the
 * score goes to the server once, hidden until both played.
 */
export function Colors({ table, match, pending }: { table: Table; match: ColoresMatch; pending: Pendiente[] }) {
  const { me, other } = table;
  const iPlayed = match.done.includes(me.id);
  const otherPlayed = match.done.includes(other.id);

  return (
    <section>
      <GameHeader table={table} pending={pending} name="Colores" detail="Tocá la tinta, no la palabra" />
      {match.scores ? (
        <Results table={table} scores={match.scores} />
      ) : iPlayed ? (
        <div className="tarjeta flex flex-col items-center gap-2 px-4 py-8 text-center">
          <span className="relative flex">
            <Avatar persona={other} medida="grande" vacio={!otherPlayed} />
            <span aria-hidden className="absolute -inset-1.5 animate-ping rounded-full border-2 border-acento opacity-50" />
          </span>
          <p className="font-titulo text-2xl text-tinta">{`Esperando que juegue ${other.nombre}…`}</p>
          <p className="text-xs text-tinta-suave">Tu puntaje queda escondido hasta que jueguen los dos.</p>
        </div>
      ) : (
        <Round key={me.id} table={table} match={match} />
      )}
    </section>
  );
}

function Round({ table, match }: { table: Table; match: ColoresMatch }) {
  const { other, play, busy } = table;
  const reduced = useReducedMotion();
  const deck = useMemo(() => cards(match.seed, MAX_SCORE * 2), [match.seed]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [left, setLeft] = useState(match.seconds);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<{ n: number; right: boolean } | null>(null);
  const sent = useRef(false);
  const latest = useRef(score);
  latest.current = score;

  useEffect(() => {
    if (startedAt === null) return;
    const id = setInterval(() => {
      const remaining = Math.max(0, match.seconds - (Date.now() - startedAt) / 1000);
      setLeft(remaining);
      if (remaining === 0 && !sent.current) {
        sent.current = true;
        clearInterval(id);
        void play({ game: 'colores', score: Math.min(MAX_SCORE, latest.current) });
      }
    }, 100);
    return () => clearInterval(id);
  }, [startedAt, match.seconds, play]);

  const over = startedAt !== null && left === 0;
  const card = deck[index % deck.length]!;

  function answer(ink: Ink) {
    if (startedAt === null || over) return;
    const right = ink === card.ink;
    setScore((s) => Math.max(0, s + (right ? 1 : -1)));
    setFlash({ n: index, right });
    setIndex((i) => i + 1);
  }

  if (startedAt === null) {
    return (
      <div className="tarjeta flex flex-col items-center gap-4 px-4 py-8 text-center">
        <p className="font-titulo text-3xl leading-tight text-tinta">¿De qué color está pintada?</p>
        <div className="rounded-tema bg-zinc-900 px-6 py-3">
          <span className="font-cartel text-4xl tracking-wide" style={{ color: INK_HEX.azul }}>
            ROJO
          </span>
        </div>
        <p className="max-w-xs text-sm text-tinta-suave">
          Acá la respuesta es <strong className="text-tinta">azul</strong>. Acierto suma uno, error resta uno. Tenés{' '}
          {match.seconds} segundos{match.done.includes(other.id) ? `, y ${other.nombre} ya jugó` : ''}.
        </p>
        <Boton onClick={() => setStartedAt(Date.now())} disabled={busy} className="h-12 px-8 text-base">
          Empezar
        </Boton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-cartel text-2xl tabular-nums text-tinta">{score} puntos</span>
        <span className={cn('font-cartel text-2xl tabular-nums', left < 5 ? 'text-acento' : 'text-tinta-suave')}>
          {Math.ceil(left)} s
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-acento-suave" aria-hidden>
        <div className="h-full bg-acento transition-[width] duration-100" style={{ width: `${(left / match.seconds) * 100}%` }} />
      </div>

      <div
        className={cn(
          'relative flex h-36 items-center justify-center overflow-hidden rounded-tema bg-zinc-900 ring-4 transition-shadow',
          flash ? (flash.right ? 'ring-acento' : 'ring-[color:var(--destructive)]') : 'ring-transparent',
        )}
        aria-live="off"
      >
        {over ? (
          <span className="font-titulo text-3xl text-zinc-100">¡Tiempo!</span>
        ) : (
          <motion.span
            key={index}
            initial={reduced ? false : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.12 }}
            className="font-cartel text-6xl uppercase tracking-wide"
            style={{ color: INK_HEX[card.ink] }}
            aria-label={`La palabra ${card.word}`}
          >
            {card.word}
          </motion.span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {INKS.map((ink) => (
          <button
            key={ink}
            type="button"
            disabled={over}
            onPointerDown={() => answer(ink)}
            className="foco tocable flex h-20 touch-manipulation select-none items-center justify-center rounded-tema font-cartel text-2xl uppercase tracking-wide text-zinc-900 shadow-baja disabled:opacity-50"
            style={{ backgroundColor: INK_HEX[ink] }}
          >
            {ink}
          </button>
        ))}
      </div>
    </div>
  );
}

function Results({ table, scores }: { table: Table; scores: Record<string, number> }) {
  const { me, other } = table;
  return (
    <div className="tarjeta grid grid-cols-2 gap-3 px-4 py-6">
      {[me, other].map((p) => (
        <div key={p.id} className="flex flex-col items-center gap-1.5 rounded-tema border-2 px-2 py-3" style={{ borderColor: varColor(p.color) }}>
          <Avatar persona={p} />
          <span className="font-cartel text-4xl leading-none tabular-nums text-tinta">{scores[p.id] ?? 0}</span>
          <span className="text-xs text-tinta-suave">{p.id === me.id ? 'vos' : p.nombre}</span>
        </div>
      ))}
    </div>
  );
}
