'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import type { PosterGuessMatch } from '@/lib/movie-night';
import { urlPoster } from '@/lib/tmdb-url';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import type { Table } from '../types';

/** Blur per stage, from a smudge to the real poster. */
const BLUR_PX = [28, 18, 10, 4, 0];

/**
 * A poster from the library, blurred, getting clearer every few seconds on
 * both phones at once (the clock is the server's start time). First right
 * title wins; a few tries each.
 */
export function PosterGuess({
  table,
  match,
  pending,
}: {
  table: Table;
  match: PosterGuessMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const mine = match.guesses[me.id] ?? [];
  const theirs = match.guesses[other.id] ?? [];
  const left = match.maxGuesses - mine.length;
  const out = left <= 0;
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // The stage follows the wall clock so both phones reveal in step.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const stageMs = match.stageSeconds * 1000;
  const elapsed = Math.max(0, now - match.startedAt);
  const stage = Math.min(match.stages - 1, Math.floor(elapsed / stageMs));
  const lastStage = stage === match.stages - 1;
  const progress = lastStage ? 1 : (elapsed - stage * stageMs) / stageMs;
  const blur = BLUR_PX[Math.min(stage, BLUR_PX.length - 1)] ?? 0;
  const src = urlPoster(match.posterPath, 'w342');

  function guess(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || busy || out) return;
    void send(() => playAction(night.id, { game: 'poster', guess: value }), { quiet: true }).then((rejected) => {
      if (rejected) setError(rejected);
      else {
        setError(null);
        setText('');
      }
    });
  }

  return (
    <section>
      <GameHeader
        table={table}
        pending={pending}
        name="Adiviná el póster"
        detail={match.hint ? `Pista: ${match.hint}` : 'Una peli que ya vieron'}
      />

      <div className="flex flex-col items-center gap-3">
        <div className="relative w-48 overflow-hidden rounded-tema bg-acento-suave shadow-alta sm:w-56">
          {src && (
            <motion.img
              src={src}
              alt="Póster para adivinar"
              className="aspect-[2/3] w-full object-cover"
              style={{ imageRendering: lastStage ? 'auto' : 'pixelated' }}
              animate={{ filter: `blur(${blur}px)`, scale: lastStage ? 1 : 1.08 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              draggable={false}
            />
          )}
          {/* Countdown to the next stage, along the bottom edge. */}
          {!lastStage && (
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-1.5 bg-superficie/50">
              <span className="block h-full bg-acento transition-[width] duration-1000 ease-linear" style={{ width: `${progress * 100}%` }} />
            </span>
          )}
        </div>
        <p className="text-xs text-tinta-suave" aria-live="polite">
          {lastStage ? 'Ya se ve entera' : `Se aclara en ${Math.ceil((1 - progress) * match.stageSeconds)} s`}
          {' · '}
          {match.stages - 1 - stage} {match.stages - 1 - stage === 1 ? 'paso más' : 'pasos más'}
        </p>

        {out ? (
          <p className="text-center text-sm text-tinta-suave" aria-live="polite">
            Se te acabaron los intentos. Esperando a {other.nombre}…
          </p>
        ) : (
          <form onSubmit={guess} className="flex w-full max-w-sm flex-col gap-2">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setError(null);
                }}
                placeholder="¿Qué peli es?"
                aria-label="Tu respuesta"
                disabled={busy}
                className="foco min-w-0 flex-1 rounded-tema border border-borde bg-fondo px-3 py-2.5 text-base text-tinta outline-none"
              />
              <Boton type="submit" disabled={busy || !text.trim()} className="h-11 shrink-0">
                Adivinar
              </Boton>
            </div>
            <div className="flex items-center justify-between text-xs text-tinta-suave">
              <AnimatePresence mode="wait">
                {error ? (
                  <motion.span key={error} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-semibold text-acento">
                    {error}
                  </motion.span>
                ) : (
                  <motion.span key="left" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    Te {left === 1 ? 'queda' : 'quedan'} {left} {left === 1 ? 'intento' : 'intentos'}
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="flex items-center gap-1">
                <Avatar persona={other} medida="chico" />
                {theirs.length === 0 ? 'todavía no probó' : `${theirs.length} ${theirs.length === 1 ? 'intento' : 'intentos'}`}
              </span>
            </div>
          </form>
        )}

        {mine.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-1.5" aria-label="Tus intentos">
            {mine.map((g, i) => (
              <li
                key={i}
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-xs',
                  g.hit ? 'border-acento text-tinta' : 'border-borde text-tinta-suave line-through',
                )}
              >
                {g.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
