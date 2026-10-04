'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import type { AnagramaMatch } from '@/lib/games/anagrama';
import { normalize } from '@/lib/games/normalize';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

export const meta = {
  description: 'Las mismas letras desordenadas para los dos. El primero que arma la palabra se lleva la ronda. Al mejor de 5.',
  icon: (
    <>
      <rect x="2.5" y="8" width="5.5" height="7" rx="1.2" />
      <rect x="9.25" y="8" width="5.5" height="7" rx="1.2" />
      <rect x="16" y="8" width="5.5" height="7" rx="1.2" />
      <path d="M5 5.5c2-2 5-2 7 0M12 18.5c2 2 5 2 7 0" />
    </>
  ),
};

const REVEAL_MS = 2400;

/**
 * Both phones see the same scrambled letters; tap them in order (or type) and
 * send. The first right answer takes the round and the word is revealed for a
 * moment before the next one. If neither finds it, both can pass.
 */
export function Anagram({ table, match, pending }: { table: Table; match: AnagramaMatch; pending: Pendiente[] }) {
  const { me, other } = table;

  const [revealed, setRevealed] = useState(match.rounds.length);
  const revealing = match.rounds.length > revealed;
  useEffect(() => {
    if (!revealing) return;
    const id = setTimeout(() => setRevealed(match.rounds.length), REVEAL_MS);
    return () => clearTimeout(id);
  }, [revealing, match.rounds.length]);

  const last = match.rounds[match.rounds.length - 1];

  return (
    <section>
      <GameHeader table={table} pending={pending} name="Anagrama" detail={`El primero en ganar ${match.target} palabras`} />

      <div className="mb-5 flex items-center justify-center gap-6">
        {[me, other].map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <Avatar persona={p} />
            <span className="flex gap-1" aria-label={`${p.nombre}: ${match.score[p.id] ?? 0} palabras`}>
              {Array.from({ length: match.target }, (_, i) => (
                <span
                  key={i}
                  className="size-3 rounded-full border-2"
                  style={{
                    borderColor: varColor(p.color),
                    backgroundColor: i < (match.score[p.id] ?? 0) ? varColor(p.color) : 'transparent',
                  }}
                />
              ))}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {revealing && last ? (
          <motion.div
            key={`reveal-${match.rounds.length}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="tarjeta flex flex-col items-center gap-3 px-4 py-6 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tinta-suave">La palabra era</p>
            <Tiles letters={last.answer ?? last.word} tone={personOf(table, last.winner)} />
            <p className="font-titulo text-3xl leading-tight text-tinta">
              {last.winner === null
                ? 'Pasaron los dos'
                : last.winner === me.id
                  ? 'Palabra tuya'
                  : `Palabra de ${personOf(table, last.winner)?.nombre}`}
            </p>
          </motion.div>
        ) : (
          <Guess key={`${match.rounds.length}-${me.id}`} table={table} match={match} />
        )}
      </AnimatePresence>

      {match.rounds.length > 0 && !revealing && (
        <ol className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-tinta-suave" aria-label="Palabras">
          {match.rounds.map((r, i) => {
            const who = personOf(table, r.winner);
            return (
              <li key={i} className="flex items-center gap-1 rounded-full border border-borde px-2 py-0.5">
                {who ? <Avatar persona={who} medida="chico" /> : <span>=</span>}
                {r.answer ?? r.word}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/** The letters as tiles, optionally framed in a person's color. */
function Tiles({ letters, tone }: { letters: string; tone?: { color: 'durazno' | 'menta' } | null }) {
  return (
    <div className="flex justify-center gap-1.5">
      {[...letters].map((l, i) => (
        <span
          key={i}
          className="flex size-12 items-center justify-center rounded-tema border-2 bg-superficie-alta font-cartel text-3xl uppercase text-tinta shadow-baja"
          style={tone ? { borderColor: varColor(tone.color) } : undefined}
        >
          {l}
        </span>
      ))}
    </div>
  );
}

/** This round on this phone: the scrambled tiles, what is being built, send, pass. */
function Guess({ table, match }: { table: Table; match: AnagramaMatch }) {
  const { me, other, play, busy } = table;
  const reduced = useReducedMotion();
  const letters = [...match.letters];
  // Positions of the scrambled letters used so far, in order.
  const [picked, setPicked] = useState<number[]>([]);
  const [shake, setShake] = useState(0);
  const misses = match.misses[me.id] ?? 0;
  const out = misses >= match.maxMisses;
  const passed = match.passed.includes(me.id);
  const otherPassed = match.passed.includes(other.id);
  const word = picked.map((i) => letters[i]).join('');

  // A right answer ends the round and this component with it; still here after
  // sending means the guess was wrong.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  async function send() {
    if (word.length !== letters.length) return;
    await play({ game: 'anagrama', guess: word });
    if (!alive.current) return;
    setShake((n) => n + 1);
    setPicked([]);
  }

  // Typing works too: each key takes the first unused tile with that letter.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (busy || out || passed) return;
      if (e.key === 'Backspace') return setPicked((p) => p.slice(0, -1));
      if (e.key === 'Enter') return void send();
      const k = normalize(e.key);
      if (k.length !== 1) return;
      setPicked((p) => {
        const i = letters.findIndex((l, j) => l === k && !p.includes(j));
        return i < 0 ? p : [...p, i];
      });
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <motion.div
      key="guess"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="tarjeta flex flex-col items-center gap-5 px-4 py-6"
    >
      <motion.div
        key={shake}
        animate={reduced || shake === 0 ? undefined : { x: [0, -10, 10, -6, 6, 0] }}
        transition={{ duration: 0.35 }}
        className="flex justify-center gap-1.5"
        aria-label={`Tu palabra: ${word || 'vacía'}`}
      >
        {letters.map((_, i) => (
          <span
            key={i}
            className={cn(
              'flex size-12 items-center justify-center rounded-tema border-2 font-cartel text-3xl uppercase',
              word[i] ? 'border-acento bg-acento-suave text-tinta' : 'border-dashed border-borde text-transparent',
            )}
          >
            {word[i] ?? '·'}
          </span>
        ))}
      </motion.div>

      <div className="flex justify-center gap-1.5">
        {letters.map((l, i) => {
          const used = picked.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={used || busy || out || passed}
              onClick={() => setPicked((p) => [...p, i])}
              aria-label={`Letra ${l}`}
              className="foco tocable flex size-12 items-center justify-center rounded-tema bg-acento font-cartel text-3xl uppercase text-sobre-acento shadow-baja transition-opacity disabled:opacity-25"
            >
              {l}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Boton variante="suave" onClick={() => setPicked((p) => p.slice(0, -1))} disabled={!picked.length || busy}>
          Borrar
        </Boton>
        <Boton onClick={() => void send()} disabled={word.length !== letters.length || busy || out || passed}>
          Enviar
        </Boton>
      </div>

      <p className="text-center text-xs text-tinta-suave">
        {out
          ? 'Te quedaste sin intentos en esta palabra.'
          : `Intentos fallidos: ${misses} de ${match.maxMisses}.`}{' '}
        {passed
          ? `Pasaste. Si ${other.nombre} también pasa, se revela.`
          : otherPassed
            ? `${other.nombre} pasó.`
            : ''}
      </p>
      {!passed && (
        <Boton variante="fantasma" className="h-8 px-3 text-xs" onClick={() => play({ game: 'anagrama', pass: true })} disabled={busy}>
          Pasar esta palabra
        </Boton>
      )}
    </motion.div>
  );
}
