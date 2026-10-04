'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import { CATEGORIES, MAX_ROLLS, points, total, type Category, type GeneralaMatch } from '@/lib/games/generala';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

export const meta = {
  description: 'La de siempre: tres tiradas por turno, guardás los dados que quieras y anotás. Servida gana en el acto.',
  icon: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
      <circle cx="7" cy="7" r="0.9" fill="currentColor" />
      <circle cx="15.5" cy="15.5" r="0.9" fill="currentColor" />
      <circle cx="18.5" cy="18.5" r="0.9" fill="currentColor" />
      <path d="M14 4h7M14 7.5h5M4 15h5M4 18.5h4" />
    </>
  ),
};

export const CATEGORY_NAME: Record<Category, string> = {
  c1: '1',
  c2: '2',
  c3: '3',
  c4: '4',
  c5: '5',
  c6: '6',
  escalera: 'Escalera',
  full: 'Full',
  poker: 'Póker',
  generala: 'Generala',
  doble: 'Doble generala',
};

/** «los 2», «la escalera», «el full». */
const THE: Record<Category, string> = {
  c1: 'los 1', c2: 'los 2', c3: 'los 3', c4: 'los 4', c5: 'los 5', c6: 'los 6',
  escalera: 'la escalera', full: 'el full', poker: 'el póker', generala: 'la generala', doble: 'la doble generala',
};
/** «a los 2», «a la escalera», «al full». */
const TO_THE = Object.fromEntries(
  Object.entries(THE).map(([c, t]) => [c, t.startsWith('el ') ? `al ${t.slice(3)}` : `a ${t}`]),
) as Record<Category, string>;

const NONE = [false, false, false, false, false];

/**
 * Generala by turns. On your turn: roll, tap dice to keep them, roll again (up
 * to three), then tap a free row of your column to score it. The other phone
 * watches the same dice move.
 */
export function Generala({ table, match, pending }: { table: Table; match: GeneralaMatch; pending: Pendiente[] }) {
  const { me, other, play, busy } = table;
  const mine = match.turn === me.id;
  const roller = personOf(table, match.turn)!;
  const served = match.rolls === 1;

  // Which dice to keep, local until the next roll. Resets when the dice change.
  const [held, setHeld] = useState<{ key: string; held: boolean[] }>({ key: '', held: NONE });
  const key = `${match.turn}-${match.rolls}-${match.dice.join('')}`;
  const hold = held.key === key ? held.held : NONE;
  const canHold = mine && match.rolls > 0 && match.rolls < MAX_ROLLS;
  const canScore = mine && match.rolls > 0;

  function toggle(i: number) {
    if (!canHold) return;
    setHeld({ key, held: hold.map((h, j) => (j === i ? !h : h)) });
  }

  // Scratching is final: the first tap on «tachar» only asks.
  const [scratching, setScratching] = useState<string | null>(null);
  function score(c: Category, worth: number) {
    if (worth === 0 && scratching !== `${key}-${c}`) {
      setScratching(`${key}-${c}`);
      return;
    }
    setScratching(null);
    void play({ game: 'generala', action: 'score', category: c });
  }

  const last = match.last;
  const sheetMine = match.sheets[me.id] ?? {};

  return (
    <section>
      <GameHeader
        table={table}
        pending={pending}
        name="Generala"
        detail={mine ? 'Te toca' : `Juega ${roller.nombre}`}
      />

      {last && (
        <p className="mb-3 text-center text-sm text-tinta-suave">
          {last.points === 0
            ? `${last.by === me.id ? 'Tachaste' : `${personOf(table, last.by)?.nombre} tachó`} ${THE[last.category]}`
            : `${last.by === me.id ? 'Anotaste' : `${personOf(table, last.by)?.nombre} anotó`} ${last.points} ${TO_THE[last.category]}`}
        </p>
      )}

      <div className="tarjeta mb-4 flex flex-col items-center gap-3 px-3 py-4">
        <div className="flex items-center gap-2 text-sm text-tinta-suave">
          <Avatar persona={roller} medida="chico" />
          {match.rolls === 0
            ? mine
              ? 'Tirá los dados'
              : `${roller.nombre} todavía no tiró`
            : `Tirada ${match.rolls} de ${MAX_ROLLS}${served ? ' · servida' : ''}`}
        </div>

        <div className="flex justify-center gap-1.5 sm:gap-2" role="group" aria-label="Dados">
          {(match.dice.length ? match.dice : [0, 0, 0, 0, 0]).map((d, i) => (
            <button
              key={i}
              type="button"
              disabled={!canHold || busy}
              onClick={() => toggle(i)}
              aria-pressed={hold[i]}
              aria-label={d ? `Dado ${d}${hold[i] ? ', guardado' : ''}` : 'Dado sin tirar'}
              className={cn('foco tocable flex flex-col items-center gap-1 rounded-tema transition-transform', hold[i] && '-translate-y-2')}
            >
              <DieFace
                value={d || undefined}
                color={varColor(roller.color)}
                rollKey={`${key}-${i}`}
                animate={!hold[i]}
                highlight={hold[i]}
              />
              <span className={cn('h-3 text-[0.65rem] font-semibold uppercase tracking-wide', hold[i] ? 'text-acento' : 'text-transparent')}>
                guardado
              </span>
            </button>
          ))}
        </div>

        {mine ? (
          <div className="flex flex-col items-center gap-1">
            <Boton
              disabled={busy || match.rolls >= MAX_ROLLS || (match.rolls > 0 && hold.every(Boolean))}
              onClick={() => play({ game: 'generala', action: 'roll', hold })}
              className="h-11 px-6"
            >
              {match.rolls === 0 ? 'Tirar' : match.rolls >= MAX_ROLLS ? 'Sin tiradas: anotá' : `Tirar de nuevo (quedan ${MAX_ROLLS - match.rolls})`}
            </Boton>
            {canHold && <p className="text-xs text-tinta-suave">Tocá los dados que querés guardar.</p>}
          </div>
        ) : (
          <p className="text-xs text-tinta-suave">Mirás cómo tira. Cuando anote, te toca.</p>
        )}
      </div>

      <div className="tarjeta overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-borde text-tinta-suave">
              <th className="px-3 py-1.5 text-left font-medium">Jugada</th>
              {[me, other].map((p) => (
                <th key={p.id} className="w-24 px-2 py-1.5 text-center font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Avatar persona={p} medida="chico" />
                    {p.id === me.id ? 'Vos' : p.nombre}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((c) => {
              const free = sheetMine[c] === undefined;
              const worth = canScore && free ? points(match.dice, c, served, sheetMine) : null;
              return (
                <tr key={c} className="border-b border-borde/60 last:border-0">
                  <td className="px-3 py-1 text-tinta">{CATEGORY_NAME[c]}</td>
                  {[me, other].map((p) => {
                    const v = match.sheets[p.id]?.[c];
                    if (p.id === me.id && worth !== null) {
                      return (
                        <td key={p.id} className="px-1.5 py-0.5 text-center">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => score(c, worth)}
                            className={cn(
                              'foco tocable w-full rounded-tema border px-2 py-0.5 text-xs font-semibold tabular-nums transition-colors',
                              worth > 0
                                ? 'border-acento bg-acento-suave text-tinta hover:bg-acento hover:text-sobre-acento'
                                : scratching === `${key}-${c}`
                                  ? 'border-acento text-acento'
                                  : 'border-dashed border-borde text-tinta-suave hover:border-acento',
                            )}
                            aria-label={`Anotar ${worth} a ${CATEGORY_NAME[c]}`}
                          >
                            {worth > 0 ? `+${worth}` : scratching === `${key}-${c}` ? '¿Seguro?' : 'tachar'}
                          </button>
                        </td>
                      );
                    }
                    return (
                      <td
                        key={p.id}
                        className={cn('px-2 py-1 text-center tabular-nums', v === undefined ? 'text-tinta-suave/50' : v === 0 ? 'text-tinta-suave' : 'font-semibold text-tinta')}
                        aria-label={v === 0 ? 'tachada' : undefined}
                      >
                        {v === undefined ? '·' : v === 0 ? '✕' : v}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr className="bg-acento-suave/60">
              <td className="px-3 py-1.5 font-semibold text-tinta">Total</td>
              {[me, other].map((p) => (
                <td key={p.id} className="px-2 py-1.5 text-center font-cartel text-xl tabular-nums" style={{ color: varColor(p.color) }}>
                  {total(match.sheets[p.id] ?? {})}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {match.servida && (
        <motion.p
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-4 text-center font-titulo text-4xl text-acento"
        >
          ¡Generala servida!
        </motion.p>
      )}
    </section>
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

/** One die. A new `rollKey` replays the tumble; `highlight` frames it in the accent. */
export function DieFace({
  value,
  color,
  rollKey,
  animate = true,
  highlight = false,
  size = 'size-14',
  dim = false,
}: {
  value?: number;
  color: string;
  rollKey?: string;
  animate?: boolean;
  highlight?: boolean;
  size?: string;
  dim?: boolean;
}) {
  return (
    <motion.svg
      key={animate ? rollKey : undefined}
      viewBox="0 0 24 24"
      className={cn(size, dim && 'opacity-35')}
      initial={value && animate ? { rotate: -180, scale: 0.6, opacity: 0 } : false}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
      aria-hidden
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
        fill={highlight ? 'var(--acento-suave)' : 'var(--superficie-alta)'}
        stroke={highlight ? 'var(--acento)' : value ? color : 'var(--borde)'}
        strokeWidth={highlight ? 2.4 : 1.6}
        strokeDasharray={value ? undefined : '3 3'}
      />
      {value && PIPS[value]?.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.9" fill={color} />)}
    </motion.svg>
  );
}
