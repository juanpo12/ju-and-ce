'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Poster } from '@/components/Poster';
import type { Card, MemoryMatch } from '@/lib/movie-night';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { personOf, type Table } from '../types';

const SHOW_MISS_MS = 1300;

/**
 * One board for both phones. The server knows the faces; here we only see what
 * is face up. When a pair misses, the server has already turned both cards
 * back and left what they were in `lastMove`: they are shown for a moment and
 * then flipped over.
 */
export function Memory({
  table,
  match,
  pending,
}: {
  table: Table;
  match: MemoryMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const myTurn = match.turn === me.id;

  // The miss being shown: both cards with their faces, briefly.
  const [miss, setMiss] = useState<MemoryMatch['lastMove'] | null>(null);
  // A ref, not state: as state, changing it would re-run the effect and its
  // cleanup would cancel the timer that hides the cards again.
  const seen = useRef(match.lastMove?.n ?? 0);
  useEffect(() => {
    const m = match.lastMove;
    if (!m || m.n <= seen.current) return;
    seen.current = m.n;
    if (m.hit) return;
    setMiss(m);
    const id = setTimeout(() => setMiss(null), SHOW_MISS_MS);
    return () => clearTimeout(id);
  }, [match.lastMove]);

  const [tapping, setTapping] = useState<number | null>(null);

  function tap(i: number) {
    if (!myTurn || busy || miss) return;
    setTapping(i);
    void send(() => playAction(night.id, { game: 'memoria', card: i })).finally(() => setTapping(null));
  }

  const columns =
    match.cards.length > 12 ? 'grid-cols-4 sm:grid-cols-7' : match.cards.length > 8 ? 'grid-cols-4 sm:grid-cols-5' : 'grid-cols-3';
  const whoseTurn = personOf(table, match.turn);

  return (
    <section>
      <GameHeader
        table={table}
        pending={pending}
        name="Memoria"
        detail={`${match.totalPairs} pares. Acertás, seguís.`}
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {[me, other].map((p) => (
            <span key={p.id} className="flex items-center gap-1.5 text-sm text-tinta">
              <Avatar persona={p} />
              <span className="font-cartel text-2xl tracking-wide" style={{ color: varColor(p.color) }}>
                {match.pairs[p.id] ?? 0}
              </span>
            </span>
          ))}
        </div>
        <p
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={
            whoseTurn
              ? { backgroundColor: varColor(whoseTurn.color), color: 'var(--sobre-persona)' }
              : undefined
          }
          aria-live="polite"
        >
          {myTurn ? 'Te toca' : `Le toca a ${other.nombre}`}
        </p>
      </div>

      <ul className={cn('grid gap-2', columns)} aria-label="Tablero">
        {match.cards.map((c, i) => {
          const missFace = miss?.cards.includes(i) ? miss.faces[miss.cards.indexOf(i) as 0 | 1] : null;
          const face: Card | null = c.faceUp ?? missFace;
          const owner = personOf(table, c.ownedBy);
          const locked = !myTurn || busy || Boolean(miss) || Boolean(face);
          return (
            <li key={i} className="[perspective:600px]">
              <motion.button
                type="button"
                disabled={locked}
                onClick={() => tap(i)}
                aria-label={face ? face.title : `Carta ${i + 1}, tapada`}
                animate={{ rotateY: face ? 180 : 0, scale: tapping === i ? 0.94 : 1 }}
                transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                className="foco relative aspect-[2/3] w-full rounded-[calc(var(--radio)-4px)] [transform-style:preserve-3d] disabled:cursor-default"
              >
                {/* Back: a clapperboard on the soft accent. */}
                <span className="absolute inset-0 flex items-center justify-center rounded-[inherit] border border-borde bg-acento-suave text-acento shadow-baja [backface-visibility:hidden]">
                  <Clapperboard />
                </span>
                {/* Front: the poster, ringed with the color of whoever won the pair. */}
                <span
                  className="absolute inset-0 overflow-hidden rounded-[inherit] shadow-baja [backface-visibility:hidden] [transform:rotateY(180deg)]"
                  style={owner ? { boxShadow: `0 0 0 3px ${varColor(owner.color)}` } : undefined}
                >
                  {face && <Poster path={face.posterPath} titulo={face.title} anio={face.year} tamano="chico" />}
                  {owner && (
                    <span className="absolute left-1 top-1">
                      <Avatar persona={owner} medida="chico" />
                    </span>
                  )}
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Clapperboard() {
  return (
    <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M4.5 10 3.6 6.6a1 1 0 0 1 .7-1.2l13.5-3.3a1 1 0 0 1 1.2.7l.6 2.4z" />
      <path d="M8 9.5 7 6M12 8.5l-1-3.5M16 7.5l-1-3.5" />
    </svg>
  );
}
