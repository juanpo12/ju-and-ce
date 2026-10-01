'use client';

import { cancelNightAction } from '@/app/acciones';
import { Boton } from '@/components/Boton';
import type { Pendiente } from '@/db/queries';
import { Candidates } from '../Candidates';
import type { Table } from '../types';

/** Above every game: what is at stake, the game's name, and the way out. */
export function GameHeader({
  table,
  pending,
  name,
  detail,
}: {
  table: Table;
  pending: Pendiente[];
  name: string;
  detail?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3">
      <Candidates table={table} pending={pending} small />
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-titulo text-3xl leading-none text-tinta">{name}</p>
          {detail && <p className="mt-1 text-sm text-tinta-suave">{detail}</p>}
        </div>
        <Boton
          variante="fantasma"
          className="shrink-0 px-2 text-xs"
          disabled={table.busy}
          onClick={() => table.send(() => cancelNightAction(table.night.id))}
        >
          Cerrar
        </Boton>
      </div>
    </div>
  );
}
