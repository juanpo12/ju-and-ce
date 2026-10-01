'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Poster } from '@/components/Poster';
import { cn } from '@/lib/utils';

export type Ficha = { id: string; titulo: string; anio: number | null; posterPath: string | null };

/**
 * Un póster que pasa rápido por las candidatas mientras gira, y cae en el
 * resultado con un rebote. Sin resultado y sin girar, muestra un marco vacío
 * que invita a tirar.
 */
export function Ruleta({
  candidatas,
  resultado,
  girando,
  className,
}: {
  candidatas: readonly Ficha[];
  resultado: Ficha | null;
  girando: boolean;
  className?: string;
}) {
  const reducido = useReducedMotion();
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (!girando || candidatas.length < 2 || reducido) return;
    const id = setInterval(() => setIndice((i) => (i + 1) % candidatas.length), 90);
    return () => clearInterval(id);
  }, [girando, candidatas.length, reducido]);

  const visible = girando ? (candidatas[indice] ?? resultado) : resultado;

  return (
    <div className={cn('relative mx-auto w-44 sm:w-52', className)}>
      <div className="aspect-[2/3] w-full overflow-hidden rounded-tema bg-acento-suave shadow-alta">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible ? (
            <motion.div
              key={girando ? 'girando' : visible.id}
              initial={girando ? false : { scale: 0.85, opacity: 0, rotate: -3 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.45, duration: 0.6 }}
              className="h-full w-full overflow-hidden rounded-tema"
              style={girando ? { filter: 'saturate(0.7)' } : undefined}
            >
              <Poster path={visible.posterPath} titulo={visible.titulo} anio={visible.anio} tamano="grilla" />
            </motion.div>
          ) : (
            <motion.div
              key="vacio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full w-full items-center justify-center text-acento"
            >
              <Signo />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {girando && (
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-tema ring-4 ring-acento/40" />
      )}
    </div>
  );
}

function Signo() {
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
