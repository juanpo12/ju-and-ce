'use client';

import { useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import type { WordleHint, WordleMatch } from '@/lib/movie-night';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { Keyboard, type KeyState } from '../Keyboard';
import type { Table } from '../types';

const WORD_LENGTH = 5;

const COLOR: Record<WordleHint, string> = {
  hit: 'bg-acento text-sobre-acento border-acento',
  near: 'bg-acento-suave text-tinta border-acento',
  miss: 'bg-borde/60 text-tinta-suave border-borde',
};

/**
 * The same word for both, each on their own. You see your own letters; of the
 * other person only the colors: how close they are getting without giving
 * anything away.
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
  const [shaking, setShaking] = useState(0);

  const letter = useCallback(
    (l: string) => setCurrent((c) => (c.length < WORD_LENGTH ? c + l.toLowerCase() : c)),
    [],
  );
  const backspace = useCallback(() => setCurrent((c) => c.slice(0, -1)), []);
  const submit = useCallback(() => {
    if (current.length !== WORD_LENGTH || busy || done) {
      if (current.length !== WORD_LENGTH) setShaking((s) => s + 1);
      return;
    }
    const attempt = current;
    void send(() => playAction(night.id, { game: 'wordle', attempt })).then(() => {
      // If the server rejected it, the attempt is not in the list: keep it typed so it can be fixed.
      setCurrent((c) => (c === attempt ? '' : c));
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

  const myRows = Array.from({ length: match.maxAttempts }, (_, i) => mine[i] ?? null);

  return (
    <section>
      <GameHeader
        table={table}
        pending={pending}
        name="La palabra"
        detail={`Cinco letras, ${match.maxAttempts} intentos. Menos intentos gana.`}
      />

      <div className="mb-4 flex items-start justify-center gap-5">
        {/* My grid, with letters. */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="flex items-center gap-1 text-xs text-tinta-suave">
            <Avatar persona={me} medida="chico" /> vos
          </span>
          <div className="flex flex-col gap-1">
            {myRows.map((row, i) => {
              const typing = !row && i === mine.length && !done;
              return (
                <motion.div
                  key={i}
                  className="flex gap-1"
                  animate={typing && shaking ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {Array.from({ length: WORD_LENGTH }, (_, k) => {
                    const l = row ? row.letters[k] : typing ? current[k] : undefined;
                    const hint = row?.hints[k];
                    return (
                      <motion.span
                        key={k}
                        initial={false}
                        animate={hint ? { rotateX: [90, 0] } : { rotateX: 0 }}
                        transition={{ delay: k * 0.08, duration: 0.3 }}
                        className={cn(
                          'flex size-10 items-center justify-center rounded-[calc(var(--radio)-6px)] border-2 font-cartel text-2xl uppercase leading-none sm:size-11',
                          hint ? COLOR[hint] : l ? 'border-tinta-suave/60 text-tinta' : 'border-borde text-tinta',
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
        </div>

        {/* The other person's grid, colors only. */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="flex items-center gap-1 text-xs text-tinta-suave">
            <Avatar persona={other} medida="chico" /> {other.nombre}
          </span>
          <div className="flex flex-col gap-1" aria-label={`${other.nombre}: ${theirs.length} intentos`}>
            {Array.from({ length: match.maxAttempts }, (_, i) => (
              <div key={i} className="flex gap-1">
                {Array.from({ length: WORD_LENGTH }, (_, k) => {
                  const hint = theirs[i]?.hints[k];
                  return (
                    <span
                      key={k}
                      className={cn('size-4 rounded-[3px] border sm:size-5', hint ? COLOR[hint] : 'border-borde')}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          {match.result[other.id] && (
            <p className="text-xs text-tinta-suave">
              {match.result[other.id] === 'solved' ? `La sacó en ${theirs.length}` : 'No la sacó'}
            </p>
          )}
        </div>
      </div>

      {done ? (
        <p className="mb-4 text-center text-sm text-tinta-suave" aria-live="polite">
          {match.result[me.id] === 'solved' ? `La sacaste en ${mine.length}. ` : 'Se te acabaron los intentos. '}
          Esperando a {other.nombre}…
        </p>
      ) : (
        <p className="mb-3 text-center text-xs text-tinta-suave">Escribí una palabra de cinco letras y tocá «Listo».</p>
      )}

      <Keyboard
        onLetter={letter}
        onBackspace={backspace}
        onEnter={submit}
        stateOf={stateOf}
        disabled={done || busy}
      />
    </section>
  );
}
