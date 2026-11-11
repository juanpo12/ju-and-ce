'use client';

import { useEffect, useState } from 'react';
import { DialogoAdaptable } from '@/components/DialogoAdaptable';
import { Boton } from '@/components/Boton';

const CLAVE = 'mensaje-para-ceci';

/**
 * Un mimo para Ceci: cada vez que abre la página le aparece este mensaje.
 * Una vez por apertura (sessionStorage), no en cada cambio de pantalla ni al
 * recargar: si cierra la pestaña o la app y vuelve a entrar, aparece de nuevo.
 */
export function MensajeParaCeci() {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(CLAVE)) return;
      sessionStorage.setItem(CLAVE, '1');
    } catch {
      // Sin storage (modo privado raro): igual se lo mostramos.
    }
    setAbierto(true);
  }, []);

  return (
    <DialogoAdaptable
      abierto={abierto}
      onCambio={setAbierto}
      titulo="Hola mamor 💛"
    >
      <div className="flex flex-col items-center gap-5 py-4 text-center">
        <p className="text-6xl" aria-hidden>
          💌
        </p>
        <p className="font-titulo text-2xl font-bold leading-snug text-tinta">
          Tu juju te ama por siempre mamor
        </p>
        <Boton className="w-full" onClick={() => setAbierto(false)}>
          Yo también te amo 💛
        </Boton>
      </div>
    </DialogoAdaptable>
  );
}
