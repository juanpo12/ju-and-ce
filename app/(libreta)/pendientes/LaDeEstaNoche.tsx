'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Poster } from '@/components/Poster';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import { BotonYaLaVimos } from './BotonYaLaVimos';
import { accionSoltarElegida } from '@/app/acciones';
import { AL_JUEGO } from '@/lib/noche';
import { varColor, type Persona } from '@/lib/personas';
import type { NocheDelHistorial, Pendiente } from '@/db/queries';

/**
 * La elegida espera arriba de la lista, con cómo salió: «ganó Ceci al
 * ahorcado», «coincidieron», «la eligió el azar». «Ya la vimos» la pasa a la
 * biblioteca; «Soltar» la devuelve a la lista sin más.
 */
export function LaDeEstaNoche({
  elegida,
  yo,
  otro,
  noche,
}: {
  elegida: Pendiente;
  yo: Persona;
  otro: Persona | null;
  noche: NocheDelHistorial | null;
}) {
  const router = useRouter();
  const [soltando, empezar] = useTransition();

  const ganador = noche?.ganadorId === yo.id ? yo : noche?.ganadorId === otro?.id ? otro : null;
  const como = !noche
    ? null
    : noche.modo === 'individual'
      ? 'La eligió el azar'
      : !ganador
        ? 'Coincidieron sin jugar'
        : `Ganó ${ganador.id === yo.id ? 'vos' : ganador.nombre} ${noche.juego ? AL_JUEGO[noche.juego] : ''}`.trim();

  function soltar() {
    empezar(async () => {
      await accionSoltarElegida();
      router.refresh();
    });
  }

  return (
    <motion.section
      aria-label="La de esta noche"
      data-entrada={elegida.id}
      data-titulo={elegida.titulo}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative mb-5 flex gap-4 overflow-hidden rounded-tema bg-acento p-3 text-sobre-acento shadow-alta sm:p-4"
      style={ganador ? { backgroundColor: varColor(ganador.color), color: 'var(--sobre-persona)' } : undefined}
    >
      <Link
        href={`/peli/${elegida.id}`}
        className="foco tocable w-24 shrink-0 overflow-hidden rounded-[calc(var(--radio)-4px)] shadow-alta sm:w-28"
        tabIndex={-1}
        aria-hidden
      >
        <Poster path={elegida.posterPath} titulo={elegida.titulo} anio={elegida.anio} tamano="chico" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-85">La de esta noche</p>
        <Link href={`/peli/${elegida.id}`} className="foco mt-1 rounded-sm">
          <h2 className="line-clamp-2 font-titulo text-3xl leading-[1.02] sm:text-4xl">{elegida.titulo}</h2>
        </Link>
        <p className="mt-1 truncate text-xs opacity-85">
          {[elegida.anio, elegida.duracionMin && `${elegida.duracionMin} min`, elegida.generos[0]]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {como && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm">
            {ganador && <Avatar persona={ganador} medida="chico" className="ring-2 ring-sobre-persona/60" />}
            {como}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
          <BotonYaLaVimos entradaId={elegida.id} titulo={elegida.titulo} invertido />
          <Boton
            variante="fantasma"
            onClick={soltar}
            disabled={soltando}
            className="h-10 px-3 text-current opacity-80 hover:text-current hover:opacity-100"
          >
            Soltar
          </Boton>
        </div>
      </div>
    </motion.section>
  );
}
