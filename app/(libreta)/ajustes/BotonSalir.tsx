'use client';

import { useTransition } from 'react';
import { Boton } from '@/components/Boton';
import { accionSalir } from '@/app/acciones';

export function BotonSalir() {
  const [pendiente, empezar] = useTransition();
  return (
    <Boton
      type="button"
      variante="fantasma"
      disabled={pendiente}
      onClick={() => empezar(() => accionSalir())}
    >
      Cerrar sesión
    </Boton>
  );
}
