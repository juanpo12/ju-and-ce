'use client';

import { accionCancelarNoche } from '@/app/acciones';
import { Boton } from '@/components/Boton';
import type { Pendiente } from '@/db/queries';
import { Candidatas } from '../Candidatas';
import type { Mesa } from '../tipos';

/** Arriba de todo juego: qué se disputa, el nombre del juego, y la salida. */
export function CabeceraJuego({
  mesa,
  pendientes,
  nombre,
  detalle,
}: {
  mesa: Mesa;
  pendientes: Pendiente[];
  nombre: string;
  detalle?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3">
      <Candidatas mesa={mesa} pendientes={pendientes} chico />
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-titulo text-3xl leading-none text-tinta">{nombre}</p>
          {detalle && <p className="mt-1 text-sm text-tinta-suave">{detalle}</p>}
        </div>
        <Boton
          variante="fantasma"
          className="shrink-0 px-2 text-xs"
          disabled={mesa.ocupado}
          onClick={() => mesa.enviar(() => accionCancelarNoche(mesa.noche.id))}
        >
          Cerrar
        </Boton>
      </div>
    </div>
  );
}
