'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Estrella, formatear } from './Estrellas';

/**
 * Cada estrella son dos zonas de tap: la mitad izquierda pone el medio punto, la
 * derecha el punto entero. Con teclado, las flechas mueven de a 0,5.
 *
 * Al confirmar, las estrellas encendidas hacen un «pop» de izquierda a derecha:
 * se remontan con una `key` nueva y entran con un resorte que se pasa un poco.
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
  const [pulso, setPulso] = useState(0);
  const mostrado = encima ?? valor ?? 0;
  const medida = tamano === 'grande' ? 'enorme' : 'grande';

  function elegir(v: number) {
    setPulso((p) => p + 1);
    onCambio(v);
  }

  function porTeclado(e: React.KeyboardEvent) {
    const paso = { ArrowRight: 0.5, ArrowUp: 0.5, ArrowLeft: -0.5, ArrowDown: -0.5 }[e.key];
    if (paso === undefined) return;
    e.preventDefault();
    elegir(Math.min(5, Math.max(0.5, (valor ?? 0) + paso)));
  }

  return (
    <div
      className="foco inline-flex flex-col gap-1 rounded-tema"
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
        {[1, 2, 3, 4, 5].map((n) => {
          const encendida = pulso > 0 && valor !== null && n <= Math.ceil(valor);
          return (
            <motion.span
              key={`${n}-${encendida ? pulso : 0}`}
              className="relative inline-block"
              initial={encendida ? { scale: 0.55 } : false}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              transition={{
                type: 'spring',
                stiffness: 520,
                damping: 14,
                delay: encendida ? (n - 1) * 0.045 : 0,
              }}
            >
              <Estrella relleno={mostrado - (n - 1)} medida={medida} />
              {([0.5, 0] as const).map((offset, i) => (
                <button
                  key={i}
                  type="button"
                  tabIndex={-1}
                  aria-label={`${formatear(n - offset)} estrellas`}
                  className="absolute top-0 h-full w-1/2 cursor-pointer"
                  style={{ left: i === 0 ? 0 : '50%' }}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setEncima(n - offset)}
                  onClick={() => elegir(n - offset)}
                />
              ))}
            </motion.span>
          );
        })}
      </div>
      <span className="font-texto text-sm tabular-nums text-tinta-suave" aria-hidden>
        {mostrado ? `${formatear(mostrado)} de 5` : 'Tocá para puntuar'}
      </span>
    </div>
  );
}
