'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Boton } from '@/components/Boton';
import { accionMarcarVista } from '@/app/acciones';

/** Pendiente → vista, con la fecha de hoy. Después lleva a la ficha para puntuar. */
export function BotonYaLaVimos({ entradaId }: { entradaId: string }) {
  const router = useRouter();
  const [pendiente, empezar] = useTransition();

  return (
    <Boton
      type="button"
      disabled={pendiente}
      onClick={() =>
        empezar(async () => {
          await accionMarcarVista(entradaId);
          router.push(`/peli/${entradaId}`);
        })
      }
    >
      {pendiente ? '…' : 'Ya la vimos'}
    </Boton>
  );
}
