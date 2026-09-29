import Link from 'next/link';
import { Poster } from './Poster';
import { Estrellas, formatear } from './Estrellas';
import type { EntradaConPuntajes } from '@/db/queries';

/**
 * La tarjeta de la grilla: póster, título, y el puntaje de cada uno.
 * El promedio se muestra solo cuando puntuaron los dos — si no, sería el puntaje
 * de uno haciéndose pasar por el de la pareja.
 */
export function TarjetaPeli({
  entrada,
  miNombre,
  suNombre,
  prioridad = false,
}: {
  entrada: EntradaConPuntajes;
  miNombre: string;
  suNombre: string | null;
  prioridad?: boolean;
}) {
  const coinciden = entrada.cuantosPuntuaron === 2 && entrada.promedio !== null;

  return (
    <Link
      href={`/peli/${entrada.id}`}
      className="foco tarjeta group flex flex-col overflow-hidden transition-transform hover:-translate-y-0.5"
    >
      <div className="relative overflow-hidden">
        <Poster path={entrada.posterPath} titulo={entrada.titulo} prioridad={prioridad} />
        {coinciden && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-superficie/95 px-2 py-0.5 text-xs font-semibold text-acento shadow-sm">
            ★ {formatear(entrada.promedio!)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <h3 className="font-titulo text-lg leading-tight text-tinta">{entrada.titulo}</h3>
        {entrada.anio && <p className="-mt-1 text-xs text-tinta-suave">{entrada.anio}</p>}

        <div className="mt-auto flex flex-col gap-1 pt-1">
          <Puntaje quien={miNombre} color="var(--durazno)" valor={entrada.mio?.estrellas ?? null} />
          {suNombre && (
            <Puntaje quien={suNombre} color="var(--menta)" valor={entrada.suyo?.estrellas ?? null} />
          )}
        </div>
      </div>
    </Link>
  );
}

function Puntaje({
  quien,
  color,
  valor,
}: {
  quien: string;
  color: string;
  valor: number | null;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span className="w-12 shrink-0 truncate text-xs text-tinta-suave">{quien}</span>
      {valor === null ? (
        <span className="text-xs text-tinta-suave/60">todavía no</span>
      ) : (
        <Estrellas valor={valor} medida="chico" />
      )}
    </div>
  );
}
