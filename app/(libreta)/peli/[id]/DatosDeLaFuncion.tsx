'use client';

import { useState, useTransition } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { Boton } from '@/components/Boton';
import { DialogoAdaptable } from '@/components/DialogoAdaptable';
import { hoyISO } from '@/lib/fechas';
import { accionBorrarEntrada, accionEditarEntrada, accionMarcarVista } from '@/app/acciones';

/** La fecha, el lugar, y el paso de pendiente a vista. */
export function DatosDeLaFuncion({
  entradaId,
  estado,
  vistaEl,
  lugar,
  agregadaPor,
}: {
  entradaId: string;
  estado: 'vista' | 'pendiente';
  vistaEl: string | null;
  lugar: string | null;
  agregadaPor: string | null;
}) {
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [pendiente, empezar] = useTransition();

  if (estado === 'pendiente') {
    return (
      <section className="tarjeta flex flex-col gap-3 px-4 py-4">
        <div>
          <h2 className="font-titulo text-3xl text-tinta">Todavía pendiente</h2>
          {agregadaPor && (
            <p className="text-sm text-tinta-suave">La sumó {agregadaPor} a la lista.</p>
          )}
        </div>
        <form
          action={(fd) => empezar(() => accionMarcarVista(entradaId, fd))}
          className="flex flex-col gap-3"
        >
          <Campos vistaEl={hoyISO()} lugar="" />
          <Boton type="submit" disabled={pendiente} className="w-fit">
            {pendiente ? 'Guardando…' : 'Ya la vimos'}
          </Boton>
        </form>
      </section>
    );
  }

  return (
    <section className="tarjeta flex flex-col gap-3 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-titulo text-3xl text-tinta">La función</h2>
          <p className="flex items-center gap-2 text-sm text-tinta">
            <CalendarDays className="size-4 shrink-0 text-acento" aria-hidden />
            {vistaEl ? fecha(vistaEl) : 'Sin fecha'}
          </p>
          {lugar && (
            <p className="flex items-center gap-2 text-sm text-tinta">
              <MapPin className="size-4 shrink-0 text-acento" aria-hidden />
              {lugar}
            </p>
          )}
          {agregadaPor && <p className="text-xs text-tinta-suave">La sumó {agregadaPor}</p>}
        </div>
        {!editando && (
          <Boton type="button" variante="fantasma" onClick={() => setEditando(true)}>
            Editar
          </Boton>
        )}
      </div>

      {editando && (
        <form
          action={(fd) =>
            empezar(async () => {
              await accionEditarEntrada(entradaId, fd);
              setEditando(false);
            })
          }
          className="flex flex-col gap-3"
        >
          <Campos vistaEl={vistaEl ?? ''} lugar={lugar ?? ''} />
          <div className="flex gap-2">
            <Boton type="submit" disabled={pendiente}>
              Guardar
            </Boton>
            <Boton type="button" variante="fantasma" onClick={() => setEditando(false)}>
              Cancelar
            </Boton>
          </div>
        </form>
      )}

      <div className="mt-1 border-t border-borde pt-3">
        <Boton type="button" variante="fantasma" onClick={() => setConfirmando(true)}>
          Sacar de la libreta
        </Boton>
      </div>

      <DialogoAdaptable
        abierto={confirmando}
        onCambio={setConfirmando}
        titulo="¿Sacarla de la libreta?"
        descripcion="Se van también los dos puntajes y los comentarios. No se puede deshacer."
      >
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Boton type="button" variante="secundario" onClick={() => setConfirmando(false)}>
            No, dejarla
          </Boton>
          <Boton
            type="button"
            onClick={() => empezar(() => accionBorrarEntrada(entradaId))}
            disabled={pendiente}
            className="bg-destructive text-sobre-destructivo"
          >
            {pendiente ? 'Sacando…' : 'Sí, sacarla'}
          </Boton>
        </div>
      </DialogoAdaptable>
    </section>
  );
}

function Campos({ vistaEl, lugar }: { vistaEl: string; lugar: string }) {
  const input =
    'foco rounded-tema border border-borde bg-fondo/60 px-3 py-2 text-base text-tinta outline-none transition-colors focus:border-acento';
  return (
    <div className="flex flex-wrap gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-tinta-suave">Cuándo</span>
        <input type="date" name="vista_el" defaultValue={vistaEl} className={input} />
      </label>
      <label className="flex flex-1 flex-col gap-1">
        <span className="text-xs font-semibold text-tinta-suave">Dónde</span>
        <input
          type="text"
          name="lugar"
          defaultValue={lugar}
          placeholder="el sillón, el cine…"
          className={`${input} w-full`}
        />
      </label>
    </div>
  );
}

function fecha(iso: string) {
  // El string viene como 'YYYY-MM-DD'; parsearlo con `new Date()` lo leería como
  // UTC y en Argentina mostraría el día anterior.
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a!, m! - 1, d!).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
