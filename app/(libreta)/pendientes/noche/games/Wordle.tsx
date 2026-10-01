'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import type { WordleHint, WordleMatch } from '@/lib/movie-night';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { Keyboard, type KeyState } from '../Keyboard';
import type { Table } from '../types';

const WORD_LENGTH = 5;

const TILE: Record<WordleHint, string> = {
  hit: 'bg-acento text-sobre-acento border-acento',
  near: 'bg-acento-suave text-tinta border-acento',
  miss: 'bg-tinta-suave/15 text-tinta-suave border-transparent',
};

/**
 * The same word for both, each on their own. Your own grid is the big thing on
 * screen; of the other person you only see colors, so nothing is given away.
 * A rejected attempt stays typed, with the reason right under the grid.
 */
export function Wordle({
  table,
  match,
  pending,
}: {
  table: Table;
  match: WordleMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const mine = match.attempts[me.id] ?? [];
  const theirs = match.attempts[other.id] ?? [];
  const done = Boolean(match.result[me.id]);
  const [current, setCurrent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);

  // Only the row that just came back flips; older rows stay still.
  const revealed = useRef(mine.length);
  const [flipping, setFlipping] = useState<number | null>(null);
  useEffect(() => {
    if (mine.length > revealed.current) {
      revealed.current = mine.length;
      setFlipping(mine.length - 1);
    }
  }, [mine.length]);

  const letter = useCallback((l: string) => {
    setError(null);
    setCurrent((c) => (c.length < WORD_LENGTH ? c + l.toLowerCase() : c));
  }, []);
  const backspace = useCallback(() => {
    setError(null);
    setCurrent((c) => c.slice(0, -1));
  }, []);
  const submit = useCallback(() => {
    if (busy || done) return;
    if (current.length !== WORD_LENGTH) {
      setError('Tienen que ser cinco letras.');
      setShake((s) => s + 1);
      return;
    }
    const attempt = current;
    void send(() => playAction(night.id, { game: 'wordle', attempt }), { quiet: true }).then((rejected) => {
      if (rejected) {
        setError(rejected);
        setShake((s) => s + 1);
      } else {
        setCurrent('');
      }
    });
  }, [current, busy, done, send, night.id]);

  // What is already known about each letter, to paint the keyboard: the best hint so far.
  const stateOf = (l: string): KeyState | undefined => {
    const c = l.toLowerCase();
    let best: WordleHint | undefined;
    for (const a of mine) {
      [...a.letters].forEach((x, k) => {
        if (x !== c) return;
        const h = a.hints[k]!;
        if (h === 'hit' || (h === 'near' && best !== 'hit') || !best) best = h;
      });
    }
    return best;
  };

  const rows = Array.from({ length: match.maxAttempts }, (_, i) => mine[i] ?? null);
  const theirHits = theirs.length ? Math.max(...theirs.map((a) => a.hints.filter((h) => h === 'hit').length)) : 0;

  return (
    <section>
      <GameHeader
        table={table}
        pending={pending}
        name="La palabra"
        detail={`Cinco letras, ${match.maxAttempts} intentos. Menos intentos gana.`}
      />

      <div className="flex flex-col items-center gap-3">
        {/* My grid. */}
        <div className="flex flex-col gap-1.5" aria-label="Tus intentos">
          {rows.map((row, i) => {
            const typing = !row && i === mine.length && !done;
            return (
              <motion.div
                key={i}
                className="flex gap-1.5"
                animate={typing && shake ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
              >
                {Array.from({ length: WORD_LENGTH }, (_, k) => {
                  const l = row ? row.letters[k] : typing ? current[k] : undefined;
                  const hint = row?.hints[k];
                  const flip = flipping === i;
                  return (
                    <motion.span
                      key={k}
                      initial={false}
                      animate={flip ? { rotateX: [90, 0], scale: [1, 1.06, 1] } : typing && l ? { scale: [1.12, 1] } : { rotateX: 0, scale: 1 }}
                      transition={flip ? { delay: k * 0.12, duration: 0.35 } : { duration: 0.12 }}
                      className={cn(
                        'flex size-12 items-center justify-center rounded-[calc(var(--radio)-4px)] border-2 font-cartel text-3xl uppercase leading-none shadow-baja sm:size-14 sm:text-4xl',
                        hint
                          ? TILE[hint]
                          : typing
                            ? l
                              ? 'border-acento bg-superficie text-tinta'
                              : 'border-acento/50 bg-superficie text-tinta'
                            : 'border-borde bg-superficie/60 text-tinta',
                      )}
                    >
                      {l ?? ''}
                    </motion.span>
                  );
                })}
              </motion.div>
            );
          })}
        </div>

        <div className="min-h-6 text-center" aria-live="polite">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.p key={error} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm font-semibold text-acento">
                {error}
              </motion.p>
            ) : done ? (
              <motion.p key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-tinta-suave">
                {match.result[me.id] === 'solved' ? `La sacaste en ${mine.length}. ` : 'Se te acabaron los intentos. '}
                Esperando a {other.nombre}…
              </motion.p>
            ) : (
              <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-tinta-suave">
                Escribí cinco letras y tocá «Listo».
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* The other person's progress: colors only. */}
        <div className="tarjeta flex w-full max-w-sm items-center gap-3 px-3 py-2">
          <Avatar persona={other} />
          <div className="min-w-0 flex-1 text-xs text-tinta-suave">
            <span className="block font-semibold text-tinta">{other.nombre}</span>
            {match.result[other.id] === 'solved'
              ? `La sacó en ${theirs.length}`
              : match.result[other.id] === 'failed'
                ? 'No la sacó'
                : theirs.length === 0
                  ? 'Todavía no probó'
                  : `${theirs.length} ${theirs.length === 1 ? 'intento' : 'intentos'} · ${theirHits} en su lugar`}
          </div>
          <div className="flex flex-col gap-0.5" aria-label={`${other.nombre}: ${theirs.length} intentos`}>
            {Array.from({ length: match.maxAttempts }, (_, i) => (
              <div key={i} className="flex gap-0.5">
                {Array.from({ length: WORD_LENGTH }, (_, k) => {
                  const hint = theirs[i]?.hints[k];
                  return (
                    <span
                      key={k}
                      className={cn('size-2.5 rounded-[2px] border', hint ? TILE[hint] : 'border-borde')}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full pt-1">
          <Keyboard
            onLetter={letter}
            onBackspace={backspace}
            onEnter={submit}
            stateOf={stateOf}
            disabled={done || busy}
          />
        </div>
      </div>
    </section>
  );
}
