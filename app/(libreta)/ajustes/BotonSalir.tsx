'use client';

import { useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { Boton } from '@/components/Boton';
import { accionSalir } from '@/app/acciones';

export function BotonSalir() {
  const [pendiente, empezar] = useTransition();
  return (
    <Boton
      type="button"
      variante="secundario"
      disabled={pendiente}
      onClick={() => empezar(() => accionSalir())}
      className="w-full py-3 sm:w-auto"
    >
      <LogOut className="size-4" aria-hidden />
      {pendiente ? 'Saliendo…' : 'Cerrar sesión'}
    </Boton>
  );
}
