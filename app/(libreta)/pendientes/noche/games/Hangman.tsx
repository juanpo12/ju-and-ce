'use client';

import { useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import { DialogoAdaptable } from '@/components/DialogoAdaptable';
import type { HangmanMatch } from '@/lib/movie-night';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { Keyboard, type KeyState } from '../Keyboard';
import { personOf, type Table } from '../types';

/**
 * A title from the library, both guessing the same one in turns. The mask
 * comes from the server; here we only draw the gallows from the miss count and
 * send the letter (or the full guess) when it is our turn.
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
  const myTurn = match.turn === me.id;
  const [guessing, setGuessing] = useState(false);
  const [text, setText] = useState('');

  const letter = useCallback(
    (l: string) => {
      if (!myTurn || busy) return;
      void send(() => playAction(night.id, { game: 'ahorcado', letter: l }));
    },
    [myTurn, busy, send, night.id],
  );

  function guess() {
    if (!text.trim()) return;
    setGuessing(false);
    void send(() => playAction(night.id, { game: 'ahorcado', guess: text }));
  }

  const stateOf = (l: string): KeyState | undefined => {
    const played = match.letters.find((x) => x.letter === l);
    return played ? (played.hit ? 'used-hit' : 'used-miss') : undefined;
  };

  const words = match.mask.split(' ');
  const whoseTurn = personOf(table, match.turn);

  return (
    <section>
      <GameHeader
        table={table}
        pending={pending}
        name="Ahorcado"
        detail={match.hint ? `Pista: ${match.hint}` : 'Una peli que ya vieron'}
      />

      <div className="tarjeta mb-4 flex items-center gap-4 p-4">
        <Gallows misses={match.misses} maxMisses={match.maxMisses} />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-tinta-suave">
            {match.misses} de {match.maxMisses} errores
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2" aria-label={`Título: ${match.mask}`}>
            {words.map((word, wi) => (
              <span key={wi} className="flex gap-1">
                {[...word].map((c, ci) => (
                  <motion.span
                    key={`${wi}-${ci}`}
                    initial={false}
                    animate={{ scale: c === '_' ? 1 : [1.25, 1] }}
                    className={cn(
                      'flex h-8 min-w-5 items-end justify-center border-b-2 font-cartel text-2xl leading-none text-tinta',
                      c === '_' ? 'border-tinta-suave/60' : /[A-ZÑ]/.test(c) ? 'border-acento' : 'border-transparent',
                    )}
                  >
                    {c === '_' ? '' : c}
                  </motion.span>
                ))}
              </span>
            ))}
          </div>
          {match.letters.some((l) => !l.hit) && (
            <p className="mt-3 text-xs text-tinta-suave">
              No está: {match.letters.filter((l) => !l.hit).map((l) => l.letter).join(' ')}
            </p>
          )}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={whoseTurn ? { backgroundColor: varColor(whoseTurn.color), color: 'var(--sobre-persona)' } : undefined}
          aria-live="polite"
        >
          {myTurn ? 'Te toca una letra' : `Le toca a ${other.nombre}`}
        </p>
        <Boton variante="secundario" className="h-9 px-3 text-xs" disabled={!myTurn || busy} onClick={() => setGuessing(true)}>
          Arriesgar el título
        </Boton>
      </div>

      <Keyboard onLetter={letter} stateOf={stateOf} disabled={!myTurn || busy} />

      {match.letters.length > 0 && (
        <ol className="mt-4 flex flex-wrap justify-center gap-1" aria-label="Letras que salieron">
          {match.letters.map((l, i) => {
            const who = personOf(table, l.by);
            return (
              <li
                key={i}
                className={cn(
                  'flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-cartel text-sm',
                  l.hit ? 'border-acento text-tinta' : 'border-borde text-tinta-suave line-through',
                )}
              >
                {who && <Avatar persona={who} medida="chico" />}
                {l.letter}
              </li>
            );
          })}
        </ol>
      )}

      <DialogoAdaptable
        abierto={guessing}
        onCambio={setGuessing}
        titulo="Arriesgar el título"
        descripcion="Si acertás, ganás. Si no, gana el otro."
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

/** The gallows is drawn piece by piece: one per miss. Ink strokes, like everything else. */
function Gallows({ misses, maxMisses }: { misses: number; maxMisses: number }) {
  const pieces = [
    <path key="head" d="M30 22a4 4 0 1 0 0.01 0" />,
    <path key="body" d="M30 30v14" />,
    <path key="left-arm" d="M30 33l-6 6" />,
    <path key="right-arm" d="M30 33l6 6" />,
    <path key="left-leg" d="M30 44l-5 8" />,
    <path key="right-leg" d="M30 44l5 8" />,
  ];
  const visible = Math.round((misses / maxMisses) * pieces.length);
  return (
    <svg
      viewBox="0 0 48 60"
      className="h-24 w-20 shrink-0 text-tinta"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 56h24M10 56V6h20v8" className="text-tinta-suave" />
      {pieces.slice(0, visible).map((p, i) => (
        <motion.g key={i} initial={{ opacity: 0, pathLength: 0 }} animate={{ opacity: 1, pathLength: 1 }} transition={{ duration: 0.35 }}>
          {p}
        </motion.g>
      ))}
    </svg>
  );
}
