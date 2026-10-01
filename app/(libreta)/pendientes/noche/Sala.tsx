'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { JUEGOS } from '@/lib/noche';
import { accionCancelarNoche, accionElegirJuego, accionProponerCandidata } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import { Poster } from '@/components/Poster';
import { filtrarPendientes, NOMBRE_JUEGO, type FiltrosNoche, type Juego } from '@/lib/noche';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { Candidatas } from './Candidatas';
import { FiltrosSorteo } from './FiltrosSorteo';
import type { Mesa } from './tipos';

const DESCRIPCION: Record<Juego, string> = {
  ppt: 'Al mejor de 3. Cada uno elige en su celular y se revela a la vez.',
  memoria: 'Un tablero con pósters de lo que ya vieron. Por turnos: acertás, seguís.',
  ahorcado: 'Un título de la biblioteca. Una letra por turno, o arriesgá.',
  wordle: 'La misma palabra de cinco letras para los dos. Menos intentos gana.',
  moneda: 'Sin jugar: cara o cruz.',
};

/**
 * Las tres fases antes de jugar: esperar al otro, proponer la candidata de
 * cada uno, y elegir con qué se define si no coincidieron.
 */
export function Sala({
  mesa,
  pendientes,
  disponibilidad,
}: {
  mesa: Mesa;
  pendientes: Pendiente[];
  disponibilidad: Record<Juego, string | null>;
}) {
  const { noche, yo, otro, enviar, ocupado } = mesa;

  const cancelar = (
    <div className="mt-6 flex justify-center">
      <Boton variante="fantasma" onClick={() => enviar(() => accionCancelarNoche(noche.id))} disabled={ocupado}>
        Cerrar la sesión
      </Boton>
    </div>
  );

  if (noche.fase === 'esperando') {
    return (
      <section className="tarjeta flex flex-col items-center gap-4 px-6 py-10 text-center">
        <span className="relative flex">
          <Avatar persona={otro} medida="grande" vacio className="size-16 text-2xl" />
          <span aria-hidden className="absolute -inset-2 animate-ping rounded-full border-2 border-acento opacity-50" />
        </span>
        <p className="font-titulo text-3xl leading-tight text-tinta">Esperando a {otro.nombre}…</p>
        <p className="max-w-xs text-sm leading-relaxed text-tinta-suave">
          Cuando abra Pendientes en su celular va a ver que la estás esperando. Pueden seguir cuando entre.
        </p>
        {cancelar}
      </section>
    );
  }

  if (noche.fase === 'candidatas') {
    return (
      <>
        <Proponer mesa={mesa} pendientes={pendientes} />
        {cancelar}
      </>
    );
  }

  // juego: no coincidieron, hay que definir.
  return (
    <>
      <Candidatas mesa={mesa} pendientes={pendientes} />
      <p className="mt-5 text-center font-titulo text-3xl leading-tight text-tinta">¿Con qué se define?</p>
      <p className="mb-4 mt-1 text-center text-sm text-tinta-suave">
        El primero que toca elige. Si es por turnos, empieza el otro.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {JUEGOS.map((juego) => {
          const motivo = disponibilidad[juego];
          return (
            <li key={juego}>
              <button
                type="button"
                disabled={Boolean(motivo) || ocupado}
                onClick={() => enviar(() => accionElegirJuego(noche.id, juego))}
                className="foco tocable tarjeta flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-acento-suave disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-superficie"
              >
                <IconoJuego juego={juego} />
                <span className="min-w-0 flex-1">
                  <span className="block font-titulo text-2xl leading-none text-tinta">{NOMBRE_JUEGO[juego]}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-tinta-suave">{motivo ?? DESCRIPCION[juego]}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {cancelar}
    </>
  );
}

/** Cada uno propone la suya: de la lista, o que la saque el dado. */
function Proponer({ mesa, pendientes }: { mesa: Mesa; pendientes: Pendiente[] }) {
  const { noche, yo, otro, enviar, ocupado } = mesa;
  const candidatas = noche.estado.candidatas ?? {};
  const mia = candidatas[yo.id];
  const suya = candidatas[otro.id];
  const [filtros, setFiltros] = useState<FiltrosNoche>({});
  const [modo, setModo] = useState<'lista' | 'azar'>('lista');
  const posibles = filtrarPendientes(pendientes, filtros);
  const elegibles = pendientes.filter((p) => !p.elegidaEn);

  if (mia) {
    const peli = pendientes.find((p) => p.id === mia.entradaId);
    return (
      <section className="tarjeta flex flex-col items-center gap-3 px-6 py-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tinta-suave">Tu candidata</p>
        {peli && (
          <div className="w-28 overflow-hidden rounded-tema shadow-alta">
            <Poster path={peli.posterPath} titulo={peli.titulo} anio={peli.anio} tamano="chico" />
          </div>
        )}
        <p className="font-titulo text-3xl leading-tight text-tinta">{peli?.titulo ?? 'Una que ya no está'}</p>
        <p className="flex items-center justify-center gap-1.5 text-sm text-tinta-suave">
          <Avatar persona={otro} medida="chico" vacio={!suya} />
          {suya ? `${otro.nombre} ya eligió. Un momento…` : `Esperando a que ${otro.nombre} elija la suya…`}
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="text-center">
        <p className="font-titulo text-3xl leading-tight text-tinta">¿Cuál proponés?</p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-tinta-suave">
          <Avatar persona={otro} medida="chico" vacio={!suya} />
          {suya ? `${otro.nombre} ya eligió la suya` : `${otro.nombre} también está eligiendo`}
        </p>
      </div>

      <div className="mx-auto flex rounded-full border border-borde bg-superficie p-1">
        {(['lista', 'azar'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModo(m)}
            className={cn(
              'foco rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              modo === m ? 'bg-acento text-sobre-acento' : 'text-tinta-suave',
            )}
          >
            {m === 'lista' ? 'Elijo yo' : 'Al azar'}
          </button>
        ))}
      </div>

      {modo === 'azar' ? (
        <div className="tarjeta flex flex-col items-center gap-4 p-4">
          <FiltrosSorteo pendientes={pendientes} filtros={filtros} onCambio={setFiltros} />
          <p className="text-sm text-tinta-suave">
            {posibles.length === 0 ? 'No queda ninguna con esos filtros.' : `${posibles.length} candidatas`}
          </p>
          <Boton
            disabled={ocupado || posibles.length === 0}
            onClick={() => enviar(() => accionProponerCandidata(noche.id, { como: 'azar', filtros }))}
            className="h-11 px-6"
          >
            Que elija el dado
          </Boton>
        </div>
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {elegibles.map((p, i) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 12) * 0.03 }}
            >
              <button
                type="button"
                disabled={ocupado}
                onClick={() => enviar(() => accionProponerCandidata(noche.id, { como: 'elijo', entradaId: p.id }))}
                className="foco tocable group flex w-full flex-col gap-1 text-left disabled:opacity-60"
                aria-label={`Proponer ${p.titulo}`}
              >
                <span className="block w-full overflow-hidden rounded-tema shadow-baja ring-acento transition-shadow group-hover:ring-[3px]">
                  <Poster path={p.posterPath} titulo={p.titulo} anio={p.anio} tamano="grilla" />
                </span>
                <span className="line-clamp-2 text-xs leading-tight text-tinta">{p.titulo}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}

function IconoJuego({ juego }: { juego: Juego }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-acento-suave text-acento">
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {juego === 'ppt' && (
          <>
            <path d="M7 11V7.5a1.5 1.5 0 0 1 3 0V11M10 10V5.5a1.5 1.5 0 0 1 3 0V11M13 10.5V6.5a1.5 1.5 0 0 1 3 0V12" />
            <path d="M16 12v1.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5v-1.8a1.5 1.5 0 0 1 3 0" />
          </>
        )}
        {juego === 'memoria' && (
          <>
            <rect x="3.5" y="5" width="7" height="10" rx="1.5" />
            <rect x="13.5" y="9" width="7" height="10" rx="1.5" />
            <path d="M7 8.5v3M5.5 10h3" />
          </>
        )}
        {juego === 'ahorcado' && (
          <>
            <path d="M5 20V4h9M14 4v3" />
            <circle cx="14" cy="9.5" r="2.2" />
            <path d="M14 11.7v4.3M14 13l-2.5 2M14 13l2.5 2M14 16l-2 3M14 16l2 3" />
          </>
        )}
        {juego === 'wordle' && (
          <>
            <rect x="3" y="3" width="5" height="5" rx="1" />
            <rect x="9.5" y="3" width="5" height="5" rx="1" />
            <rect x="16" y="3" width="5" height="5" rx="1" />
            <rect x="3" y="9.5" width="5" height="5" rx="1" fill="currentColor" />
            <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
            <rect x="16" y="9.5" width="5" height="5" rx="1" />
            <rect x="3" y="16" width="5" height="5" rx="1" />
            <rect x="9.5" y="16" width="5" height="5" rx="1" fill="currentColor" />
            <rect x="16" y="16" width="5" height="5" rx="1" />
          </>
        )}
        {juego === 'moneda' && (
          <>
            <circle cx="12" cy="12" r="8.5" />
            <circle cx="12" cy="12" r="5" />
            <path d="M12 9.5v5" />
          </>
        )}
      </svg>
    </span>
  );
}
