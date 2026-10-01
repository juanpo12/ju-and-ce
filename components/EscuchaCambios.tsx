'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { esDemo } from '@/lib/demo';
import { formatear } from './Estrellas';
import { Avatar } from './Avatar';
import type { Persona } from '@/lib/personas';

/** Lo que importa de un evento de Realtime. Las columnas llegan en snake_case. */
type Cambio = {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
};

/**
 * Cuando Ceci puntúa desde su celular, esta pantalla se actualiza sola.
 *
 * Realtime es solo del lado del cliente: la suscripción va en un `useEffect` con
 * su cleanup — sin el cleanup quedan canales colgados y eventos duplicados — y
 * `router.refresh()` hace que los Server Components vuelvan a leer. No traemos
 * el dato por el websocket: avisa que algo cambió y el servidor manda la verdad.
 *
 * Del evento sí se lee quién y qué, para dos cosas que no son datos: resaltar la
 * tarjeta que cambió y avisar con un toast. Solo lo que hizo el otro — lo propio
 * ya lo viste pasar.
 */
export function EscuchaCambios({
  espacioId,
  yo,
  otro,
}: {
  espacioId: string;
  yo: Persona;
  otro: Persona | null;
}) {
  const router = useRouter();

  // En un ref y no en las dependencias: cada refresh trae objetos nuevos, y el
  // canal no se tiene que volver a suscribir por eso.
  const personas = useRef({ yo, otro });
  useEffect(() => {
    personas.current = { yo, otro };
  }, [yo, otro]);

  useEffect(() => {
    // Un refresh por ráfaga: al puntuar caen dos eventos casi juntos (el upsert
    // de `puntajes` y el update de `entradas`) y no hace falta releer dos veces.
    let pendiente: ReturnType<typeof setTimeout> | null = null;
    const refrescar = () => {
      if (pendiente) clearTimeout(pendiente);
      pendiente = setTimeout(() => router.refresh(), 250);
    };

    const avisar = (cambio: Cambio) => {
      refrescar();
      reaccionar(cambio, personas.current.yo, personas.current.otro);
    };

    // En demo no hay Supabase al otro lado: el websocket solo reintentaría. Queda
    // una puerta para probar la reacción a mano desde la consola.
    if (esDemo) {
      (window as unknown as { libretaSimular?: typeof avisar }).libretaSimular = avisar;
      return () => {
        if (pendiente) clearTimeout(pendiente);
      };
    }

    const supabase = crearClienteNavegador();

    const canal = supabase
      .channel(`libreta:${espacioId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'entradas', filter: `espacio_id=eq.${espacioId}` },
        (p) => avisar(p as unknown as Cambio),
      )
      // `puntajes` no tiene espacio_id, así que no se puede filtrar en el
      // servidor. La RLS igual no deja pasar los de otro espacio.
      .on('postgres_changes', { event: '*', schema: 'public', table: 'puntajes' }, (p) =>
        avisar(p as unknown as Cambio),
      )
      // Solo el alta de una noche de peli: el banner de Pendientes. Las jugadas
      // (updates) las sigue la pantalla de la sesión por su propio canal.
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'noches', filter: `espacio_id=eq.${espacioId}` },
        (p) => avisar(p as unknown as Cambio),
      )
      .subscribe();

    return () => {
      if (pendiente) clearTimeout(pendiente);
      supabase.removeChannel(canal);
    };
  }, [espacioId, router]);

  return null;
}

function reaccionar(cambio: Cambio, yo: Persona, otro: Persona | null) {
  if (!otro || cambio.eventType === 'DELETE') return;
  const fila = cambio.new;

  if (cambio.table === 'puntajes') {
    if (fila.perfil_id !== otro.id) return;
    const entradaId = String(fila.entrada_id);
    const estrellas = Number(fila.estrellas);
    cuandoAparezca(entradaId, (titulo) => {
      resaltar(entradaId, otro.id);
      avisarConToast(
        otro,
        `${otro.nombre} ${cambio.eventType === 'INSERT' ? 'puntuó' : 'cambió su puntaje de'} ${titulo ?? 'una película'}`,
        Number.isFinite(estrellas) ? `★ ${formatear(estrellas)}` : undefined,
      );
    });
    return;
  }

  if (cambio.table === 'noches') {
    if (cambio.eventType !== 'INSERT' || fila.creada_por !== otro.id || fila.modo !== 'duo') return;
    avisarConToast(otro, `${otro.nombre} quiere elegir la de esta noche`, 'Entrá desde Pendientes');
    return;
  }

  // Un update de `entradas` también llega cuando alguien puntúa, y no dice
  // quién lo hizo: solo el alta es inequívoca.
  if (cambio.table === 'entradas' && cambio.eventType === 'INSERT') {
    if (fila.agregada_por !== otro.id || fila.agregada_por === yo.id) return;
    const entradaId = String(fila.id);
    const pendiente = fila.estado === 'pendiente';
    cuandoAparezca(entradaId, (titulo) => {
      resaltar(entradaId, otro.id);
      avisarConToast(
        otro,
        pendiente
          ? `${otro.nombre} sumó ${titulo ?? 'una película'} a pendientes`
          : `${otro.nombre} agregó ${titulo ?? 'una película'}`,
      );
    });
  }
}

/**
 * La tarjeta de una entrada nueva recién existe cuando el refresh termina de
 * pintar. Se espera un poco a que aparezca y, si no está en esta pantalla, se
 * avisa igual sin título.
 */
function cuandoAparezca(entradaId: string, hacer: (titulo: string | null) => void) {
  const buscar = () =>
    document.querySelector<HTMLElement>(
      `[data-entrada="${CSS.escape(entradaId)}"], [data-ficha="${CSS.escape(entradaId)}"]`,
    );
  const hasta = performance.now() + 2000;
  const paso = () => {
    const el = buscar();
    if (el || performance.now() > hasta) hacer(el?.dataset.titulo ?? null);
    else requestAnimationFrame(paso);
  };
  // Primero que corra el refresh: la tarjeta vieja puede estar y la nueva no.
  setTimeout(paso, 400);
}

/** Un anillo del acento que se apaga. En la ficha, sobre la hoja de quien puntuó. */
function resaltar(entradaId: string, perfilId: string) {
  const id = CSS.escape(entradaId);
  const el = document.querySelector<HTMLElement>(
    `[data-entrada="${id}"], [data-ficha="${id}"] [data-hoja="${CSS.escape(perfilId)}"]`,
  );
  if (!el) return;
  el.classList.remove('animate-resaltar');
  void el.offsetWidth; // reinicia la animación si ya estaba corriendo
  el.classList.add('animate-resaltar');
  el.addEventListener('animationend', () => el.classList.remove('animate-resaltar'), {
    once: true,
  });
}

function avisarConToast(persona: Persona, titulo: string, detalle?: string) {
  toast(titulo, {
    description: detalle,
    icon: <Avatar persona={persona} />,
  });
}
