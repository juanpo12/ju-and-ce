'use client';

import { motion } from 'motion/react';
import { Avatar } from '@/components/Avatar';
import type { MancalaMatch } from '@/lib/games/mancala';
import { varColor, type Persona } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

export const meta = {
  description: 'Sembrá semillas de a una por los hoyos. Caer en tu granero te da otro turno; en un hoyo vacío tuyo, te robás lo de enfrente.',
  icon: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="6" />
      <circle cx="9" cy="10" r="1.4" />
      <circle cx="12" cy="10" r="1.4" />
      <circle cx="15" cy="10" r="1.4" />
      <circle cx="9" cy="14" r="1.4" fill="currentColor" />
      <circle cx="12" cy="14" r="1.4" fill="currentColor" />
      <circle cx="15" cy="14" r="1.4" fill="currentColor" />
    </>
  ),
};

/** How many seeds are drawn as dots before switching to just the number. */
const MAX_DOTS = 7;

/**
 * Kalah, seen from each side: your row at the bottom running left to right
 * toward your store on the right, the other's row on top running the other way.
 * A pit you can sow is tappable; after a move, the screen says if it earned
 * another turn or captured.
 */
export function Mancala({ table, match, pending }: { table: Table; match: MancalaMatch; pending: Pendiente[] }) {
  const { me, other, play, busy } = table;
  const myTurn = match.turn === me.id && !match.swept;
  const whose = personOf(table, match.turn);
  const mine = match.pits[me.id] ?? [];
  const theirs = match.pits[other.id] ?? [];
  const last = match.last;
  const lastBy = personOf(table, last?.by);

  const news = last && lastBy
    ? last.captured
      ? `${lastBy.id === me.id ? 'Capturaste' : `${lastBy.nombre} capturó`} ${last.captured} semillas`
      : last.extra && !match.swept
        ? lastBy.id === me.id
          ? '¡Otra vez vos! Terminaste en tu granero'
          : `Otra vez ${lastBy.nombre}: terminó en su granero`
        : null
    : null;

  return (
    <section>
      <GameHeader table={table} pending={pending} name="Mancala" detail="Más semillas en el granero gana." />

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-tinta-suave">
          <span className="flex items-center gap-1"><Avatar persona={me} medida="chico" /> vos, abajo</span>
          <span className="flex items-center gap-1"><Avatar persona={other} medida="chico" /> {other.nombre}, arriba</span>
        </div>
        <p
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={whose ? { backgroundColor: varColor(whose.color), color: 'var(--sobre-persona)' } : undefined}
          aria-live="polite"
        >
          {match.swept ? 'Se terminó' : myTurn ? 'Te toca' : `Le toca a ${other.nombre}`}
        </p>
      </div>

      <div className="mx-auto w-full max-w-md rounded-[calc(var(--radio)+0.5rem)] bg-acento-suave p-2 shadow-baja">
        <div className="grid grid-cols-[1fr_repeat(6,minmax(0,1fr))_1fr] grid-rows-2 gap-1.5">
          <Store person={other} seeds={match.stores[other.id] ?? 0} className="row-span-2" label={`Granero de ${other.nombre}`} />

          {/* Their row, mirrored: their pit 5 on the left, pit 0 on the right. */}
          {[...theirs].reverse().map((seeds, k) => {
            const pit = theirs.length - 1 - k;
            return (
              <Pit
                key={`t${pit}`}
                person={other}
                seeds={seeds}
                label={`Hoyo ${pit + 1} de ${other.nombre}, ${seeds} semillas`}
                lastMove={last?.by === other.id && last.pit === pit}
              />
            );
          })}

          <Store person={me} seeds={match.stores[me.id] ?? 0} className="col-start-8 row-span-2 row-start-1" label="Tu granero" />

          {mine.map((seeds, pit) => (
            <Pit
              key={`m${pit}`}
              person={me}
              seeds={seeds}
              label={`Tu hoyo ${pit + 1}, ${seeds} semillas`}
              lastMove={last?.by === me.id && last.pit === pit}
              onSow={myTurn && seeds > 0 && !busy ? () => play({ game: 'mancala', pit }) : undefined}
            />
          ))}
        </div>
      </div>

      <p className="mt-3 min-h-5 text-center text-sm text-tinta" aria-live="polite">
        {match.swept
          ? 'Se vació un lado: cada uno guardó en su granero lo que le quedaba.'
          : news ?? (myTurn ? 'Tocá uno de tus hoyos para sembrar.' : `${other.nombre} está pensando…`)}
      </p>
    </section>
  );
}

function Store({ person, seeds, className, label }: { person: Persona; seeds: number; className?: string; label: string }) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-1 rounded-full bg-superficie py-2 shadow-[inset_0_1px_4px_rgb(0_0_0/0.15)]', className)}
      aria-label={`${label}: ${seeds}`}
      role="img"
    >
      <motion.span
        key={seeds}
        initial={{ scale: 1.4 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="font-cartel text-2xl leading-none"
        style={{ color: varColor(person.color) }}
      >
        {seeds}
      </motion.span>
      <span className="size-2 rounded-full" style={{ backgroundColor: varColor(person.color) }} aria-hidden />
    </div>
  );
}

function Pit({
  person,
  seeds,
  label,
  lastMove,
  onSow,
}: {
  person: Persona;
  seeds: number;
  label: string;
  lastMove: boolean;
  onSow?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!onSow}
      onClick={onSow}
      aria-label={label}
      className={cn(
        'foco tocable relative flex aspect-[3/4] flex-col items-center justify-center rounded-full bg-superficie shadow-[inset_0_1px_4px_rgb(0_0_0/0.15)] transition-colors disabled:cursor-default',
        onSow && 'ring-2 ring-[var(--ring-pit)] hover:bg-superficie-alta',
        lastMove && 'ring-2 ring-tinta/60',
      )}
      style={{ '--ring-pit': varColor(person.color) } as React.CSSProperties}
    >
      <motion.span
        key={seeds}
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.55, duration: 0.4 }}
        className="flex flex-wrap items-center justify-center gap-[2px] px-0.5"
        aria-hidden
      >
        {seeds <= MAX_DOTS ? (
          Array.from({ length: seeds }, (_, i) => (
            <span key={i} className="size-[5px] rounded-full" style={{ backgroundColor: varColor(person.color) }} />
          ))
        ) : (
          <span className="font-cartel text-lg leading-none" style={{ color: varColor(person.color) }}>
            {seeds}
          </span>
        )}
      </motion.span>
      <span aria-hidden className="absolute bottom-0.5 text-[0.6rem] leading-none text-tinta-suave">
        {seeds <= MAX_DOTS ? seeds : ''}
      </span>
    </button>
  );
}
