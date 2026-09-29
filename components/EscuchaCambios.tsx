'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { esDemo } from '@/lib/demo';

/**
 * Cuando Ceci puntúa desde su celular, esta pantalla se actualiza sola.
 *
 * Realtime es solo del lado del cliente: la suscripción va en un `useEffect` con
 * su cleanup — sin el cleanup quedan canales colgados y eventos duplicados — y
 * `router.refresh()` hace que los Server Components vuelvan a leer. No traemos
 * el dato por el websocket: avisa que algo cambió y el servidor manda la verdad.
 */
export function EscuchaCambios({ espacioId }: { espacioId: string }) {
  const router = useRouter();

  useEffect(() => {
    // En demo no hay Supabase al otro lado: el websocket solo reintentaría.
    if (esDemo) return;

    const supabase = crearClienteNavegador();

    // Un refresh por ráfaga: al puntuar caen dos eventos casi juntos (el upsert
    // de `puntajes` y el update de `entradas`) y no hace falta releer dos veces.
    let pendiente: ReturnType<typeof setTimeout> | null = null;
    const avisar = () => {
      if (pendiente) clearTimeout(pendiente);
      pendiente = setTimeout(() => router.refresh(), 250);
    };

    const canal = supabase
      .channel(`libreta:${espacioId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'entradas', filter: `espacio_id=eq.${espacioId}` },
        avisar,
      )
      // `puntajes` no tiene espacio_id, así que no se puede filtrar en el
      // servidor. La RLS igual no deja pasar los de otro espacio.
      .on('postgres_changes', { event: '*', schema: 'public', table: 'puntajes' }, avisar)
      .subscribe();

    return () => {
      if (pendiente) clearTimeout(pendiente);
      supabase.removeChannel(canal);
    };
  }, [espacioId, router]);

  return null;
}
