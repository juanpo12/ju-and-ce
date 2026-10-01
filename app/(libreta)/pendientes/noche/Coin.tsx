'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Avatar } from '@/components/Avatar';
import { varColor, type Persona } from '@/lib/personas';

export const COIN_DURATION_MS = 2200;

/**
 * Heads or tails with the two of them: the coin spins and lands on the side of
 * whoever won. Two faces with `backface-visibility: hidden` and a Y rotation
 * that ends at 0° or 180° depending on the result.
 */
export function Coin({ heads, tails, result }: { heads: Persona; tails: Persona; result: string }) {
  const reduced = useReducedMotion();
  const turns = 5;
  const final = 360 * turns + (result === tails.id ? 180 : 0);

  return (
    <div className="mx-auto my-4 [perspective:900px]" aria-label={`La moneda cayó: ${result === heads.id ? heads.nombre : tails.nombre}`}>
      <motion.div
        className="relative size-32 [transform-style:preserve-3d]"
        initial={{ rotateY: 0, y: 0 }}
        animate={reduced ? { rotateY: final % 360 } : { rotateY: final, y: [0, -60, 0] }}
        transition={
          reduced
            ? { duration: 0 }
            : { rotateY: { duration: COIN_DURATION_MS / 1000, ease: [0.2, 0.7, 0.2, 1] }, y: { duration: COIN_DURATION_MS / 1000, ease: 'easeOut' } }
        }
      >
        <Face person={heads} />
        <Face person={tails} back />
      </motion.div>
    </div>
  );
}

function Face({ person, back = false }: { person: Persona; back?: boolean }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center rounded-full shadow-alta [backface-visibility:hidden]"
      style={{
        backgroundColor: varColor(person.color),
        color: 'var(--sobre-persona)',
        transform: back ? 'rotateY(180deg)' : undefined,
        boxShadow: 'inset 0 0 0 6px color-mix(in srgb, var(--sobre-persona) 35%, transparent), var(--sombra-alta)',
      }}
    >
      <Avatar persona={person} medida="grande" className="size-16 bg-transparent text-5xl" />
    </div>
  );
}
