'use client';

import { useEffect, useState } from 'react';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { esDemo } from '@/lib/demo';
import { accionAceptarMimos, accionMandarMimo, accionMimoRecibido } from '@/app/acciones';
import { DialogoAdaptable } from './DialogoAdaptable';
import { Boton } from './Boton';
import type { Persona } from '@/lib/personas';
import type { TipoMimo } from '@/db/schema';

/**
 * El ida y vuelta de «te amo»:
 *
 * 1. Uno toca el corazón de arriba (`BotonTeAmo`) y al otro le aparece «Tu juju
 *    te ama por siempre mamor» (o «Ceci te ama por siempre»).
 * 2. Puede contestar «Yo también te amo» o aceptar.
 * 3. A «Yo también» se le contesta «Yo más», y a «Yo más», «No, yo más». Y así.
 * 4. «Aceptar» corta la cadena: no le aparece nada a nadie hasta que alguien
 *    vuelva a tocar el corazón.
 *
 * Lo recibido se muestra hasta que se contesta o se acepta: si la app se cierra
 * con el mensaje abierto, aparece de nuevo al volver. Llega en vivo por Realtime.
 */
export function Mimos({
  yo,
  otro,
  esCeci,
}: {
  yo: Persona;
  otro: Persona | null;
  esCeci: boolean;
}) {
  const [mimo, setMimo] = useState<TipoMimo | null>(null);
  const [abierto, setAbierto] = useState(false);
  const otroId = otro?.id;

  useEffect(() => {
    if (esDemo || !otroId) return;
    let vivo = true;

    const mirar = async () => {
      const recibido = await accionMimoRecibido().catch(() => null);
      if (!vivo || !recibido) return;
      setMimo(recibido);
      setAbierto(true);
    };

    void mirar();

    const supabase = crearClienteNavegador();
    const canal = supabase
      .channel(`mimos:${yo.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mimos', filter: `para=eq.${yo.id}` },
        () => void mirar(),
      )
      .subscribe();

    return () => {
      vivo = false;
      supabase.removeChannel(canal);
    };
  }, [yo.id, otroId]);

  if (!otro || !mimo) return null;

  const contestar = (tipo: TipoMimo) => {
    setAbierto(false);
    void accionMandarMimo(tipo).catch(() => {});
  };
  const aceptar = () => {
    setAbierto(false);
    void accionAceptarMimos().catch(() => {});
  };

  const quien = esCeci ? 'Tu juju' : otro.nombre;
  const textos: Record<TipoMimo, { titulo: string; emoji: string; texto: string; respuesta: TipoMimo; boton: string }> = {
    te_amo: {
      titulo: esCeci ? 'Hola mamor 💛' : 'Hola 💛',
      emoji: '💌',
      texto: esCeci ? 'Tu juju te ama por siempre mamor' : `${otro.nombre} te ama por siempre`,
      respuesta: 'tambien',
      boton: 'Yo también te amo 💛',
    },
    tambien: {
      titulo: 'Te contestó 💛',
      emoji: '💞',
      texto: `${quien} te ama también`,
      respuesta: 'mas',
      boton: 'Yo más 😤',
    },
    mas: {
      titulo: '¿Ah sí? 😤',
      emoji: '😤',
      texto: `${quien} dice que te ama más`,
      respuesta: 'mas',
      boton: 'No, yo más 😤',
    },
  };
  const t = textos[mimo];

  return (
    <DialogoAdaptable
      abierto={abierto}
      // Cerrarlo deslizando o tocando afuera cuenta como «Aceptar».
      onCambio={(a) => (a ? setAbierto(true) : aceptar())}
      titulo={t.titulo}
    >
      <div className="flex flex-col items-center gap-5 py-4 text-center">
        <p className="text-6xl" aria-hidden>
          {t.emoji}
        </p>
        <p className="font-titulo text-2xl font-bold leading-snug text-tinta">{t.texto}</p>
        <div className="flex w-full flex-col gap-2">
          <Boton className="w-full" onClick={() => contestar(t.respuesta)}>
            {t.boton}
          </Boton>
          <Boton variante="suave" className="w-full" onClick={aceptar}>
            Aceptar
          </Boton>
        </div>
      </div>
    </DialogoAdaptable>
  );
}
