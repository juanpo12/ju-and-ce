'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Avatar } from '@/components/Avatar';
import { MAX_REACTION_MS, type DueloMatch, type DueloShot } from '@/lib/games/duelo';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

export const meta = {
  description: 'Mano en la funda y, cuando aparece «¡FUEGO!», a tocar. El más rápido gana la ronda; el que se adelanta, la pierde.',
  icon: (
    <>
      <path d="M3 9h12l1.5-2H20v4h-3l-1 2h-3l-1.5 4.5a1 1 0 0 1-1 .7H7.8a.8.8 0 0 1-.7-1.1L8.5 13H5a2 2 0 0 1-2-2z" />
      <path d="M11 13h2" />
    </>
  ),
};

const REVEAL_MS = 2600;

const shotText = (s: DueloShot | undefined) =>
  !s ? '—' : 'early' in s ? 'Se adelantó' : `${(s.reactionMs / 1000).toFixed(3).replace('.', ',')} s`;

/**
 * Each round: «Listo» puts the hand on the holster, a wait nobody can predict,
 * and «¡FUEGO!». The phone measures from its own signal to the tap, so the
 * network does not decide. Both shots show together when both are in.
 */
export function Duel({ table, match, pending }: { table: Table; match: DueloMatch; pending: Pendiente[] }) {
  const { me, other } = table;
  const iDrew = match.drawn.includes(me.id);
  const otherDrew = match.drawn.includes(other.id);

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
      <GameHeader table={table} pending={pending} name="Duelo del oeste" detail={`El primero en ganar ${match.target} duelos`} />

      <div className="mb-5 flex items-center justify-center gap-6">
        {[me, other].map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <Avatar persona={p} />
            <span className="flex gap-1" aria-label={`${p.nombre}: ${match.score[p.id] ?? 0} duelos`}>
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
            className="tarjeta flex flex-col items-center gap-4 px-4 py-6"
          >
            <div className="grid w-full max-w-xs grid-cols-2 gap-3">
              {[me, other].map((p) => {
                const shot = last.shots[p.id];
                const won = last.winner === p.id;
                return (
                  <div
                    key={p.id}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-tema border-2 px-2 py-3',
                      last.winner && !won && 'opacity-55',
                    )}
                    style={{ borderColor: varColor(p.color) }}
                  >
                    <Avatar persona={p} />
                    <span className="font-cartel text-2xl leading-none tabular-nums text-tinta">{shotText(shot)}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-center font-titulo text-3xl leading-tight text-tinta">
              {last.winner === null
                ? 'Duelo anulado: de nuevo'
                : last.winner === me.id
                  ? 'Desenfundaste primero'
                  : `${personOf(table, last.winner)?.nombre} desenfundó primero`}
            </p>
          </motion.div>
        ) : iDrew ? (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="tarjeta flex flex-col items-center gap-2 px-4 py-8 text-center"
          >
            <span className="relative flex">
              <Avatar persona={other} medida="grande" vacio={!otherDrew} />
              {!otherDrew && <span aria-hidden className="absolute -inset-1.5 animate-ping rounded-full border-2 border-acento opacity-50" />}
            </span>
            <p className="font-titulo text-2xl text-tinta">{`Esperando el disparo de ${other.nombre}…`}</p>
            <p className="text-xs text-tinta-suave">Tu tiempo queda guardado hasta que disparen los dos.</p>
          </motion.div>
        ) : (
          <Standoff key={`round-${match.rounds.length}-${me.id}`} table={table} match={match} />
        )}
      </AnimatePresence>

      {match.rounds.length > 0 && !revealing && (
        <ol className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-tinta-suave" aria-label="Duelos">
          {match.rounds.map((r, i) => {
            const who = personOf(table, r.winner);
            return (
              <li key={i} className="flex items-center gap-1 rounded-full border border-borde px-2 py-0.5">
                {who ? <Avatar persona={who} medida="chico" /> : <span>=</span>}
                {who ? shotText(r.shots[who.id]) : 'anulado'}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

type Phase = 'ready' | 'tension' | 'fire' | 'sent';

/** One round on this phone: holster, the wait, the signal, the tap. */
function Standoff({ table, match }: { table: Table; match: DueloMatch }) {
  const { other, play, busy } = table;
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('ready');
  const fireAt = useRef(0);
  const otherDrew = match.drawn.includes(other.id);

  function report(move: { early: true } | { reactionMs: number }) {
    setPhase('sent');
    void play({ game: 'duelo', ...move }).then((error) => {
      if (error) setPhase('ready');
    });
  }

  // The wait: unknown to the player, the same for both phones.
  useEffect(() => {
    if (phase !== 'tension') return;
    const id = setTimeout(() => {
      fireAt.current = performance.now();
      setPhase('fire');
    }, match.delayMs);
    return () => clearTimeout(id);
  }, [phase, match.delayMs]);

  // Asleep at the trigger: after a while the shot goes out on its own.
  useEffect(() => {
    if (phase !== 'fire') return;
    const id = setTimeout(() => report({ reactionMs: MAX_REACTION_MS }), MAX_REACTION_MS);
    return () => clearTimeout(id);
    // `report` only closes over `play`, which is stable for the round.
  }, [phase]);

  function tap() {
    if (phase === 'tension') report({ early: true });
    else if (phase === 'fire') {
      report({ reactionMs: Math.min(MAX_REACTION_MS, Math.round(performance.now() - fireAt.current)) });
    }
  }

  if (phase === 'ready') {
    return (
      <motion.div
        key="ready"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="tarjeta flex flex-col items-center gap-4 px-4 py-8 text-center"
      >
        <p className="font-titulo text-3xl leading-tight text-tinta">Mano en la funda</p>
        <p className="max-w-xs text-sm text-tinta-suave">
          Cuando toques «Listo», esperá la señal. Si tocás antes de «¡FUEGO!», perdés la ronda.
          {otherDrew && ` ${other.nombre} ya disparó.`}
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => setPhase('tension')}
          className="foco tocable inline-flex min-h-12 items-center justify-center rounded-tema bg-acento px-8 font-cartel text-2xl tracking-wide text-sobre-acento shadow-alta disabled:opacity-50"
        >
          Listo
        </button>
      </motion.div>
    );
  }

  const firing = phase === 'fire';
  return (
    <motion.button
      key="field"
      type="button"
      onPointerDown={tap}
      disabled={phase === 'sent'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-label={firing ? '¡Fuego! Tocá ahora' : 'Esperá la señal'}
      className={cn(
        'foco flex min-h-72 w-full touch-manipulation select-none flex-col items-center justify-center gap-3 rounded-tema px-4 shadow-alta transition-colors duration-75',
        firing ? 'bg-acento text-sobre-acento' : 'tarjeta text-tinta',
      )}
    >
      {firing ? (
        <motion.span
          initial={reduced ? false : { scale: 0.4, rotate: -6 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.6, duration: 0.25 }}
          className="font-cartel text-7xl leading-none tracking-wide"
        >
          ¡FUEGO!
        </motion.span>
      ) : phase === 'sent' ? (
        <span className="font-titulo text-3xl">…</span>
      ) : (
        <>
          <motion.span
            animate={reduced ? undefined : { opacity: [1, 0.45, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="font-titulo text-4xl"
          >
            Atentos…
          </motion.span>
          <span className="text-sm text-tinta-suave">No toques todavía</span>
        </>
      )}
    </motion.button>
  );
}
