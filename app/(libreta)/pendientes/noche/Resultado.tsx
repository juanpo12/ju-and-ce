'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { accionCrearNoche, accionSoltarElegida } from '@/app/acciones';
import { Boton, BotonLink } from '@/components/Boton';
import { Poster } from '@/components/Poster';
import { Avatar } from '@/components/Avatar';
import { AL_JUEGO } from '@/lib/noche';
import { varColor } from '@/lib/personas';
import type { Pendiente } from '@/db/queries';
import { Moneda, DURACION_MONEDA_MS } from './Moneda';
import { Candidatas } from './Candidatas';
import { personaDe, nombreDe, type Mesa } from './tipos';

/**
 * El final: la ganadora en el color de quien ganó, o «coincidieron», o
 * «cerró la sesión». Si la definió la moneda (porque la eligieron o porque el
 * juego empató), primero se la ve caer.
 */
export function Resultado({ mesa, pendientes }: { mesa: Mesa; pendientes: Pendiente[] }) {
  const router = useRouter();
  const { noche, yo, otro, enviar, ocupado } = mesa;
  const [soltando, empezar] = useTransition();

  const porMoneda = noche.juego === 'moneda' || Boolean(noche.estado.desempate);
  const [cayendo, setCayendo] = useState(porMoneda);
  useEffect(() => {
    if (!porMoneda) return;
    const id = setTimeout(() => setCayendo(false), DURACION_MONEDA_MS + 400);
    return () => clearTimeout(id);
  }, [porMoneda]);

  if (noche.fase === 'cancelada') {
    const quien = noche.estado.cerradaPor;
    return (
      <section className="tarjeta flex flex-col items-center gap-3 px-6 py-10 text-center">
        <p className="font-titulo text-3xl leading-tight text-tinta">
          {quien === yo.id ? 'Cerraste la sesión' : `${nombreDe(mesa, quien)} cerró la sesión`}
        </p>
        <p className="max-w-xs text-sm text-tinta-suave">No pasa nada: se puede abrir otra cuando quieran.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Boton onClick={() => enviar(() => accionCrearNoche())} disabled={ocupado}>
            Abrir otra
          </Boton>
          <BotonLink href="/pendientes" variante="secundario">
            Volver a pendientes
          </BotonLink>
        </div>
      </section>
    );
  }

  const ganador = personaDe(mesa, noche.ganadorId);
  const peli = pendientes.find((p) => p.id === noche.entradaId) ?? null;

  if (cayendo && ganador) {
    return (
      <section className="flex flex-col items-center gap-2 py-6 text-center">
        <p className="font-titulo text-3xl text-tinta">
          {noche.estado.desempate ? 'Empataron: lo define la moneda' : 'Cara o cruz'}
        </p>
        <Moneda cara={mesa.jugadores[0] === yo.id ? yo : otro} cruz={mesa.jugadores[0] === yo.id ? otro : yo} resultado={ganador.id} />
      </section>
    );
  }

  function soltar() {
    empezar(async () => {
      await accionSoltarElegida();
      router.refresh();
    });
  }

  const titulo = !ganador
    ? '¡Coincidieron!'
    : ganador.id === yo.id
      ? '¡Ganaste!'
      : `Ganó ${ganador.nombre}`;
  const detalle = !ganador
    ? 'Los dos propusieron la misma. No hubo nada que definir.'
    : [
        noche.juego ? `${ganador.id === yo.id ? 'Ganaste' : 'Ganó'} ${AL_JUEGO[noche.juego]}` : null,
        noche.estado.desempate ? 'después de empatar: lo definió la moneda' : null,
      ]
        .filter(Boolean)
        .join(', ');

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.35, duration: 0.6 }}
      className="overflow-hidden rounded-tema bg-acento text-sobre-acento shadow-alta"
      style={ganador ? { backgroundColor: varColor(ganador.color), color: 'var(--sobre-persona)' } : undefined}
    >
      <div className="flex flex-col items-center gap-3 px-6 pt-8 text-center">
        {ganador && <Avatar persona={ganador} medida="grande" className="ring-4 ring-sobre-persona/50" />}
        <p className="font-titulo text-5xl leading-none">{titulo}</p>
        <p className="max-w-sm text-sm opacity-90">{detalle}</p>
      </div>

      <div className="flex flex-col items-center gap-3 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-85">La de esta noche</p>
        {peli ? (
          <Link href={`/peli/${peli.id}`} className="foco tocable w-36 overflow-hidden rounded-tema shadow-alta sm:w-44">
            <Poster path={peli.posterPath} titulo={peli.titulo} anio={peli.anio} tamano="grilla" prioridad />
          </Link>
        ) : (
          <p className="text-sm opacity-85">Una que ya no está en pendientes.</p>
        )}
        {peli && <p className="font-titulo text-3xl leading-tight">{peli.titulo}</p>}
      </div>

      {noche.juego && noche.juego !== 'moneda' && (
        <div className="px-6 pb-4 opacity-90">
          <Candidatas mesa={mesa} pendientes={pendientes} chico ganador={noche.ganadorId} />
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 bg-superficie/15 px-6 py-4">
        <BotonLink href="/pendientes" className="bg-superficie text-tinta">
          Ir a pendientes
        </BotonLink>
        <Boton variante="fantasma" onClick={soltar} disabled={soltando} className="text-current opacity-85 hover:text-current hover:opacity-100">
          Elegir otra
        </Boton>
      </div>
    </motion.section>
  );
}
