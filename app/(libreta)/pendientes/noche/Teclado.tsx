'use client';

import { useEffect } from 'react';
import { Delete } from 'lucide-react';
import { cn } from '@/lib/utils';

export type EstadoTecla = 'bien' | 'casi' | 'no' | 'acierto' | 'error';

const FILAS = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'];

const COLOR: Record<EstadoTecla, string> = {
  bien: 'bg-acento text-sobre-acento border-acento',
  casi: 'bg-acento-suave text-tinta border-acento',
  no: 'bg-borde/60 text-tinta-suave border-borde line-through',
  acierto: 'bg-acento text-sobre-acento border-acento',
  error: 'bg-borde/60 text-tinta-suave border-borde',
};

/**
 * Un teclado en pantalla, con la Ñ, para el ahorcado y la palabra. En la compu
 * también escucha el teclado de verdad. Cada tecla puede venir pintada con lo
 * que ya se sabe de esa letra.
 */
export function Teclado({
  onLetra,
  onBorrar,
  onEnter,
  estadoDe,
  deshabilitado = false,
}: {
  onLetra: (letra: string) => void;
  onBorrar?: () => void;
  onEnter?: () => void;
  estadoDe?: (letra: string) => EstadoTecla | undefined;
  deshabilitado?: boolean;
}) {
  useEffect(() => {
    if (deshabilitado) return;
    const escuchar = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const objetivo = e.target as HTMLElement | null;
      if (objetivo && /^(INPUT|TEXTAREA|SELECT)$/.test(objetivo.tagName)) return;
      const k = e.key.toUpperCase();
      if (k === 'ENTER' && onEnter) onEnter();
      else if (k === 'BACKSPACE' && onBorrar) onBorrar();
      else if (/^[A-ZÑ]$/.test(k)) onLetra(k);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', escuchar);
    return () => window.removeEventListener('keydown', escuchar);
  }, [onLetra, onBorrar, onEnter, deshabilitado]);

  return (
    <div className="flex select-none flex-col items-center gap-1.5" aria-label="Teclado">
      {FILAS.map((fila, i) => (
        <div key={fila} className="flex w-full justify-center gap-1">
          {i === 2 && onEnter && (
            <Tecla ancha onClick={onEnter} deshabilitado={deshabilitado} etiqueta="Listo">
              Listo
            </Tecla>
          )}
          {[...fila].map((l) => {
            const estado = estadoDe?.(l);
            return (
              <Tecla
                key={l}
                onClick={() => onLetra(l)}
                deshabilitado={deshabilitado || estado === 'no' || estado === 'error'}
                className={estado ? COLOR[estado] : undefined}
                etiqueta={l}
              >
                {l}
              </Tecla>
            );
          })}
          {i === 2 && onBorrar && (
            <Tecla ancha onClick={onBorrar} deshabilitado={deshabilitado} etiqueta="Borrar">
              <Delete className="size-5" aria-hidden />
            </Tecla>
          )}
        </div>
      ))}
    </div>
  );
}

function Tecla({
  children,
  onClick,
  deshabilitado,
  ancha = false,
  className,
  etiqueta,
}: {
  children: React.ReactNode;
  onClick: () => void;
  deshabilitado: boolean;
  ancha?: boolean;
  className?: string;
  etiqueta: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      aria-label={etiqueta}
      className={cn(
        'foco tocable flex h-11 items-center justify-center rounded-[calc(var(--radio)-4px)] border border-borde bg-superficie font-cartel text-lg tracking-wide text-tinta shadow-baja transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        ancha ? 'min-w-14 px-2 text-sm font-semibold' : 'w-[8.6%] min-w-7 max-w-10',
        className,
      )}
    >
      {children}
    </button>
  );
}
