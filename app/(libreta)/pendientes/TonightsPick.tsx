'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Poster } from '@/components/Poster';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import { BotonYaLaVimos } from './BotonYaLaVimos';
import { clearPickedAction } from '@/app/acciones';
import { AT_GAME } from '@/lib/movie-night';
import { varColor, type Persona } from '@/lib/personas';
import type { HistoryNight, Pendiente } from '@/db/queries';

/**
 * The pick waits on top of the list, with how it came to be: "ganó Ceci al
 * ahorcado", "coincidieron", "la eligió el azar". "Ya la vimos" moves it to
 * the library; "Soltar" sends it back to the list, nothing else.
 */
export function TonightsPick({
  pick,
  me,
  other,
  night,
}: {
  pick: Pendiente;
  me: Persona;
  other: Persona | null;
  night: HistoryNight | null;
}) {
  const router = useRouter();
  const [clearing, start] = useTransition();

  const winner = night?.winnerId === me.id ? me : night?.winnerId === other?.id ? other : null;
  const how = !night
    ? null
    : night.mode === 'individual'
      ? 'La eligió el azar'
      : !winner
        ? 'Coincidieron sin jugar'
        : `Ganó ${winner.id === me.id ? 'vos' : winner.nombre} ${night.game ? AT_GAME[night.game] : ''}`.trim();

  function clear() {
    start(async () => {
      await clearPickedAction();
      router.refresh();
    });
  }

  return (
    <motion.section
      aria-label="La de esta noche"
      data-entrada={pick.id}
      data-titulo={pick.titulo}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative mb-5 flex gap-4 overflow-hidden rounded-tema bg-acento p-3 text-sobre-acento shadow-alta sm:p-4"
      style={winner ? { backgroundColor: varColor(winner.color), color: 'var(--sobre-persona)' } : undefined}
    >
      <Link
        href={`/peli/${pick.id}`}
        className="foco tocable w-24 shrink-0 overflow-hidden rounded-[calc(var(--radio)-4px)] shadow-alta sm:w-28"
        tabIndex={-1}
        aria-hidden
      >
        <Poster path={pick.posterPath} titulo={pick.titulo} anio={pick.anio} tamano="chico" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-85">La de esta noche</p>
        <Link href={`/peli/${pick.id}`} className="foco mt-1 rounded-sm">
          <h2 className="line-clamp-2 font-titulo text-3xl leading-[1.02] sm:text-4xl">{pick.titulo}</h2>
        </Link>
        <p className="mt-1 truncate text-xs opacity-85">
          {[pick.anio, pick.duracionMin && `${pick.duracionMin} min`, pick.generos[0]]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {how && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm">
            {winner && <Avatar persona={winner} medida="chico" className="ring-2 ring-sobre-persona/60" />}
            {how}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
          <BotonYaLaVimos entradaId={pick.id} titulo={pick.titulo} inverted />
          <Boton
            variante="fantasma"
            onClick={clear}
            disabled={clearing}
            className="text-current hover:text-current"
          >
            Soltar
          </Boton>
        </div>
      </div>
    </motion.section>
  );
}
