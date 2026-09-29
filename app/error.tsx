'use client';

import { useEffect } from 'react';
import { Boton } from '@/components/Boton';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <div className="tarjeta flex max-w-sm flex-col items-center gap-3 px-6 py-10 text-center">
        <p className="font-titulo text-3xl text-tinta">Se rompió algo</p>
        <p className="text-sm text-tinta-suave">
          No es tu culpa. Probá de nuevo; si sigue pasando, avisame.
        </p>
        <Boton type="button" onClick={reset}>
          Reintentar
        </Boton>
      </div>
    </main>
  );
}
