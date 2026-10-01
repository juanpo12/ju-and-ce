'use client';

import { useEffect, useState } from 'react';
import { cancelNightAction, surrenderAction } from '@/app/acciones';
import { Boton } from '@/components/Boton';
import type { Pendiente } from '@/db/queries';
import { Candidates } from '../Candidates';
import type { Table } from '../types';

/**
 * Above every game: what is at stake, the game's name, the way out, and the
 * white flag. Surrendering asks once more with a second tap, so a slip of the
 * thumb does not hand the night over.
 */
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
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const id = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(id);
  }, [confirming]);

  function surrender() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    void table.send(() => surrenderAction(table.night.id));
  }

  return (
    <div className="mb-4 flex flex-col gap-3">
      <Candidates table={table} pending={pending} small />
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-titulo text-3xl leading-none text-tinta">{name}</p>
          {detail && <p className="mt-1 text-sm text-tinta-suave">{detail}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Boton
            variante={confirming ? 'primario' : 'fantasma'}
            className="h-8 px-2.5 text-xs"
            disabled={table.busy}
            onClick={surrender}
            aria-label={confirming ? 'Confirmar que te rendís' : 'Rendirse'}
          >
            <Flag />
            {confirming ? '¿Seguro? Me rindo' : 'Me rindo'}
          </Boton>
          <Boton
            variante="fantasma"
            className="h-8 px-2 text-xs"
            disabled={table.busy}
            onClick={() => table.send(() => cancelNightAction(table.night.id))}
          >
            Cerrar
          </Boton>
        </div>
      </div>
    </div>
  );
}

function Flag() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
    </svg>
  );
}
