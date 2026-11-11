'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { accionMandarMimo } from '@/app/acciones';
import { DialogoAdaptable } from './DialogoAdaptable';
import { Boton } from './Boton';
import { cn } from '@/lib/utils';

/**
 * El corazón de arriba: arranca una cadena de mimos. Al otro le aparece el
 * «te ama por siempre» y puede contestar.
 */
export function BotonTeAmo({ texto, className }: { texto: string; className?: string }) {
  const [abierto, setAbierto] = useState(false);
  const [mandando, empezar] = useTransition();

  const mandar = () =>
    empezar(async () => {
      try {
        await accionMandarMimo('te_amo');
        setAbierto(false);
        toast('Listo, ya le llegó 💛');
      } catch {
        toast.error('No se pudo mandar, probá de nuevo');
      }
    });

  return (
    <>
      <button
        type="button"
        aria-label={texto}
        title={texto}
        onClick={() => setAbierto(true)}
        className={cn(
          'foco tocable inline-flex size-10 items-center justify-center rounded-full text-tinta-suave transition-colors hover:bg-acento-suave hover:text-acento',
          className,
        )}
      >
        <Heart className="size-5" strokeWidth={1.8} aria-hidden />
      </button>
      <DialogoAdaptable abierto={abierto} onCambio={setAbierto} titulo="Un mimo 💛">
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          <p className="text-6xl" aria-hidden>
            💌
          </p>
          <Boton className="w-full" onClick={mandar} disabled={mandando}>
            {mandando ? 'Mandando…' : `${texto} 💛`}
          </Boton>
        </div>
      </DialogoAdaptable>
    </>
  );
}
