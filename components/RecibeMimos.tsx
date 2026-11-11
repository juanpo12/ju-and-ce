'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { esDemo } from '@/lib/demo';
import { accionTomarMimos } from '@/app/acciones';
import { Avatar } from './Avatar';
import type { Persona } from '@/lib/personas';

/**
 * El «Yo también te amo» que manda Ceci desde su mensaje. Si la app está
 * abierta llega en vivo; si no, aparece al entrar. En los dos casos se marca
 * como visto en el servidor, así no se repite.
 */
export function RecibeMimos({ yo, otro }: { yo: Persona; otro: Persona | null }) {
  const otroRef = useRef(otro);
  useEffect(() => {
    otroRef.current = otro;
  }, [otro]);

  useEffect(() => {
    if (esDemo) return;
    let vivo = true;

    const tomar = async () => {
      const cuantos = await accionTomarMimos().catch(() => 0);
      if (!vivo || cuantos === 0 || !otroRef.current) return;
      const persona = otroRef.current;
      toast(`${persona.nombre} te ama también 💛`, {
        description: cuantos > 1 ? `Te lo dijo ${cuantos} veces` : 'Te lo acaba de decir',
        icon: <Avatar persona={persona} />,
        duration: 10000,
      });
    };

    // Los que llegaron mientras no estaba.
    void tomar();

    const supabase = crearClienteNavegador();
    const canal = supabase
      .channel(`mimos:${yo.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mimos', filter: `para=eq.${yo.id}` },
        () => void tomar(),
      )
      .subscribe();

    return () => {
      vivo = false;
      supabase.removeChannel(canal);
    };
  }, [yo.id]);

  return null;
}
