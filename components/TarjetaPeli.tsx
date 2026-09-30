import { ViewTransition } from 'react';
import Link from 'next/link';
import { Poster } from './Poster';
import { Avatar } from './Avatar';
import { formatear } from './Estrellas';
import type { EntradaConPuntajes } from '@/db/queries';
import type { Persona } from '@/lib/personas';

/**
 * Un póster de la colección. El promedio va sobre el póster solo cuando
 * puntuaron los dos — si no, sería el puntaje de uno haciéndose pasar por el de
 * la pareja — y en su lugar aparece de quién falta.
 *
 * El póster lleva un `ViewTransition` con el mismo nombre que el de la ficha:
 * al tocarlo, crece hasta su lugar allá en vez de desaparecer.
 */
export function TarjetaPeli({
  entrada,
  yo,
  otro,
  prioridad = false,
}: {
  entrada: EntradaConPuntajes;
  yo: Persona;
  otro: Persona | null;
  prioridad?: boolean;
}) {
  const coinciden = entrada.cuantosPuntuaron === 2 && entrada.promedio !== null;
  const faltan = [!entrada.mio && yo, otro && !entrada.suyo && otro].filter(Boolean) as Persona[];

  return (
    <Link
      href={`/peli/${entrada.id}`}
      // Prefetch completo: el morph del póster solo se da si la ficha ya está
      // lista en el momento de navegar. Con dos personas y una grilla, las
      // lecturas extra no pesan.
      prefetch
      className="foco tocable group flex flex-col gap-2 rounded-tema"
      aria-label={`${entrada.titulo}${entrada.anio ? `, ${entrada.anio}` : ''}${
        coinciden ? `, promedio ${formatear(entrada.promedio!)}` : ''
      }`}
    >
      <ViewTransition name={`poster-${entrada.id}`} share="morph" default="none">
        <div className="relative overflow-hidden rounded-tema shadow-alta ring-1 ring-tinta/5 transition-transform duration-200 ease-salida group-hover:-translate-y-1 group-hover:rotate-[-0.6deg]">
          <Poster
            path={entrada.posterPath}
            titulo={entrada.titulo}
            anio={entrada.anio}
            prioridad={prioridad}
          />


          {coinciden && (
            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-superficie-alta/95 py-0.5 pl-1.5 pr-2 font-cartel text-base leading-none tracking-wide text-tinta shadow-baja">
              <span className="text-acento" aria-hidden>
                ★
              </span>
              {formatear(entrada.promedio!)}
            </span>
          )}

          {faltan.length > 0 && (
            <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-superficie-alta/95 py-0.5 pl-0.5 pr-2 text-[0.7rem] font-semibold text-tinta shadow-baja">
              <span className="flex -space-x-1">
                {faltan.map((p) => (
                  <Avatar
                    key={p.id}
                    persona={p}
                    medida="chico"
                    vacio
                    className="bg-superficie-alta"
                  />
                ))}
              </span>
              {faltan.length === 2
                ? 'Sin puntuar'
                : faltan[0] === yo
                  ? 'Te falta'
                  : `Falta ${faltan[0]!.nombre}`}
            </span>
          )}
        </div>
      </ViewTransition>

      <div className="flex flex-col gap-1 px-0.5">
        <h3 className="line-clamp-2 font-titulo text-xl leading-[1.05] text-tinta">
          {entrada.titulo}
        </h3>
        <div className="flex items-center gap-2 text-xs text-tinta-suave">
          {entrada.anio && <span>{entrada.anio}</span>}
          <span className="ml-auto flex items-center gap-2">
            <Nota persona={yo} valor={entrada.mio?.estrellas ?? null} />
            {otro && <Nota persona={otro} valor={entrada.suyo?.estrellas ?? null} />}
          </span>
        </div>
      </div>
    </Link>
  );
}

/** El puntaje de cada uno, discreto: la inicial y el número. */
function Nota({ persona, valor }: { persona: Persona; valor: number | null }) {
  if (valor === null) return null;
  return (
    <span className="flex items-center gap-1 tabular-nums">
      <Avatar persona={persona} medida="chico" />
      <span className="font-semibold text-tinta">{formatear(valor)}</span>
    </span>
  );
}
