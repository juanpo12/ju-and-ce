'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createNightAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import { GAME_NAME, GAMES } from '@/lib/movie-night';
import type { Persona } from '@/lib/personas';

/** Opens a just-for-fun session; the other person sees it show up and joins. */
export function StartPlaying({ reason, other }: { reason: string | null; other: Persona | null }) {
  const router = useRouter();
  const [opening, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function open() {
    setError(null);
    start(async () => {
      const r = await createNightAction(true);
      if ('error' in r) {
        setError(r.error);
        toast(r.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="tarjeta flex flex-col items-center gap-4 px-6 py-8 text-center">
      <span className="flex items-center gap-2">
        <span className="flex size-14 items-center justify-center rounded-full bg-acento-suave text-acento">
          <Gamepad />
        </span>
        {other && <Avatar persona={other} medida="grande" />}
      </span>
      <p className="font-titulo text-4xl leading-none text-tinta">
        {other ? `Una partida con ${other.nombre}` : 'Una partida de a dos'}
      </p>
      <p className="max-w-sm text-sm leading-relaxed text-tinta-suave">
        {reason ?? 'Cada uno desde su celular. Abrís la sesión, entra la otra persona y eligen a qué.'}
      </p>
      <Boton onClick={open} disabled={Boolean(reason) || opening} className="h-11 px-6">
        {opening ? 'Abriendo…' : 'Empezar'}
      </Boton>
      {error && <p className="text-sm text-acento">{error}</p>}

      <ul className="mt-2 flex flex-wrap justify-center gap-1.5" aria-label="Juegos">
        {GAMES.filter((g) => g !== 'moneda').map((g) => (
          <li key={g} className="rounded-full border border-borde px-2.5 py-1 text-xs text-tinta-suave">
            {GAME_NAME[g]}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Gamepad() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-7"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 7h10a5 5 0 0 1 4.9 6l-.7 3.4a2.3 2.3 0 0 1-4 1L15.5 15.5h-7L6.8 17.4a2.3 2.3 0 0 1-4-1L2.1 13A5 5 0 0 1 7 7z" />
      <path d="M8 10v3M6.5 11.5h3" />
      <circle cx="15.5" cy="10.5" r="0.8" fill="currentColor" />
      <circle cx="17.5" cy="12.5" r="0.8" fill="currentColor" />
    </svg>
  );
}
