'use client';

import { useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { accionJugar } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import type { PartidaWordle, PistaWordle } from '@/lib/noche';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { CabeceraJuego } from './CabeceraJuego';
import { Teclado, type EstadoTecla } from '../Teclado';
import type { Mesa } from '../tipos';

const LARGO = 5;

const COLOR: Record<PistaWordle, string> = {
  bien: 'bg-acento text-sobre-acento border-acento',
  casi: 'bg-acento-suave text-tinta border-acento',
  no: 'bg-borde/60 text-tinta-suave border-borde',
};

/**
 * La misma palabra para los dos, cada uno por su lado. Se ven las letras
 * propias; del otro, solo los colores: cuántas va acertando sin regalarle nada.
 */
export function Wordle({
  mesa,
  partida,
  pendientes,
}: {
  mesa: Mesa;
  partida: PartidaWordle;
  pendientes: Pendiente[];
}) {
  const { noche, yo, otro, enviar, ocupado } = mesa;
  const mios = partida.intentos[yo.id] ?? [];
  const suyos = partida.intentos[otro.id] ?? [];
  const termine = Boolean(partida.resultado[yo.id]);
  const [actual, setActual] = useState('');
  const [temblando, setTemblando] = useState(0);

  const letra = useCallback(
    (l: string) => setActual((a) => (a.length < LARGO ? a + l.toLowerCase() : a)),
    [],
  );
  const borrar = useCallback(() => setActual((a) => a.slice(0, -1)), []);
  const enviarIntento = useCallback(() => {
    if (actual.length !== LARGO || ocupado || termine) {
      if (actual.length !== LARGO) setTemblando((t) => t + 1);
      return;
    }
    const intento = actual;
    void enviar(() => accionJugar(noche.id, { juego: 'wordle', intento })).then(() => {
      // Si el servidor la rechazó, el intento no aparece en la lista: queda escrito para corregir.
      setActual((a) => (a === intento ? '' : a));
    });
  }, [actual, ocupado, termine, enviar, noche.id]);

  // Lo que ya se sabe de cada letra, para pintar el teclado: lo mejor que salió.
  const estadoDe = (l: string): EstadoTecla | undefined => {
    const c = l.toLowerCase();
    let mejor: PistaWordle | undefined;
    for (const i of mios) {
      [...i.letras].forEach((x, k) => {
        if (x !== c) return;
        const p = i.pistas[k]!;
        if (p === 'bien' || (p === 'casi' && mejor !== 'bien') || !mejor) mejor = p;
      });
    }
    return mejor;
  };

  const filasMias = Array.from({ length: partida.maximo }, (_, i) => mios[i] ?? null);

  return (
    <section>
      <CabeceraJuego
        mesa={mesa}
        pendientes={pendientes}
        nombre="La palabra"
        detalle={`Cinco letras, ${partida.maximo} intentos. Menos intentos gana.`}
      />

      <div className="mb-4 flex items-start justify-center gap-5">
        {/* La grilla propia, con letras. */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="flex items-center gap-1 text-xs text-tinta-suave">
            <Avatar persona={yo} medida="chico" /> vos
          </span>
          <div className="flex flex-col gap-1">
            {filasMias.map((fila, i) => {
              const escribiendo = !fila && i === mios.length && !termine;
              return (
                <motion.div
                  key={i}
                  className="flex gap-1"
                  animate={escribiendo && temblando ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {Array.from({ length: LARGO }, (_, k) => {
                    const l = fila ? fila.letras[k] : escribiendo ? actual[k] : undefined;
                    const pista = fila?.pistas[k];
                    return (
                      <motion.span
                        key={k}
                        initial={false}
                        animate={pista ? { rotateX: [90, 0] } : { rotateX: 0 }}
                        transition={{ delay: k * 0.08, duration: 0.3 }}
                        className={cn(
                          'flex size-10 items-center justify-center rounded-[calc(var(--radio)-6px)] border-2 font-cartel text-2xl uppercase leading-none sm:size-11',
                          pista ? COLOR[pista] : l ? 'border-tinta-suave/60 text-tinta' : 'border-borde text-tinta',
                        )}
                      >
                        {l ?? ''}
                      </motion.span>
                    );
                  })}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* La del otro, solo colores. */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="flex items-center gap-1 text-xs text-tinta-suave">
            <Avatar persona={otro} medida="chico" /> {otro.nombre}
          </span>
          <div className="flex flex-col gap-1" aria-label={`${otro.nombre}: ${suyos.length} intentos`}>
            {Array.from({ length: partida.maximo }, (_, i) => (
              <div key={i} className="flex gap-1">
                {Array.from({ length: LARGO }, (_, k) => {
                  const pista = suyos[i]?.pistas[k];
                  return (
                    <span
                      key={k}
                      className={cn('size-4 rounded-[3px] border sm:size-5', pista ? COLOR[pista] : 'border-borde')}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          {partida.resultado[otro.id] && (
            <p className="text-xs text-tinta-suave">
              {partida.resultado[otro.id] === 'acerto' ? `La sacó en ${suyos.length}` : 'No la sacó'}
            </p>
          )}
        </div>
      </div>

      {termine ? (
        <p className="mb-4 text-center text-sm text-tinta-suave" aria-live="polite">
          {partida.resultado[yo.id] === 'acerto' ? `La sacaste en ${mios.length}. ` : 'Se te acabaron los intentos. '}
          Esperando a {otro.nombre}…
        </p>
      ) : (
        <p className="mb-3 text-center text-xs text-tinta-suave">Escribí una palabra de cinco letras y tocá «Listo».</p>
      )}

      <Teclado
        onLetra={letra}
        onBorrar={borrar}
        onEnter={enviarIntento}
        estadoDe={estadoDe}
        deshabilitado={termine || ocupado}
      />
    </section>
  );
}
