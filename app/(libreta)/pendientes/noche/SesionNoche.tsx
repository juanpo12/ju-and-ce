'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { esDemo } from '@/lib/demo';
import { accionLeerNoche, accionUnirseANoche } from '@/app/acciones';
import type { EstadoNoche, Fase, Juego, Modo, NochePublica } from '@/lib/noche';
import type { Persona } from '@/lib/personas';
import type { Pendiente } from '@/db/queries';
import type { Enviar, Mesa } from './tipos';
import { Sala } from './Sala';
import { Resultado } from './Resultado';
import { PiedraPapelTijera } from './juegos/PiedraPapelTijera';
import { Memoria } from './juegos/Memoria';
import { Ahorcado } from './juegos/Ahorcado';
import { Wordle } from './juegos/Wordle';

/**
 * La sesión de a dos, en vivo. La fila de `noches` vive acá en estado: cada
 * acción devuelve la fila nueva (así el que juega no espera al websocket) y
 * el canal de Realtime trae las del otro. Se adopta una fila solo si su
 * `version` es mayor: los eventos pueden llegar desordenados.
 *
 * No pasa por `EscuchaCambios` a propósito: un `router.refresh()` por jugada
 * sería re-renderizar la página entera en el servidor por cada carta.
 */
export function SesionNoche({
  inicial,
  yo,
  otro,
  espacioId,
  pendientes,
  disponibilidad,
}: {
  inicial: NochePublica;
  yo: Persona;
  otro: Persona;
  espacioId: string;
  pendientes: Pendiente[];
  disponibilidad: Record<Juego, string | null>;
}) {
  const [noche, setNoche] = useState(inicial);
  const [ocupado, empezar] = useTransition();
  const actual = useRef(noche);
  actual.current = noche;

  const adoptar = useCallback((nueva: NochePublica) => {
    setNoche((previa) =>
      nueva.id !== previa.id || nueva.version > previa.version ? nueva : previa,
    );
  }, []);

  // Si el servidor volvió a renderizar con una fila más nueva (un refresh),
  // también vale.
  const [ultimaInicial, setUltimaInicial] = useState(inicial);
  if (inicial !== ultimaInicial) {
    setUltimaInicial(inicial);
    adoptar(inicial);
  }

  const enviar: Enviar = useCallback(
    (accion) =>
      new Promise((listo) => {
        empezar(async () => {
          try {
            const r = await accion();
            if ('error' in r) toast(r.error);
            else adoptar(r.noche);
          } catch (e) {
            console.error('[noche]', e);
            toast('Algo falló. Probá de nuevo.');
          }
          listo();
        });
      }),
    [adoptar],
  );

  // Entrar: si la abrió el otro y todavía no estoy, me sumo al llegar.
  const meUni = useRef<string | null>(null);
  useEffect(() => {
    const presentes = noche.estado.presentes ?? [];
    if (noche.fase !== 'esperando' || presentes.includes(yo.id) || meUni.current === noche.id) return;
    meUni.current = noche.id;
    void enviar(() => accionUnirseANoche(noche.id));
  }, [noche.id, noche.fase, noche.estado.presentes, yo.id, enviar]);

  // Volver a leer la fila: al conectar el canal, y al volver del fondo (iOS
  // corta el websocket cuando la pantalla se apaga).
  const resincronizar = useCallback(async () => {
    const fresca = await accionLeerNoche(actual.current.id).catch(() => null);
    if (fresca) adoptar(fresca);
  }, [adoptar]);

  useEffect(() => {
    if (esDemo) return;
    const supabase = crearClienteNavegador();
    const canal = supabase
      .channel(`noche:${espacioId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'noches', filter: `espacio_id=eq.${espacioId}` },
        (p) => {
          const fila = desdeFila(p.new as Record<string, unknown>);
          if (fila) adoptar(fila);
          else void resincronizar();
        },
      )
      .subscribe((estado) => {
        if (estado === 'SUBSCRIBED') void resincronizar();
      });

    const alVolver = () => {
      if (document.visibilityState === 'visible') void resincronizar();
    };
    document.addEventListener('visibilitychange', alVolver);

    return () => {
      document.removeEventListener('visibilitychange', alVolver);
      supabase.removeChannel(canal);
    };
  }, [espacioId, adoptar, resincronizar]);

  const presentes = noche.estado.presentes ?? [];
  const segundo = presentes.find((p) => p !== noche.creadaPor) ?? (noche.creadaPor === yo.id ? otro.id : yo.id);
  const mesa: Mesa = { noche, yo, otro, jugadores: [noche.creadaPor, segundo], enviar, ocupado };

  switch (noche.fase) {
    case 'esperando':
    case 'candidatas':
    case 'juego':
      return <Sala mesa={mesa} pendientes={pendientes} disponibilidad={disponibilidad} />;
    case 'jugando': {
      const partida = noche.estado.partida;
      if (!partida) return null;
      switch (partida.juego) {
        case 'ppt':
          return <PiedraPapelTijera mesa={mesa} partida={partida} pendientes={pendientes} />;
        case 'memoria':
          return <Memoria mesa={mesa} partida={partida} pendientes={pendientes} />;
        case 'ahorcado':
          return <Ahorcado mesa={mesa} partida={partida} pendientes={pendientes} />;
        case 'wordle':
          return <Wordle mesa={mesa} partida={partida} pendientes={pendientes} />;
        default:
          return null;
      }
    }
    case 'terminada':
    case 'cancelada':
      return <Resultado mesa={mesa} pendientes={pendientes} />;
  }
}

/** La fila como la manda Realtime (snake_case, fechas como texto), sin el secreto. */
function desdeFila(f: Record<string, unknown>): NochePublica | null {
  if (typeof f.id !== 'string' || typeof f.version !== 'number' || typeof f.fase !== 'string') return null;
  const fecha = (v: unknown) => (typeof v === 'string' ? new Date(v) : null);
  return {
    id: f.id,
    espacioId: String(f.espacio_id),
    modo: f.modo as Modo,
    fase: f.fase as Fase,
    juego: (f.juego ?? null) as Juego | null,
    creadaPor: String(f.creada_por),
    ganadorId: (f.ganador_id ?? null) as string | null,
    entradaId: (f.entrada_id ?? null) as string | null,
    estado: (f.estado ?? {}) as EstadoNoche,
    version: f.version,
    creadaEn: fecha(f.creada_en) ?? new Date(),
    actualizadaEn: fecha(f.actualizada_en) ?? new Date(),
    terminadaEn: fecha(f.terminada_en),
  };
}
