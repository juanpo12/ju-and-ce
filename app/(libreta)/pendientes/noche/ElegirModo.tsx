'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { accionCrearNoche } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { cn } from '@/lib/utils';
import type { Persona } from '@/lib/personas';

/**
 * Dos formas de elegir: solo (el dado) o de a dos (cada uno en su celular, y
 * si no se ponen de acuerdo, se juega). «De a dos» abre la sesión y el otro
 * la ve aparecer en Pendientes.
 */
export function ElegirModo({
  deADos,
  motivo,
  otro,
}: {
  deADos: boolean;
  motivo: string | null;
  otro: Persona | null;
}) {
  const router = useRouter();
  const [abriendo, empezar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function abrir() {
    setError(null);
    empezar(async () => {
      const r = await accionCrearNoche();
      if ('error' in r) {
        setError(r.error);
        toast(r.error);
        return;
      }
      router.refresh();
    });
  }

  const tarjeta =
    'foco tocable tarjeta flex flex-col items-start gap-3 p-5 text-left transition-colors hover:bg-acento-suave disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-superficie';

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Link href="/pendientes/noche?modo=solo" className={tarjeta}>
        <Icono>
          <rect x="4" y="4" width="16" height="16" rx="3.5" />
          <circle cx="9" cy="9" r="0.9" fill="currentColor" />
          <circle cx="15" cy="15" r="0.9" fill="currentColor" />
          <circle cx="12" cy="12" r="0.9" fill="currentColor" />
        </Icono>
        <span className="font-titulo text-3xl leading-none text-tinta">Que elija el dado</span>
        <span className="text-sm leading-relaxed text-tinta-suave">
          Una al azar entre las pendientes. Podés acotar por tipo, género o duración.
        </span>
      </Link>

      <button type="button" onClick={abrir} disabled={!deADos || abriendo} className={tarjeta}>
        <span className="flex items-center gap-2">
          <Icono>
            <circle cx="9" cy="8" r="3.2" />
            <circle cx="16.5" cy="9.5" r="2.6" />
            <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5M14.5 18.5c.3-2.3 2-3.8 4-3.8 1.6 0 3 .9 3.5 2.3" />
          </Icono>
          {otro && <Avatar persona={otro} medida="base" />}
        </span>
        <span className="font-titulo text-3xl leading-none text-tinta">
          {abriendo ? 'Abriendo…' : 'De a dos'}
        </span>
        <span className={cn('text-sm leading-relaxed', motivo ? 'text-tinta-suave italic' : 'text-tinta-suave')}>
          {motivo ??
            `Cada uno propone una desde su celular. Si no coinciden, se define jugando: piedra papel o tijera, memoria, ahorcado o la palabra.`}
        </span>
        {error && <span className="text-sm text-acento">{error}</span>}
      </button>
    </div>
  );
}

function Icono({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex size-11 items-center justify-center rounded-full bg-acento-suave text-acento">
      <svg
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {children}
      </svg>
    </span>
  );
}
