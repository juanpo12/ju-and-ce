'use client';

import { Poster } from '@/components/Poster';
import { Avatar } from '@/components/Avatar';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import type { Table } from './types';

/**
 * The two candidates, each framed in the color of whoever proposed it.
 * With `small`, it is the top row of a game: so nobody forgets what is at stake.
 */
export function Candidates({
  table,
  pending,
  small = false,
  winner,
}: {
  table: Table;
  pending: Pendiente[];
  small?: boolean;
  /** When finished: the winner stays and the other fades. */
  winner?: string | null;
}) {
  const candidates = table.night.state.candidates ?? {};
  const order = [table.me, table.other];

  return (
    <div className={cn('flex items-center justify-center', small ? 'gap-3' : 'gap-4 sm:gap-6')}>
      {order.map((person, i) => {
        const c = candidates[person.id];
        const movie = c && pending.find((p) => p.id === c.entryId);
        const lost = winner !== undefined && winner !== null && winner !== person.id;
        return (
          <div key={person.id} className="contents">
            {i === 1 && (
              <span aria-hidden className={cn('font-cartel text-tinta-suave', small ? 'text-lg' : 'text-3xl')}>
                vs
              </span>
            )}
            <figure
              className={cn('flex flex-col items-center gap-1.5 transition-opacity', small ? 'w-16' : 'w-32 sm:w-40', lost && 'opacity-45')}
              aria-label={`${person.nombre}: ${movie ? movie.titulo : c ? 'una que ya no está' : 'todavía no eligió'}`}
            >
              <div
                className="w-full overflow-hidden rounded-tema shadow-alta ring-[3px]"
                style={{ '--tw-ring-color': varColor(person.color) } as React.CSSProperties}
              >
                {movie ? (
                  <Poster path={movie.posterPath} titulo={movie.titulo} anio={movie.anio} tamano={small ? 'chico' : 'grilla'} />
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center justify-center bg-acento-suave text-tinta-suave">
                    <Avatar persona={person} vacio medida={small ? 'base' : 'grande'} />
                  </div>
                )}
              </div>
              {!small && (
                <figcaption className="flex w-full flex-col items-center gap-0.5 text-center">
                  <span className="flex items-center gap-1 text-xs text-tinta-suave">
                    <Avatar persona={person} medida="chico" />
                    {person.id === table.me.id ? 'vos' : person.nombre}
                    {c?.how === 'random' && ' · al azar'}
                  </span>
                  <span className="line-clamp-2 font-titulo text-xl leading-tight text-tinta">
                    {movie ? movie.titulo : c ? 'Una que ya no está' : '…'}
                  </span>
                </figcaption>
              )}
            </figure>
          </div>
        );
      })}
    </div>
  );
}
