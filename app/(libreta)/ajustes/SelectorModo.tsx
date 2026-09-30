'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'motion/react';
import { Monitor, Moon, Sun } from 'lucide-react';

const MODOS = [
  { valor: 'light', texto: 'Claro', icono: Sun },
  { valor: 'dark', texto: 'Oscuro', icono: Moon },
  { valor: 'system', texto: 'Sistema', icono: Monitor },
] as const;

/**
 * El modo no se guarda en el perfil como el tema: es de cada dispositivo. El
 * celular de noche en oscuro y la compu del trabajo en claro es lo normal.
 */
export function SelectorModo() {
  const { theme, setTheme } = useTheme();
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const actual = montado ? (theme ?? 'system') : null;

  return (
    <fieldset className="tarjeta flex flex-col gap-2 px-4 py-4">
      <legend className="sr-only">Modo</legend>
      <div>
        <p className="text-sm font-semibold text-tinta" aria-hidden>
          Modo
        </p>
        <p className="text-xs text-tinta-suave">Se recuerda en este dispositivo.</p>
      </div>
      <div className="grid grid-cols-3 gap-1 rounded-tema bg-acento-suave/60 p-1">
        {MODOS.map(({ valor, texto, icono: Icono }) => {
          const elegido = actual === valor;
          return (
            <label
              key={valor}
              className="relative flex cursor-pointer items-center justify-center gap-1.5 rounded-[calc(var(--radio)-4px)] px-2 py-2 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-acento"
              style={{ color: elegido ? 'var(--tinta)' : 'var(--tinta-suave)' }}
            >
              <input
                type="radio"
                name="modo"
                value={valor}
                checked={elegido}
                onChange={() => setTheme(valor)}
                className="sr-only"
              />
              {elegido && (
                <motion.span
                  layoutId="modo-elegido"
                  className="absolute inset-0 rounded-[inherit] bg-superficie-alta shadow-baja"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                />
              )}
              <Icono className="relative size-4" aria-hidden />
              <span className="relative">{texto}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
