'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { accionJugar } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { JUGADAS, type Jugada, type PartidaPPT } from '@/lib/noche';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { CabeceraJuego } from './CabeceraJuego';
import { personaDe, type Mesa } from '../tipos';

const NOMBRE: Record<Jugada, string> = { piedra: 'Piedra', papel: 'Papel', tijera: 'Tijera' };
const REVELACION_MS = 1800;

/**
 * Cada uno elige en su celular; la jugada no se ve hasta que eligieron los
 * dos. Cuando llega una ronda resuelta, se muestran las dos manos un momento
 * y recién después vuelve el turno de elegir.
 */
export function PiedraPapelTijera({
  mesa,
  partida,
  pendientes,
}: {
  mesa: Mesa;
  partida: PartidaPPT;
  pendientes: Pendiente[];
}) {
  const { noche, yo, otro, enviar, ocupado } = mesa;
  const yaElegi = partida.eligieron.includes(yo.id);
  const eligioElOtro = partida.eligieron.includes(otro.id);

  // La última ronda se revela cuando aparece: se recuerda cuántas había.
  const [reveladas, setReveladas] = useState(partida.rondas.length);
  const revelando = partida.rondas.length > reveladas;
  useEffect(() => {
    if (!revelando) return;
    const id = setTimeout(() => setReveladas(partida.rondas.length), REVELACION_MS);
    return () => clearTimeout(id);
  }, [revelando, partida.rondas.length]);

  const ultima = partida.rondas[partida.rondas.length - 1];

  return (
    <section>
      <CabeceraJuego mesa={mesa} pendientes={pendientes} nombre="Piedra, papel o tijera" detalle={`Al mejor de 3`} />

      <div className="mb-5 flex items-center justify-center gap-6">
        {[yo, otro].map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <Avatar persona={p} />
            <span className="flex gap-1" aria-label={`${p.nombre}: ${partida.marcador[p.id] ?? 0} puntos`}>
              {Array.from({ length: partida.meta }, (_, i) => (
                <span
                  key={i}
                  className="size-3 rounded-full border-2"
                  style={{
                    borderColor: varColor(p.color),
                    backgroundColor: i < (partida.marcador[p.id] ?? 0) ? varColor(p.color) : 'transparent',
                  }}
                />
              ))}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {revelando && ultima ? (
          <motion.div
            key={`ronda-${partida.rondas.length}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="tarjeta flex flex-col items-center gap-3 px-4 py-6"
          >
            <div className="flex items-center gap-6">
              {[yo, otro].map((p) => {
                const j = ultima.jugadas[p.id];
                const gano = ultima.ganador === p.id;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    transition={{ delay: 0.15, type: 'spring', bounce: 0.4 }}
                    className={cn('flex flex-col items-center gap-2', ultima.ganador && !gano && 'opacity-50')}
                  >
                    <span
                      className="flex size-20 items-center justify-center rounded-full text-sobre-persona"
                      style={{ backgroundColor: varColor(p.color) }}
                    >
                      {j && <Mano jugada={j} />}
                    </span>
                    <span className="text-xs text-tinta-suave">{j ? NOMBRE[j] : '—'}</span>
                  </motion.div>
                );
              })}
            </div>
            <p className="font-titulo text-3xl text-tinta">
              {ultima.ganador === null
                ? 'Empate: de nuevo'
                : ultima.ganador === yo.id
                  ? 'Punto para vos'
                  : `Punto para ${personaDe(mesa, ultima.ganador)?.nombre}`}
            </p>
          </motion.div>
        ) : yaElegi ? (
          <motion.div
            key="esperando"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="tarjeta flex flex-col items-center gap-2 px-4 py-8 text-center"
          >
            <span className="relative flex">
              <Avatar persona={otro} medida="grande" vacio={!eligioElOtro} />
              {!eligioElOtro && (
                <span aria-hidden className="absolute -inset-1.5 animate-ping rounded-full border-2 border-acento opacity-50" />
              )}
            </span>
            <p className="font-titulo text-2xl text-tinta">
              {eligioElOtro ? 'Ya eligieron los dos…' : `Esperando a ${otro.nombre}…`}
            </p>
            <p className="text-xs text-tinta-suave">Tu jugada queda escondida hasta que elijan los dos.</p>
          </motion.div>
        ) : (
          <motion.div
            key="elegir"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-sm text-tinta-suave">
              {eligioElOtro ? `${otro.nombre} ya eligió. Te toca.` : 'Elegí sin que te vea.'}
            </p>
            <div className="grid w-full max-w-sm grid-cols-3 gap-2">
              {JUGADAS.map((j) => (
                <button
                  key={j}
                  type="button"
                  disabled={ocupado}
                  onClick={() => enviar(() => accionJugar(noche.id, { juego: 'ppt', jugada: j }))}
                  className="foco tocable tarjeta flex aspect-square flex-col items-center justify-center gap-2 text-acento transition-colors hover:bg-acento-suave disabled:opacity-60"
                  aria-label={NOMBRE[j]}
                >
                  <Mano jugada={j} />
                  <span className="font-cartel text-lg tracking-wide text-tinta">{NOMBRE[j]}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {partida.rondas.length > 0 && !revelando && (
        <ol className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-tinta-suave" aria-label="Rondas">
          {partida.rondas.map((r, i) => {
            const quien = personaDe(mesa, r.ganador);
            return (
              <li key={i} className="flex items-center gap-1 rounded-full border border-borde px-2 py-0.5">
                {quien ? <Avatar persona={quien} medida="chico" /> : <span>=</span>}
                {NOMBRE[r.jugadas[yo.id]!]?.toLowerCase()} · {NOMBRE[r.jugadas[otro.id]!]?.toLowerCase()}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/** Las tres manos, en trazo. */
function Mano({ jugada }: { jugada: Jugada }) {
  const comun = {
    viewBox: '0 0 24 24',
    className: 'size-9',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (jugada === 'piedra') {
    return (
      <svg {...comun}>
        <path d="M6 12.5V9a1.5 1.5 0 0 1 3 0v2.5M9 11V7.5a1.5 1.5 0 0 1 3 0V11M12 11V8a1.5 1.5 0 0 1 3 0v3.5M15 11.5V9.5a1.5 1.5 0 0 1 3 0v4a5.5 5.5 0 0 1-5.5 5.5h-1A5.5 5.5 0 0 1 6 13.5v-1" />
      </svg>
    );
  }
  if (jugada === 'papel') {
    return (
      <svg {...comun}>
        <path d="M7 12V5.5a1.5 1.5 0 0 1 3 0V11M10 11V4a1.5 1.5 0 0 1 3 0v7M13 11V5a1.5 1.5 0 0 1 3 0v6.5M16 11.5V7.5a1.5 1.5 0 0 1 3 0v6a5.5 5.5 0 0 1-5.5 5.5h-1A5.5 5.5 0 0 1 7 13.5v-1" />
      </svg>
    );
  }
  return (
    <svg {...comun}>
      <path d="M9.5 12.5L6 5.5a1.4 1.4 0 0 1 2.5-1.2L12 11M14.5 12.5L18 5.5a1.4 1.4 0 0 0-2.5-1.2L12 11" />
      <path d="M9 12.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM15 12.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    </svg>
  );
}
