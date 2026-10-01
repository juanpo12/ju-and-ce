'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createNightAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { cn } from '@/lib/utils';
import type { Persona } from '@/lib/personas';

/**
 * Two ways to choose: alone (the die) or as a duo (each on their own phone,
 * and if they disagree, they play for it). "De a dos" opens the session and
 * the other person sees it show up in Pendientes.
 */
export function ChooseMode({
  duoAvailable,
  reason,
  other,
}: {
  duoAvailable: boolean;
  reason: string | null;
  other: Persona | null;
}) {
  const router = useRouter();
  const [opening, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function open() {
    setError(null);
    start(async () => {
      const r = await createNightAction();
      if ('error' in r) {
        setError(r.error);
        toast(r.error);
        return;
      }
      router.refresh();
    });
  }

  const card =
    'foco tocable tarjeta flex flex-col items-start gap-3 p-5 text-left transition-colors hover:bg-acento-suave disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-superficie';

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Link href="/pendientes/noche?modo=solo" className={card}>
        <Icon>
          <rect x="4" y="4" width="16" height="16" rx="3.5" />
          <circle cx="9" cy="9" r="0.9" fill="currentColor" />
          <circle cx="15" cy="15" r="0.9" fill="currentColor" />
          <circle cx="12" cy="12" r="0.9" fill="currentColor" />
        </Icon>
        <span className="font-titulo text-3xl leading-none text-tinta">Que elija el dado</span>
        <span className="text-sm leading-relaxed text-tinta-suave">
          Una al azar entre las pendientes. Podés acotar por tipo, género o duración.
        </span>
      </Link>

      <button type="button" onClick={open} disabled={!duoAvailable || opening} className={card}>
        <span className="flex items-center gap-2">
          <Icon>
            <circle cx="9" cy="8" r="3.2" />
            <circle cx="16.5" cy="9.5" r="2.6" />
            <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5M14.5 18.5c.3-2.3 2-3.8 4-3.8 1.6 0 3 .9 3.5 2.3" />
          </Icon>
          {other && <Avatar persona={other} medida="base" />}
        </span>
        <span className="font-titulo text-3xl leading-none text-tinta">
          {opening ? 'Abriendo…' : 'De a dos'}
        </span>
        <span className={cn('text-sm leading-relaxed', reason ? 'text-tinta-suave italic' : 'text-tinta-suave')}>
          {reason ??
            `Cada uno propone una desde su celular. Si no coinciden, se define jugando: piedra papel o tijera, memoria, ahorcado o la palabra.`}
        </span>
        {error && <span className="text-sm text-acento">{error}</span>}
      </button>
    </div>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
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
