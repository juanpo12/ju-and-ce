'use client';

import { useState, useTransition } from 'react';
import { EstrellasEditables } from '@/components/EstrellasEditables';
import { Estrellas, formatear } from '@/components/Estrellas';
import { Boton } from '@/components/Boton';
import { Avatar } from '@/components/Avatar';
import { varColor, type Persona } from '@/lib/personas';
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
  yo,
  otro,
  mio,
  suyo,
}: {
  entradaId: string;
  yo: Persona;
  otro: Persona | null;
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
    <section className="flex flex-col gap-3">
      <h2 className="font-titulo text-3xl text-tinta">Qué nos pareció</h2>

      {/* Lado a lado desde sm: los dos puntajes se comparan de un vistazo. Cada
          uno con su color arriba, el mismo que en la grilla y en pendientes. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Cuaderno
          persona={yo}
          extra={
            <span className="ml-auto text-xs text-tinta-suave" aria-live="polite">
              {guardando ? 'Guardando…' : guardado ? 'Guardado ✓' : 'vos'}
            </span>
          }
        >
          <EstrellasEditables
            valor={estrellas}
            onCambio={puntuar}
            etiqueta={`Puntaje de ${yo.nombre}`}
          />

          <label className="flex flex-col gap-1.5">
            <span className="sr-only">Tu comentario</span>
            <textarea
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              onBlur={() => cambio && guardarComentario()}
              placeholder="Qué te pareció…"
              className="foco resize-y rounded-tema border border-borde bg-fondo/60 px-3 py-2 font-cita text-[0.95rem] leading-relaxed text-tinta outline-none transition-colors placeholder:font-texto placeholder:text-tinta-suave/70 focus:border-acento"
            />
          </label>

          {estrellas !== null && (
            <div className="flex flex-wrap gap-2">
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
        </Cuaderno>

        {otro && (
          <Cuaderno persona={otro}>
            {suyo ? (
              <>
                <div className="flex items-center gap-2">
                  <Estrellas valor={suyo.estrellas} medida="grande" />
                  <span className="font-cartel text-3xl leading-none tracking-wide text-tinta">
                    {formatear(suyo.estrellas)}
                  </span>
                </div>
                {suyo.comentario ? (
                  <blockquote
                    className="border-l-2 pl-3 font-cita text-[0.95rem] leading-relaxed text-tinta"
                    style={{ borderColor: varColor(otro.color) }}
                  >
                    {suyo.comentario}
                  </blockquote>
                ) : (
                  <p className="text-sm text-tinta-suave">Puntuó sin comentario.</p>
                )}
              </>
            ) : (
              <div className="flex flex-1 flex-col items-start justify-center gap-1 py-2">
                <Estrellas valor={null} medida="grande" />
                <p className="text-sm italic text-tinta-suave">Todavía no la puntuó.</p>
              </div>
            )}
          </Cuaderno>
        )}
      </div>
    </section>
  );
}

/** La hoja de cada uno: su color como un filete arriba, su inicial y su nombre. */
function Cuaderno({
  persona,
  extra,
  children,
}: {
  persona: Persona;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      data-hoja={persona.id}
      className="tarjeta flex flex-col gap-3 border-t-4 px-4 pb-4 pt-3"
      style={{ borderTopColor: varColor(persona.color) }}
    >
      <div className="flex items-center gap-2">
        <Avatar persona={persona} />
        <span className="text-sm font-semibold text-tinta">{persona.nombre}</span>
        {extra}
      </div>
      {children}
    </div>
  );
}
