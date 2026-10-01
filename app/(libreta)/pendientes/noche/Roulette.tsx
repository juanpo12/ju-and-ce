'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Poster } from '@/components/Poster';
import { cn } from '@/lib/utils';

export type Tile = { id: string; titulo: string; anio: number | null; posterPath: string | null };

/**
 * A poster that flips quickly through the candidates while spinning, and lands
 * on the result with a bounce. With no result and not spinning, it shows an
 * empty frame that invites a roll.
 */
export function Roulette({
  candidates,
  result,
  spinning,
  className,
}: {
  candidates: readonly Tile[];
  result: Tile | null;
  spinning: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!spinning || candidates.length < 2 || reduced) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % candidates.length), 90);
    return () => clearInterval(id);
  }, [spinning, candidates.length, reduced]);

  const visible = spinning ? (candidates[index] ?? result) : result;

  return (
    <div className={cn('relative mx-auto w-44 sm:w-52', className)}>
      <div className="aspect-[2/3] w-full overflow-hidden rounded-tema bg-acento-suave shadow-alta">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible ? (
            <motion.div
              key={spinning ? 'spinning' : visible.id}
              initial={spinning ? false : { scale: 0.85, opacity: 0, rotate: -3 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.45, duration: 0.6 }}
              className="h-full w-full overflow-hidden rounded-tema"
              style={spinning ? { filter: 'saturate(0.7)' } : undefined}
            >
              <Poster path={visible.posterPath} titulo={visible.titulo} anio={visible.anio} tamano="grilla" />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full w-full items-center justify-center text-acento"
            >
              <QuestionMark />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {spinning && (
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-tema ring-4 ring-acento/40" />
      )}
    </div>
  );
}

function QuestionMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8v.5" />
      <circle cx="12" cy="17.5" r="0.6" fill="currentColor" />
      <rect x="3" y="3" width="18" height="18" rx="4" strokeDasharray="2 3" />
    </svg>
  );
}
