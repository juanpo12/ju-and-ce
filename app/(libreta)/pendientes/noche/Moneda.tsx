'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Avatar } from '@/components/Avatar';
import { varColor, type Persona } from '@/lib/personas';

export const DURACION_MONEDA_MS = 2200;

/**
 * Cara o cruz con los dos: la moneda gira y cae del lado de quien ganó. Son
 * dos caras con `backface-visibility: hidden` y un giro en Y que termina en
 * 0° o en 180° según el resultado.
 */
export function Moneda({ cara, cruz, resultado }: { cara: Persona; cruz: Persona; resultado: string }) {
  const reducido = useReducedMotion();
  const vueltas = 5;
  const final = 360 * vueltas + (resultado === cruz.id ? 180 : 0);

  return (
    <div className="mx-auto my-4 [perspective:900px]" aria-label={`La moneda cayó: ${resultado === cara.id ? cara.nombre : cruz.nombre}`}>
      <motion.div
        className="relative size-32 [transform-style:preserve-3d]"
        initial={{ rotateY: 0, y: 0 }}
        animate={reducido ? { rotateY: final % 360 } : { rotateY: final, y: [0, -60, 0] }}
        transition={
          reducido
            ? { duration: 0 }
            : { rotateY: { duration: DURACION_MONEDA_MS / 1000, ease: [0.2, 0.7, 0.2, 1] }, y: { duration: DURACION_MONEDA_MS / 1000, ease: 'easeOut' } }
        }
      >
        <Cara persona={cara} />
        <Cara persona={cruz} dorso />
      </motion.div>
    </div>
  );
}

function Cara({ persona, dorso = false }: { persona: Persona; dorso?: boolean }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center rounded-full shadow-alta [backface-visibility:hidden]"
      style={{
        backgroundColor: varColor(persona.color),
        color: 'var(--sobre-persona)',
        transform: dorso ? 'rotateY(180deg)' : undefined,
        boxShadow: 'inset 0 0 0 6px color-mix(in srgb, var(--sobre-persona) 35%, transparent), var(--sombra-alta)',
      }}
    >
      <Avatar persona={persona} medida="grande" className="size-16 bg-transparent text-5xl" />
    </div>
  );
}
