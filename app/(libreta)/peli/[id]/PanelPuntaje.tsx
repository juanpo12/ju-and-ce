'use client';

import { useState, useTransition } from 'react';
import { EstrellasEditables } from '@/components/EstrellasEditables';
import { Estrellas, formatear } from '@/components/Estrellas';
import { Boton } from '@/components/Boton';
import { accionBorrarPuntaje, accionPuntuar } from '@/app/acciones';

type Puntaje = { estrellas: number; comentario: string | null } | null;

/**
 * Cada persona tiene su propio puntaje y su propio comentario. Acá se edita el
 * propio y se lee el del otro — editar el ajeno no está ni en la pantalla ni
 * permitido por la RLS.
 *
 * La estrella se guarda ni bien la tocás, y se pinta antes de que el servidor
 * conteste: esperar medio segundo para ver el cambio se siente roto.
 */
export function PanelPuntaje({
  entradaId,
  miNombre,
  suNombre,
  mio,
  suyo,
}: {
  entradaId: string;
  miNombre: string;
  suNombre: string | null;
  mio: Puntaje;
  suyo: Puntaje;
}) {
  const [estrellas, setEstrellas] = useState<number | null>(mio?.estrellas ?? null);
  const [comentario, setComentario] = useState(mio?.comentario ?? '');
  const [guardando, empezar] = useTransition();
  const [guardado, setGuardado] = useState(false);

  function puntuar(valor: number) {
    setEstrellas(valor);
    setGuardado(false);
    empezar(async () => {
      await accionPuntuar(entradaId, valor, comentario || null);
      avisarGuardado();
    });
  }

  function guardarComentario() {
    if (!estrellas) return;
    empezar(async () => {
      await accionPuntuar(entradaId, estrellas, comentario || null);
      avisarGuardado();
    });
  }

  function avisarGuardado() {
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  function borrar() {
    setEstrellas(null);
    setComentario('');
    empezar(() => accionBorrarPuntaje(entradaId));
  }

  const cambio = (mio?.comentario ?? '') !== comentario;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-titulo text-2xl text-tinta">Qué nos pareció</h2>

      <div className="tarjeta flex flex-col gap-3 px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-durazno" aria-hidden />
          <span className="text-sm font-semibold text-tinta">{miNombre}</span>
          <span className="ml-auto text-xs text-tinta-suave" aria-live="polite">
            {guardando ? 'Guardando…' : guardado ? 'Guardado' : ''}
          </span>
        </div>

        <EstrellasEditables valor={estrellas} onCambio={puntuar} etiqueta={`Puntaje de ${miNombre}`} />

        <label className="flex flex-col gap-1.5">
          <span className="sr-only">Tu comentario</span>
          <textarea
            rows={3}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            onBlur={() => cambio && guardarComentario()}
            placeholder="Qué te pareció…"
            className="foco resize-y rounded-tema border border-borde bg-fondo px-3 py-2 text-sm leading-relaxed text-tinta outline-none placeholder:text-tinta-suave/60"
          />
        </label>

        {estrellas !== null && (
          <div className="flex gap-2">
            {cambio && (
              <Boton type="button" onClick={guardarComentario} disabled={guardando}>
                Guardar comentario
              </Boton>
            )}
            <Boton type="button" variante="fantasma" onClick={borrar} disabled={guardando}>
              Borrar mi puntaje
            </Boton>
          </div>
        )}
      </div>

      {suNombre && (
        <div className="tarjeta flex flex-col gap-2.5 px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-menta" aria-hidden />
            <span className="text-sm font-semibold text-tinta">{suNombre}</span>
          </div>

          {suyo ? (
            <>
              <div className="flex items-center gap-2">
                <Estrellas valor={suyo.estrellas} medida="grande" />
                <span className="font-titulo text-xl text-tinta">
                  {formatear(suyo.estrellas)}
                </span>
              </div>
              {suyo.comentario && (
                <p className="text-sm leading-relaxed text-tinta-suave">«{suyo.comentario}»</p>
              )}
            </>
          ) : (
            <p className="text-sm italic text-tinta-suave">Todavía no la puntuó.</p>
          )}
        </div>
      )}
    </section>
  );
}
