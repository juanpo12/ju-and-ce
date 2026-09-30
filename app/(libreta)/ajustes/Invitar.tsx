'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { accionInvitar } from '@/app/acciones';
import { Boton } from '@/components/Boton';

/**
 * Genera el link para que la otra persona se sume. Uno solo, de un solo uso:
 * generar otro invalida el anterior.
 */
export function Invitar() {
  const [link, setLink] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  const generar = () =>
    empezar(async () => {
      try {
        setLink(await accionInvitar());
      } catch {
        toast.error('No pudimos generar el link');
      }
    });

  async function compartir() {
    if (!link) return;
    if (navigator.share) {
      await navigator.share({ title: 'Nuestra libreta', url: link }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(link);
      toast('Link copiado');
    }
  }

  if (!link) {
    return (
      <Boton type="button" className="mt-3" disabled={pendiente} onClick={generar}>
        {pendiente ? 'Generando…' : 'Invitar a la otra persona'}
      </Boton>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <code className="block overflow-x-auto rounded-tema border border-borde bg-fondo px-3 py-2.5 font-mono text-xs text-tinta">
        {link}
      </code>
      <p className="text-xs leading-relaxed text-tinta-suave">
        Sirve una sola vez y vence en 7 días. Mandáselo por donde quieras: con eso crea su cuenta
        y queda adentro.
      </p>
      <Boton type="button" onClick={compartir}>
        Compartir link
      </Boton>
    </div>
  );
}
