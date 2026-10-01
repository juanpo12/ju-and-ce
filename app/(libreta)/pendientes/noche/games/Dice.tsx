'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import type { DiceMatch, Roll } from '@/lib/movie-night';
import { varColor, type Persona } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

const REVEAL_MS = 1600;

/**
 * Two dice each, best of three rounds. The server rolls; the phone only shows
 * the dice tumbling and landing. Rolls of a settled round are shown together
 * for a moment before the next one opens.
 */
export function Dice({
  table,
  match,
  pending,
}: {
  table: Table;
  match: DiceMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const rolled = Boolean(match.rolls[me.id]);
  const otherRolled = Boolean(match.rolls[other.id]);

  const [shown, setShown] = useState(match.rounds.length);
  const revealing = match.rounds.length > shown;
  useEffect(() => {
    if (!revealing) return;
    const id = setTimeout(() => setShown(match.rounds.length), REVEAL_MS);
    return () => clearTimeout(id);
  }, [revealing, match.rounds.length]);

  const last = match.rounds[match.rounds.length - 1];
  const rolls = revealing && last ? last.rolls : match.rolls;

  return (
    <section>
      <GameHeader table={table} pending={pending} name="Dados" detail="Al mejor de 3. El número más alto se lleva la ronda." />

      <div className="mb-5 flex items-center justify-center gap-6">
        {[me, other].map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <Avatar persona={p} />
            <span className="flex gap-1" aria-label={`${p.nombre}: ${match.score[p.id] ?? 0} rondas`}>
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

      <div className="grid grid-cols-2 gap-3">
        {[me, other].map((p) => (
          <Cup key={p.id} person={p} roll={rolls[p.id]} mine={p.id === me.id} winner={revealing ? last?.winner : undefined} />
        ))}
      </div>

      <div className="mt-5 flex min-h-12 flex-col items-center justify-center gap-2 text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {revealing && last ? (
            <motion.p key={`r${match.rounds.length}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="font-titulo text-3xl text-tinta">
              {last.winner === null ? 'Empate: de nuevo' : last.winner === me.id ? 'Ronda para vos' : `Ronda para ${personOf(table, last.winner)?.nombre}`}
            </motion.p>
          ) : rolled ? (
            <motion.p key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-tinta-suave">
              {otherRolled ? 'Tiraron los dos…' : `Esperando a que tire ${other.nombre}…`}
            </motion.p>
          ) : (
            <motion.div key="roll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Boton onClick={() => send(() => playAction(night.id, { game: 'dados' }))} disabled={busy} className="h-11 px-6">
                Tirar los dados
              </Boton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/** One person's two dice, blank until they roll. */
function Cup({ person, roll, mine, winner }: { person: Persona; roll?: Roll; mine: boolean; winner?: string | null }) {
  const lost = winner !== undefined && winner !== null && winner !== person.id;
  return (
    <div
      className={cn('tarjeta flex flex-col items-center gap-2 px-3 py-4 transition-opacity', lost && 'opacity-50')}
      style={winner === person.id ? { boxShadow: `0 0 0 3px ${varColor(person.color)}` } : undefined}
    >
      <span className="flex items-center gap-1.5 text-xs text-tinta-suave">
        <Avatar persona={person} medida="chico" /> {mine ? 'vos' : person.nombre}
      </span>
      <div className="flex gap-2">
        {[0, 1].map((i) => (
          <Die key={`${i}-${roll?.[i] ?? 'x'}`} value={roll?.[i]} color={varColor(person.color)} />
        ))}
      </div>
      <span className="font-cartel text-3xl leading-none" style={{ color: varColor(person.color) }}>
        {roll ? roll[0] + roll[1] : '—'}
      </span>
    </div>
  );
}

const PIPS: Record<number, [number, number][]> = {
  1: [[12, 12]],
  2: [[7, 7], [17, 17]],
  3: [[7, 7], [12, 12], [17, 17]],
  4: [[7, 7], [17, 7], [7, 17], [17, 17]],
  5: [[7, 7], [17, 7], [12, 12], [7, 17], [17, 17]],
  6: [[7, 6.5], [17, 6.5], [7, 12], [17, 12], [7, 17.5], [17, 17.5]],
};

function Die({ value, color }: { value?: number; color: string }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="size-14"
      initial={value ? { rotate: -200, scale: 0.6, opacity: 0 } : false}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ type: 'spring', bounce: 0.4, duration: 0.7 }}
      aria-label={value ? `${value}` : 'sin tirar'}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" fill="var(--superficie-alta)" stroke={value ? color : 'var(--borde)'} strokeWidth={1.6} strokeDasharray={value ? undefined : '3 3'} />
      {value && PIPS[value]?.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.9" fill={color} />)}
    </motion.svg>
  );
}
