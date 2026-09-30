'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { formatear } from './Estrellas';

const nada = () => () => {};

/**
 * Un número que cuenta desde cero hasta su valor.
 *
 * Escribe directo en el nodo en cada cuadro, sin setState: sesenta renders por
 * segundo para cambiar un texto sería tirar trabajo. Si la pantalla llega con la
 * carga inicial (hidratando), muestra el valor final de entrada, igual que el
 * HTML del servidor; cuenta cuando se llega navegando.
 */
export function Contador({ valor, decimales = 0 }: { valor: number; decimales?: 0 | 1 }) {
  const nodo = useRef<HTMLSpanElement>(null);
  const reducido = useReducedMotion();
  const enCliente = useSyncExternalStore(
    nada,
    () => true,
    () => false,
  );
  const [animar] = useState(() => enCliente);

  useEffect(() => {
    if (!animar || reducido || !nodo.current) return;
    const el = nodo.current;
    const control = animate(0, valor, {
      duration: 0.9,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => {
        el.textContent = decimales ? formatear(Math.round(v * 10) / 10) : String(Math.round(v));
      },
    });
    return () => control.stop();
  }, [animar, reducido, valor, decimales]);

  return (
    <span ref={nodo} className="tabular-nums">
      {animar && !reducido ? '0' : decimales ? formatear(valor) : String(valor)}
    </span>
  );
}
