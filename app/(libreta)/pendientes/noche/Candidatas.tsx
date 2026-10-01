'use client';

import { Poster } from '@/components/Poster';
import { Avatar } from '@/components/Avatar';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import type { Mesa } from './tipos';

/**
 * Las dos candidatas, cada una enmarcada en el color de quien la propuso.
 * Con `chico`, es la fila de arriba de un juego: para no olvidarse qué se
 * está disputando.
 */
export function Candidatas({
  mesa,
  pendientes,
  chico = false,
  ganador,
}: {
  mesa: Mesa;
  pendientes: Pendiente[];
  chico?: boolean;
  /** Al terminar: la ganadora se queda y la otra se apaga. */
  ganador?: string | null;
}) {
  const candidatas = mesa.noche.estado.candidatas ?? {};
  const orden = [mesa.yo, mesa.otro];

  return (
    <div className={cn('flex items-center justify-center', chico ? 'gap-3' : 'gap-4 sm:gap-6')}>
      {orden.map((persona, i) => {
        const c = candidatas[persona.id];
        const peli = c && pendientes.find((p) => p.id === c.entradaId);
        const perdio = ganador !== undefined && ganador !== null && ganador !== persona.id;
        return (
          <div key={persona.id} className="contents">
            {i === 1 && (
              <span aria-hidden className={cn('font-cartel text-tinta-suave', chico ? 'text-lg' : 'text-3xl')}>
                vs
              </span>
            )}
            <figure
              className={cn('flex flex-col items-center gap-1.5 transition-opacity', chico ? 'w-16' : 'w-32 sm:w-40', perdio && 'opacity-45')}
              aria-label={`${persona.nombre}: ${peli ? peli.titulo : c ? 'una que ya no está' : 'todavía no eligió'}`}
            >
              <div
                className="w-full overflow-hidden rounded-tema shadow-alta ring-[3px]"
                style={{ '--tw-ring-color': varColor(persona.color) } as React.CSSProperties}
              >
                {peli ? (
                  <Poster path={peli.posterPath} titulo={peli.titulo} anio={peli.anio} tamano={chico ? 'chico' : 'grilla'} />
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center justify-center bg-acento-suave text-tinta-suave">
                    <Avatar persona={persona} vacio medida={chico ? 'base' : 'grande'} />
                  </div>
                )}
              </div>
              {!chico && (
                <figcaption className="flex w-full flex-col items-center gap-0.5 text-center">
                  <span className="flex items-center gap-1 text-xs text-tinta-suave">
                    <Avatar persona={persona} medida="chico" />
                    {persona.id === mesa.yo.id ? 'vos' : persona.nombre}
                    {c?.como === 'azar' && ' · al azar'}
                  </span>
                  <span className="line-clamp-2 font-titulo text-xl leading-tight text-tinta">
                    {peli ? peli.titulo : c ? 'Una que ya no está' : '…'}
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
