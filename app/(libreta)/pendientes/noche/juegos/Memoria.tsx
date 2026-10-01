'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { accionJugar } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Poster } from '@/components/Poster';
import type { Carta, PartidaMemoria } from '@/lib/noche';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { CabeceraJuego } from './CabeceraJuego';
import { personaDe, type Mesa } from '../tipos';

const MOSTRAR_FALLO_MS = 1300;

/**
 * Un solo tablero para los dos celulares. Las caras las sabe el servidor: acá
 * se ve lo que está dado vuelta. Cuando un par falla, el servidor ya lo tapó y
 * dejó en `ultimaJugada` qué había: se muestra un momento y después se da vuelta.
 */
export function Memoria({
  mesa,
  partida,
  pendientes,
}: {
  mesa: Mesa;
  partida: PartidaMemoria;
  pendientes: Pendiente[];
}) {
  const { noche, yo, otro, enviar, ocupado } = mesa;
  const meToca = partida.turno === yo.id;

  // El fallo que se está mostrando: las dos cartas con su cara, un ratito.
  const [fallo, setFallo] = useState<PartidaMemoria['ultimaJugada'] | null>(null);
  // En un ref, no en estado: si fuera estado, cambiarlo volvería a correr el
  // efecto y su limpieza cancelaría el timer que destapa las cartas.
  const vista = useRef(partida.ultimaJugada?.n ?? 0);
  useEffect(() => {
    const u = partida.ultimaJugada;
    if (!u || u.n <= vista.current) return;
    vista.current = u.n;
    if (u.acierto) return;
    setFallo(u);
    const id = setTimeout(() => setFallo(null), MOSTRAR_FALLO_MS);
    return () => clearTimeout(id);
  }, [partida.ultimaJugada]);

  const [tocando, setTocando] = useState<number | null>(null);

  function tocar(i: number) {
    if (!meToca || ocupado || fallo) return;
    setTocando(i);
    void enviar(() => accionJugar(noche.id, { juego: 'memoria', carta: i })).finally(() => setTocando(null));
  }

  const columnas = partida.cartas.length > 12 ? 'grid-cols-4 sm:grid-cols-7' : partida.cartas.length > 8 ? 'grid-cols-4 sm:grid-cols-5' : 'grid-cols-3';
  const quienToca = personaDe(mesa, partida.turno);

  return (
    <section>
      <CabeceraJuego
        mesa={mesa}
        pendientes={pendientes}
        nombre="Memoria"
        detalle={`${partida.totalPares} pares. Acertás, seguís.`}
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {[yo, otro].map((p) => (
            <span key={p.id} className="flex items-center gap-1.5 text-sm text-tinta">
              <Avatar persona={p} />
              <span className="font-cartel text-2xl tracking-wide" style={{ color: varColor(p.color) }}>
                {partida.pares[p.id] ?? 0}
              </span>
            </span>
          ))}
        </div>
        <p
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={
            quienToca
              ? { backgroundColor: varColor(quienToca.color), color: 'var(--sobre-persona)' }
              : undefined
          }
          aria-live="polite"
        >
          {meToca ? 'Te toca' : `Le toca a ${otro.nombre}`}
        </p>
      </div>

      <ul className={cn('grid gap-2', columnas)} aria-label="Tablero">
        {partida.cartas.map((c, i) => {
          const enFallo = fallo?.cartas.includes(i) ? fallo.fichas[fallo.cartas.indexOf(i) as 0 | 1] : null;
          const cara: Carta | null = c.revelada ?? enFallo;
          const dueno = personaDe(mesa, c.de);
          const bloqueada = !meToca || ocupado || Boolean(fallo) || Boolean(cara);
          return (
            <li key={i} className="[perspective:600px]">
              <motion.button
                type="button"
                disabled={bloqueada}
                onClick={() => tocar(i)}
                aria-label={cara ? cara.titulo : `Carta ${i + 1}, tapada`}
                animate={{ rotateY: cara ? 180 : 0, scale: tocando === i ? 0.94 : 1 }}
                transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                className="foco relative aspect-[2/3] w-full rounded-[calc(var(--radio)-4px)] [transform-style:preserve-3d] disabled:cursor-default"
              >
                {/* Dorso: una claqueta sobre el acento suave. */}
                <span className="absolute inset-0 flex items-center justify-center rounded-[inherit] border border-borde bg-acento-suave text-acento shadow-baja [backface-visibility:hidden]">
                  <Claqueta />
                </span>
                {/* Cara: el póster, con el anillo de quien ganó el par. */}
                <span
                  className="absolute inset-0 overflow-hidden rounded-[inherit] shadow-baja [backface-visibility:hidden] [transform:rotateY(180deg)]"
                  style={dueno ? { boxShadow: `0 0 0 3px ${varColor(dueno.color)}` } : undefined}
                >
                  {cara && <Poster path={cara.posterPath} titulo={cara.titulo} anio={cara.anio} tamano="chico" />}
                  {dueno && (
                    <span className="absolute left-1 top-1">
                      <Avatar persona={dueno} medida="chico" />
                    </span>
                  )}
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Claqueta() {
  return (
    <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M4.5 10 3.6 6.6a1 1 0 0 1 .7-1.2l13.5-3.3a1 1 0 0 1 1.2.7l.6 2.4z" />
      <path d="M8 9.5 7 6M12 8.5l-1-3.5M16 7.5l-1-3.5" />
    </svg>
  );
}
