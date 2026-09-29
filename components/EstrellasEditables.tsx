'use client';

import { useState } from 'react';
import { Estrella, formatear } from './Estrellas';

/**
 * Cada estrella son dos zonas de tap: la mitad izquierda pone el medio punto, la
 * derecha el punto entero. Con teclado, las flechas mueven de a 0,5.
 */
export function EstrellasEditables({
  valor,
  onCambio,
  tamano = 'grande',
  etiqueta = 'Tu puntaje',
}: {
  valor: number | null;
  onCambio: (valor: number) => void;
  tamano?: 'base' | 'grande';
  etiqueta?: string;
}) {
  const [encima, setEncima] = useState<number | null>(null);
  const mostrado = encima ?? valor ?? 0;
  const medida = tamano === 'grande' ? 'enorme' : 'grande';

  function porTeclado(e: React.KeyboardEvent) {
    const paso = { ArrowRight: 0.5, ArrowUp: 0.5, ArrowLeft: -0.5, ArrowDown: -0.5 }[e.key];
    if (paso === undefined) return;
    e.preventDefault();
    onCambio(Math.min(5, Math.max(0.5, (valor ?? 0) + paso)));
  }

  return (
    <div
      className="inline-flex flex-col gap-1"
      role="slider"
      tabIndex={0}
      aria-label={etiqueta}
      aria-valuemin={0.5}
      aria-valuemax={5}
      aria-valuenow={valor ?? undefined}
      aria-valuetext={valor ? `${formatear(valor)} de 5` : 'Sin puntuar'}
      onKeyDown={porTeclado}
      onPointerLeave={() => setEncima(null)}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className="relative inline-block">
            <Estrella relleno={mostrado - (n - 1)} medida={medida} />
            {([0.5, 0] as const).map((offset, i) => (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                aria-label={`${formatear(n - offset)} estrellas`}
                className="absolute top-0 h-full w-1/2 cursor-pointer"
                style={{ left: i === 0 ? 0 : '50%' }}
                onPointerEnter={() => setEncima(n - offset)}
                onClick={() => onCambio(n - offset)}
              />
            ))}
          </span>
        ))}
      </div>
      <span className="font-texto text-sm text-tinta-suave" aria-hidden>
        {mostrado ? `${formatear(mostrado)} de 5` : 'Tocá para puntuar'}
      </span>
    </div>
  );
}
