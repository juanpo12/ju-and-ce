'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { Boton } from '@/components/Boton';

const CAMPO =
  'foco rounded-tema border border-borde bg-fondo px-3 py-2.5 text-base text-tinta outline-none placeholder:text-tinta-suave/60';

export function FormularioEntrar({ volver }: { volver?: string }) {
  const router = useRouter();
  const [mail, setMail] = useState('');
  const [clave, setClave] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError('');

    const supabase = crearClienteNavegador();
    const { error } = await supabase.auth.signInWithPassword({
      email: mail.trim(),
      password: clave,
    });

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Mail o contraseña incorrectos.'
          : 'No pudimos entrar. Probá de nuevo.',
      );
      setEnviando(false);
      return;
    }

    // Solo rutas propias: `volver` viene de la URL y no puede mandarte a otro sitio.
    const destino = volver?.startsWith('/') && !volver.startsWith('//') ? volver : '/';
    router.replace(destino);
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="mt-6 flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-tinta">Mail</span>
        <input
          type="email"
          required
          autoFocus
          autoComplete="email"
          inputMode="email"
          value={mail}
          onChange={(e) => setMail(e.target.value)}
          placeholder="vos@ejemplo.com"
          className={CAMPO}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-tinta">Contraseña</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          className={CAMPO}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-acento">
          {error}
        </p>
      )}

      <Boton type="submit" disabled={enviando}>
        {enviando ? 'Entrando…' : 'Entrar'}
      </Boton>
    </form>
  );
}
