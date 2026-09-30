'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { Boton } from '@/components/Boton';

export function CambiarClave() {
  const [clave, setClave] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const { error } = await crearClienteNavegador().auth.updateUser({ password: clave });
    setEnviando(false);
    if (error) {
      toast.error(
        /different from the old/i.test(error.message)
          ? 'Es la misma contraseña que ya tenías.'
          : 'No pudimos cambiarla. Probá de nuevo.',
      );
      return;
    }
    setClave('');
    toast('Contraseña cambiada');
  }

  return (
    <form onSubmit={guardar} className="mt-3 flex flex-col gap-2 sm:flex-row">
      <input
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Nueva contraseña (8+ caracteres)"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
        className="foco min-w-0 flex-1 rounded-tema border border-borde bg-fondo px-3 py-2.5 text-base text-tinta outline-none placeholder:text-tinta-suave/60"
      />
      <Boton type="submit" variante="secundario" disabled={enviando}>
        {enviando ? 'Guardando…' : 'Cambiar'}
      </Boton>
    </form>
  );
}
