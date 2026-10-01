'use client';

import { useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { accionJugar } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import { DialogoAdaptable } from '@/components/DialogoAdaptable';
import type { PartidaAhorcado } from '@/lib/noche';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { CabeceraJuego } from './CabeceraJuego';
import { Teclado, type EstadoTecla } from '../Teclado';
import { personaDe, type Mesa } from '../tipos';

/**
 * Un título de la biblioteca, los dos adivinando el mismo por turnos. La
 * máscara viene del servidor; acá solo se dibuja la horca según los errores y
 * se manda la letra (o el arriesgo) cuando toca.
 */
export function Ahorcado({
  mesa,
  partida,
  pendientes,
}: {
  mesa: Mesa;
  partida: PartidaAhorcado;
  pendientes: Pendiente[];
}) {
  const { noche, yo, otro, enviar, ocupado } = mesa;
  const meToca = partida.turno === yo.id;
  const [arriesgando, setArriesgando] = useState(false);
  const [texto, setTexto] = useState('');

  const letra = useCallback(
    (l: string) => {
      if (!meToca || ocupado) return;
      void enviar(() => accionJugar(noche.id, { juego: 'ahorcado', letra: l }));
    },
    [meToca, ocupado, enviar, noche.id],
  );

  function arriesgar() {
    if (!texto.trim()) return;
    setArriesgando(false);
    void enviar(() => accionJugar(noche.id, { juego: 'ahorcado', arriesgo: texto }));
  }

  const estadoDe = (l: string): EstadoTecla | undefined => {
    const usada = partida.letras.find((x) => x.letra === l);
    return usada ? (usada.acierto ? 'acierto' : 'error') : undefined;
  };

  const palabras = partida.mascara.split(' ');
  const quienToca = personaDe(mesa, partida.turno);

  return (
    <section>
      <CabeceraJuego
        mesa={mesa}
        pendientes={pendientes}
        nombre="Ahorcado"
        detalle={partida.pista ? `Pista: ${partida.pista}` : 'Una peli que ya vieron'}
      />

      <div className="tarjeta mb-4 flex items-center gap-4 p-4">
        <Horca errores={partida.errores} maximo={partida.maximo} />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-tinta-suave">
            {partida.errores} de {partida.maximo} errores
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2" aria-label={`Título: ${partida.mascara}`}>
            {palabras.map((palabra, pi) => (
              <span key={pi} className="flex gap-1">
                {[...palabra].map((c, ci) => (
                  <motion.span
                    key={`${pi}-${ci}`}
                    initial={false}
                    animate={{ scale: c === '_' ? 1 : [1.25, 1] }}
                    className={cn(
                      'flex h-8 min-w-5 items-end justify-center border-b-2 font-cartel text-2xl leading-none text-tinta',
                      c === '_' ? 'border-tinta-suave/60' : /[A-ZÑ]/.test(c) ? 'border-acento' : 'border-transparent',
                    )}
                  >
                    {c === '_' ? '' : c}
                  </motion.span>
                ))}
              </span>
            ))}
          </div>
          {partida.letras.some((l) => !l.acierto) && (
            <p className="mt-3 text-xs text-tinta-suave">
              No está: {partida.letras.filter((l) => !l.acierto).map((l) => l.letra).join(' ')}
            </p>
          )}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={quienToca ? { backgroundColor: varColor(quienToca.color), color: 'var(--sobre-persona)' } : undefined}
          aria-live="polite"
        >
          {meToca ? 'Te toca una letra' : `Le toca a ${otro.nombre}`}
        </p>
        <Boton variante="secundario" className="h-9 px-3 text-xs" disabled={!meToca || ocupado} onClick={() => setArriesgando(true)}>
          Arriesgar el título
        </Boton>
      </div>

      <Teclado onLetra={letra} estadoDe={estadoDe} deshabilitado={!meToca || ocupado} />

      {partida.letras.length > 0 && (
        <ol className="mt-4 flex flex-wrap justify-center gap-1" aria-label="Letras que salieron">
          {partida.letras.map((l, i) => {
            const quien = personaDe(mesa, l.por);
            return (
              <li
                key={i}
                className={cn(
                  'flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-cartel text-sm',
                  l.acierto ? 'border-acento text-tinta' : 'border-borde text-tinta-suave line-through',
                )}
              >
                {quien && <Avatar persona={quien} medida="chico" />}
                {l.letra}
              </li>
            );
          })}
        </ol>
      )}

      <DialogoAdaptable
        abierto={arriesgando}
        onCambio={setArriesgando}
        titulo="Arriesgar el título"
        descripcion="Si acertás, ganás. Si no, gana el otro."
      >
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            arriesgar();
          }}
        >
          <input
            autoFocus
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="El título completo"
            className="foco rounded-tema border border-borde bg-fondo px-3 py-2.5 text-base text-tinta outline-none"
          />
          <div className="flex justify-end gap-2">
            <Boton type="button" variante="fantasma" onClick={() => setArriesgando(false)}>
              Mejor no
            </Boton>
            <Boton type="submit" disabled={!texto.trim()}>
              Arriesgo
            </Boton>
          </div>
        </form>
      </DialogoAdaptable>
    </section>
  );
}

/** La horca se dibuja de a partes: una por error. Trazos de tinta, como todo. */
function Horca({ errores, maximo }: { errores: number; maximo: number }) {
  const partes = [
    <path key="cabeza" d="M30 22a4 4 0 1 0 0.01 0" />,
    <path key="cuerpo" d="M30 30v14" />,
    <path key="bi" d="M30 33l-6 6" />,
    <path key="bd" d="M30 33l6 6" />,
    <path key="pi" d="M30 44l-5 8" />,
    <path key="pd" d="M30 44l5 8" />,
  ];
  const visibles = Math.round((errores / maximo) * partes.length);
  return (
    <svg
      viewBox="0 0 48 60"
      className="h-24 w-20 shrink-0 text-tinta"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 56h24M10 56V6h20v8" className="text-tinta-suave" />
      {partes.slice(0, visibles).map((p, i) => (
        <motion.g key={i} initial={{ opacity: 0, pathLength: 0 }} animate={{ opacity: 1, pathLength: 1 }} transition={{ duration: 0.35 }}>
          {p}
        </motion.g>
      ))}
    </svg>
  );
}
