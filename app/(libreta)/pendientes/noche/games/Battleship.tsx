'use client';

import { motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import type { BattleshipMatch } from '@/lib/movie-night';
import { varColor, type Persona } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

/**
 * Two small boards: the one you shoot at and the one being shot at. Nobody
 * knows where their own ships are until the end (the server placed them), so
 * your board only shows what the other person already found.
 */
export function Battleship({
  table,
  match,
  pending,
}: {
  table: Table;
  match: BattleshipMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const myTurn = match.turn === me.id;
  const whose = personOf(table, match.turn);
  const myShots = match.shots[me.id] ?? [];
  const theirShots = match.shots[other.id] ?? [];
  const lastMine = myShots[myShots.length - 1];
  const myFleet = match.fleets?.[me.id];
  const theirFleet = match.fleets?.[other.id];

  return (
    <section>
      <GameHeader
        table={table}
        pending={pending}
        name="Batalla naval"
        detail={`${match.ships.length} barcos cada uno, puestos al azar. Si pegás, seguís.`}
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {[me, other].map((p) => (
            <Sunk key={p.id} person={p} count={match.sunk[p.id] ?? 0} total={match.ships.length} />
          ))}
        </div>
        <p
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={whose ? { backgroundColor: varColor(whose.color), color: 'var(--sobre-persona)' } : undefined}
          aria-live="polite"
        >
          {myTurn ? (lastMine?.hit ? '¡Pegaste! Seguís' : 'Te toca tirar') : `Le toca a ${other.nombre}`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Board
          title="Tirás acá"
          caption={`El mar de ${other.nombre}`}
          size={match.size}
          shots={myShots}
          fleet={theirFleet}
          color={varColor(other.color)}
          onShoot={myTurn && !busy ? (cell) => send(() => playAction(night.id, { game: 'naval', cell })) : undefined}
        />
        <Board
          title="Tu tablero"
          caption={`Lo que ${other.nombre} ya encontró`}
          size={match.size}
          shots={theirShots}
          fleet={myFleet}
          color={varColor(me.color)}
        />
      </div>
    </section>
  );
}

function Sunk({ person, count, total }: { person: Persona; count: number; total: number }) {
  return (
    <span className="flex items-center gap-1.5" aria-label={`${person.nombre} hundió ${count} de ${total}`}>
      <Avatar persona={person} medida="chico" />
      <span className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="h-2.5 w-4 rounded-sm border"
            style={{ borderColor: varColor(person.color), backgroundColor: i < count ? varColor(person.color) : 'transparent' }}
          />
        ))}
      </span>
    </span>
  );
}

/**
 * A grid of cells. `shots` are what was fired at this board; `fleet` is only
 * known at the end and outlines the ships. With `onShoot`, free cells are buttons.
 */
function Board({
  title,
  caption,
  size,
  shots,
  fleet,
  color,
  onShoot,
}: {
  title: string;
  caption: string;
  size: number;
  shots: { cell: number; hit: boolean }[];
  fleet?: number[][];
  color: string;
  onShoot?: (cell: number) => void;
}) {
  const shipCells = new Set(fleet?.flat() ?? []);
  return (
    <div className="tarjeta p-3">
      <p className="font-titulo text-2xl leading-none text-tinta">{title}</p>
      <p className="mb-2 text-xs text-tinta-suave">{caption}</p>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        role="grid"
        aria-label={title}
      >
        {Array.from({ length: size * size }, (_, i) => {
          const shot = shots.find((s) => s.cell === i);
          const ship = shipCells.has(i);
          const free = !shot && Boolean(onShoot);
          return (
            <motion.button
              key={i}
              type="button"
              role="gridcell"
              disabled={!free}
              onClick={free ? () => onShoot!(i) : undefined}
              whileTap={free ? { scale: 0.9 } : undefined}
              aria-label={shot ? (shot.hit ? 'Tocado' : 'Agua') : ship ? 'Barco' : 'Sin tirar'}
              className={cn(
                'foco relative flex aspect-square items-center justify-center rounded-[calc(var(--radio)-6px)] border transition-colors',
                shot?.hit
                  ? 'border-acento bg-acento'
                  : shot
                    ? 'border-borde bg-superficie'
                    : ship
                      ? 'border-tinta-suave/50 bg-acento-suave'
                      : 'border-borde bg-acento-suave/40',
                free && 'cursor-pointer hover:bg-acento-suave',
                !free && 'disabled:cursor-default',
              )}
              style={ship && !shot ? { boxShadow: `inset 0 0 0 2px ${color}` } : undefined}
            >
              {shot && !shot.hit && <span aria-hidden className="size-1.5 rounded-full bg-tinta-suave/60" />}
              {shot?.hit && (
                <motion.span
                  aria-hidden
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="text-sobre-acento"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
