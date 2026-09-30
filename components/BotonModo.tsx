'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Claro ↔ oscuro, con el ícono girando al cambiar.
 *
 * El servidor no sabe qué modo tiene el navegador, así que hasta montar se
 * dibuja un botón sin ícono del mismo tamaño: si adivinara, la hidratación no
 * coincidiría con lo que ya pintó el script de next-themes.
 */
export function BotonModo({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const oscuro = montado && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(oscuro ? 'light' : 'dark')}
      aria-label={oscuro ? 'Pasar a modo claro' : 'Pasar a modo oscuro'}
      title={oscuro ? 'Modo claro' : 'Modo oscuro'}
      className={cn(
        'foco tocable relative inline-flex size-10 items-center justify-center overflow-hidden rounded-full text-tinta-suave transition-colors hover:bg-acento-suave hover:text-acento',
        className,
      )}
    >
      {montado && (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={oscuro ? 'luna' : 'sol'}
            initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="inline-flex"
            aria-hidden
          >
            {oscuro ? <Moon className="size-5" /> : <Sun className="size-5" />}
          </motion.span>
        </AnimatePresence>
      )}
    </button>
  );
}
