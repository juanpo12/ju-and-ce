'use client';

import { useEffect, useRef, useState } from 'react';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { esDemo } from '@/lib/demo';
import { accionAceptarMimos, accionEstadoMimos, accionMandarMimo } from '@/app/acciones';
import { DialogoAdaptable } from './DialogoAdaptable';
import { Boton } from './Boton';
import type { Persona } from '@/lib/personas';
import type { TipoMimo } from '@/db/schema';

const CLAVE = 'mensaje-para-ceci';

type Pantalla = { tipo: 'inicial' } | { tipo: 'recibido'; mimo: TipoMimo } | null;

/**
 * El ida y vuelta de «te amo»:
 *
 * 1. Ceci abre la app y le aparece «Tu juju te ama por siempre mamor». Puede
 *    contestar «Yo también te amo» o ignorarlo (y le vuelve a salir la próxima
 *    vez que abra la app).
 * 2. Si contesta, a Juan le llega «Ceci te ama también». Mientras él no lo vea,
 *    a Ceci no le aparece nada.
 * 3. Juan puede contestar «Yo más» o aceptar. Si contesta, a Ceci le llega
 *    «Tu juju dice que te ama más», y ella puede redoblar o aceptar. Y así.
 *
 * Lo recibido se muestra hasta que se contesta o se acepta: si la app se cierra
 * con el mensaje abierto, aparece de nuevo al volver.
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
  const [pantalla, setPantalla] = useState<Pantalla>(null);
  const [abierto, setAbierto] = useState(false);
  const esCeciRef = useRef(esCeci);
  const otroId = otro?.id;

  useEffect(() => {
    if (esDemo || !otroId) return;
    let vivo = true;

    const mirar = async (alAbrir: boolean) => {
      const estado = await accionEstadoMimos().catch(() => null);
      if (!vivo || !estado) return;

      if (estado.recibido) {
        setPantalla({ tipo: 'recibido', mimo: estado.recibido });
        setAbierto(true);
        return;
      }
      // El mensaje de apertura es solo para Ceci, una vez por apertura, y no
      // mientras espera que Juan le conteste.
      if (!alAbrir || !esCeciRef.current || estado.esperando) return;
      try {
        if (sessionStorage.getItem(CLAVE)) return;
        sessionStorage.setItem(CLAVE, '1');
      } catch {
        // Sin storage: se lo mostramos igual.
      }
      setPantalla({ tipo: 'inicial' });
      setAbierto(true);
    };

    void mirar(true);

    const supabase = crearClienteNavegador();
    const canal = supabase
      .channel(`mimos:${yo.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mimos', filter: `para=eq.${yo.id}` },
        () => void mirar(false),
      )
      .subscribe();

    return () => {
      vivo = false;
      supabase.removeChannel(canal);
    };
  }, [yo.id, otroId]);

  if (!otro || !pantalla) return null;

  const cerrar = () => setAbierto(false);
  const marcarVisto = () => {
    try {
      sessionStorage.setItem(CLAVE, '1');
    } catch {}
  };

  const mandar = (tipo: TipoMimo) => {
    cerrar();
    marcarVisto();
    void accionMandarMimo(tipo).catch(() => {});
  };
  const aceptar = () => {
    cerrar();
    marcarVisto();
    void accionAceptarMimos().catch(() => {});
  };

  const quien = esCeci ? 'Tu juju' : otro.nombre;

  if (pantalla.tipo === 'inicial') {
    return (
      <DialogoAdaptable abierto={abierto} onCambio={setAbierto} titulo="Hola mamor 💛">
        <Contenido emoji="💌" texto="Tu juju te ama por siempre mamor">
          <Boton className="w-full" onClick={() => mandar('tambien')}>
            Yo también te amo 💛
          </Boton>
          <Boton variante="suave" className="w-full" onClick={cerrar}>
            Ignorar
          </Boton>
        </Contenido>
      </DialogoAdaptable>
    );
  }

  const texto =
    pantalla.mimo === 'tambien'
      ? `${quien} te ama también`
      : `${quien} dice que te ama más`;

  return (
    <DialogoAdaptable
      abierto={abierto}
      // Cerrarlo deslizando o tocando afuera cuenta como «Aceptar».
      onCambio={(a) => (a ? setAbierto(true) : aceptar())}
      titulo={pantalla.mimo === 'tambien' ? 'Te contestó 💛' : '¿Ah sí? 😤'}
    >
      <Contenido emoji={pantalla.mimo === 'tambien' ? '💞' : '😤'} texto={texto}>
        <Boton className="w-full" onClick={() => mandar('mas')}>
          {pantalla.mimo === 'tambien' ? 'Yo más 😤' : 'No, yo más 😤'}
        </Boton>
        <Boton variante="suave" className="w-full" onClick={aceptar}>
          Aceptar 💛
        </Boton>
      </Contenido>
    </DialogoAdaptable>
  );
}

function Contenido({
  emoji,
  texto,
  children,
}: {
  emoji: string;
  texto: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <p className="text-6xl" aria-hidden>
        {emoji}
      </p>
      <p className="font-titulo text-2xl font-bold leading-snug text-tinta">{texto}</p>
      <div className="flex w-full flex-col gap-2">{children}</div>
    </div>
  );
}
