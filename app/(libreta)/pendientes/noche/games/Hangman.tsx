'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import { DialogoAdaptable } from '@/components/DialogoAdaptable';
import type { HangmanMatch, HangmanRun } from '@/lib/movie-night';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { Keyboard, type KeyState } from '../Keyboard';
import type { Table } from '../types';

/**
 * A title from the library, both racing to guess it on their own copy. The
 * screen is yours: your tiles, your gallows, your keyboard. Of the other person
 * you see how far they got, as filled tiles without letters.
 */
export function Hangman({
  table,
  match,
  pending,
}: {
  table: Table;
  match: HangmanMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const empty: HangmanRun = { mask: match.pattern, letters: [], misses: 0, done: false };
  const run = match.runs[me.id] ?? empty;
  const theirs = match.runs[other.id] ?? empty;
  const [guessing, setGuessing] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const letter = useCallback(
    (l: string) => {
      if (run.done || busy) return;
      setError(null);
      void send(() => playAction(night.id, { game: 'ahorcado', letter: l }), { quiet: true }).then((rejected) => {
        if (rejected) setError(rejected);
      });
    },
    [run.done, busy, send, night.id],
  );

  function guess() {
    if (!text.trim()) return;
    setGuessing(false);
    void send(() => playAction(night.id, { game: 'ahorcado', guess: text }));
    setText('');
  }

  const stateOf = (l: string): KeyState | undefined => {
    const played = run.letters.find((x) => x.letter === l);
    return played ? (played.hit ? 'used-hit' : 'used-miss') : undefined;
  };

  const found = (r: HangmanRun) => [...r.mask].filter((c) => /[A-ZÑ]/.test(c)).length;
  const total = [...match.pattern].filter((c) => c === '_').length;
  const left = match.maxMisses - run.misses;

  return (
    <section>
      <GameHeader
        table={table}
        pending={pending}
        name="Ahorcado"
        detail="Cada uno adivina por su lado. El primero que lo completa gana."
      />

      {match.hint && (
        <p className="mb-3 text-center text-sm text-tinta-suave">
          Pista: <span className="font-semibold text-tinta">{match.hint}</span>
        </p>
      )}

      <div className="tarjeta flex items-center gap-4 p-4">
        <Gallows misses={run.misses} max={match.maxMisses} color={varColor(me.color)} />
        <div className="min-w-0 flex-1">
          <Tiles mask={run.mask} big />
          <p className="mt-3 text-xs text-tinta-suave" aria-live="polite">
            {run.done
              ? run.guess && !run.guess.hit
                ? `Arriesgaste «${run.guess.text}» y no era. Quedaste afuera.`
                : 'Te ahorcaste. Quedaste afuera.'
              : `${found(run)} de ${total} letras · ${left === 1 ? 'te queda 1 error' : `te quedan ${left} errores`}`}
          </p>
        </div>
      </div>

      <div className="mt-2 min-h-5 text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {error && (
            <motion.p key={error} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm font-semibold text-acento">
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* The other person's race, letters hidden. */}
      <div className="tarjeta mb-4 flex items-center gap-3 px-3 py-2">
        <Avatar persona={other} />
        <div className="min-w-0 flex-1 text-xs text-tinta-suave">
          <span className="block font-semibold text-tinta">{other.nombre}</span>
          {theirs.done
            ? 'Quedó afuera'
            : `${found(theirs)} de ${total} letras · ${theirs.misses} ${theirs.misses === 1 ? 'error' : 'errores'}`}
        </div>
        <Tiles mask={theirs.mask} hidden />
      </div>

      {run.done ? (
        <p className="py-6 text-center text-sm text-tinta-suave">
          {theirs.done ? 'Nadie lo sacó: lo define la moneda…' : `${other.nombre} sigue intentando…`}
        </p>
      ) : (
        <>
          <div className="mb-3 flex justify-end">
            <Boton variante="secundario" className="h-9 px-3 text-xs" disabled={busy} onClick={() => setGuessing(true)}>
              Arriesgar el título
            </Boton>
          </div>
          <Keyboard onLetter={letter} stateOf={stateOf} disabled={busy} />
        </>
      )}

      <DialogoAdaptable
        abierto={guessing}
        onCambio={setGuessing}
        titulo="Arriesgar el título"
        descripcion="Si acertás, ganás. Si no, quedás afuera."
      >
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            guess();
          }}
        >
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="El título completo"
            className="foco rounded-tema border border-borde bg-fondo px-3 py-2.5 text-base text-tinta outline-none"
          />
          <div className="flex justify-end gap-2">
            <Boton type="button" variante="fantasma" onClick={() => setGuessing(false)}>
              Mejor no
            </Boton>
            <Boton type="submit" disabled={!text.trim()}>
              Arriesgo
            </Boton>
          </div>
        </form>
      </DialogoAdaptable>
    </section>
  );
}

/**
 * The title as tiles, one per letter, grouped by word. `hidden` draws the other
 * person's progress: filled where they found a letter, without saying which.
 */
function Tiles({ mask, big = false, hidden = false }: { mask: string; big?: boolean; hidden?: boolean }) {
  const words = mask.split(' ');
  return (
    <div className={cn('flex flex-wrap', big ? 'gap-x-3 gap-y-2' : 'max-w-32 justify-end gap-x-1.5 gap-y-1')} aria-label={hidden ? undefined : `Título: ${mask}`}>
      {words.map((word, wi) => (
        <span key={wi} className={cn('flex', big ? 'gap-1' : 'gap-0.5')}>
          {[...word].map((c, ci) => {
            const isLetter = /[A-ZÑ_]/.test(c);
            const found = isLetter && c !== '_';
            if (hidden) {
              return (
                <span
                  key={ci}
                  className={cn('rounded-[2px] border', isLetter ? 'size-2.5' : 'size-2.5 border-transparent', found ? 'border-acento bg-acento' : isLetter && 'border-borde')}
                />
              );
            }
            return (
              <motion.span
                key={ci}
                initial={false}
                animate={found ? { scale: [1.25, 1] } : { scale: 1 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  'flex items-end justify-center font-cartel leading-none',
                  isLetter ? 'h-9 min-w-6 border-b-2 text-2xl sm:h-10 sm:min-w-7 sm:text-3xl' : 'h-9 min-w-3 text-xl text-tinta-suave sm:h-10',
                  found ? 'border-acento text-tinta' : isLetter ? 'border-tinta-suave/50 text-transparent' : 'border-transparent',
                )}
              >
                {c === '_' ? '' : c}
              </motion.span>
            );
          })}
        </span>
      ))}
    </div>
  );
}

/** The gallows, one part per miss, in the player's color. */
function Gallows({ misses, max, color }: { misses: number; max: number; color: string }) {
  const parts = [
    <circle key="head" cx="30" cy="20" r="5" />,
    <path key="body" d="M30 25v15" />,
    <path key="arm-l" d="M30 29l-7 6" />,
    <path key="arm-r" d="M30 29l7 6" />,
    <path key="leg-l" d="M30 40l-6 9" />,
    <path key="leg-r" d="M30 40l6 9" />,
  ];
  const visible = Math.round((misses / max) * parts.length);
  return (
    <svg
      viewBox="0 0 48 60"
      className="h-28 w-20 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={`${misses} de ${max} errores`}
      style={{ color }}
    >
      <path d="M4 56h26M10 56V6h20v9" className="text-tinta-suave" />
      {parts.slice(0, visible).map((p, i) => (
        <motion.g key={i} initial={{ opacity: 0, pathLength: 0 }} animate={{ opacity: 1, pathLength: 1 }} transition={{ duration: 0.35 }}>
          {p}
        </motion.g>
      ))}
    </svg>
  );
}
