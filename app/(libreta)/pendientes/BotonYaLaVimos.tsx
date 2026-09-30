'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import { accionMarcarVista } from '@/app/acciones';
import { cn } from '@/lib/utils';

/**
 * Pendiente → vista, con la fecha de hoy. Después lleva a la ficha para puntuar.
 *
 * Antes de irse festeja un momento: el botón se vuelve un tilde que se dibuja,
 * con un anillo que se expande. Son 450 ms que corren mientras el servidor
 * guarda, así que no agregan espera.
 */
export function BotonYaLaVimos({ entradaId, titulo }: { entradaId: string; titulo: string }) {
  const router = useRouter();
  const [pendiente, empezar] = useTransition();
  const [hecho, setHecho] = useState(false);

  function marcar() {
    setHecho(true);
    empezar(async () => {
      await Promise.all([accionMarcarVista(entradaId), new Promise((r) => setTimeout(r, 450))]);
      router.push(`/peli/${entradaId}`);
    });
  }

  return (
    <motion.button
      type="button"
      layout
      disabled={pendiente || hecho}
      onClick={marcar}
      aria-label={hecho ? `${titulo}: marcada como vista` : `Ya vimos ${titulo}`}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.35 }}
      className={cn(
        'foco relative inline-flex h-10 items-center justify-center gap-1.5 overflow-visible rounded-full bg-acento text-sm font-semibold text-sobre-acento shadow-baja transition-[filter] hover:brightness-110',
        hecho ? 'w-10' : 'px-4',
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {hecho ? (
          <motion.span
            key="tilde"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className="relative flex"
          >
            <motion.span
              aria-hidden
              className="absolute -inset-3 rounded-full border-2 border-acento"
              initial={{ scale: 0.5, opacity: 0.9 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
              <motion.path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.28, delay: 0.05, ease: 'easeOut' }}
              />
            </svg>
          </motion.span>
        ) : (
          <motion.span key="texto" exit={{ opacity: 0, scale: 0.8 }} className="whitespace-nowrap">
            Ya la vimos
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
