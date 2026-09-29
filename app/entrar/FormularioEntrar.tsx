'use client';

import { useState } from 'react';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { Boton } from '@/components/Boton';

export function FormularioEntrar({ volver }: { volver?: string }) {
  const [mail, setMail] = useState('');
  const [estado, setEstado] = useState<'quieto' | 'enviando' | 'listo' | 'error'>('quieto');
  const [detalle, setDetalle] = useState('');

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado('enviando');

    const supabase = crearClienteNavegador();
    const destino = new URL('/auth/callback', window.location.origin);
    if (volver) destino.searchParams.set('volver', volver);

    const { error } = await supabase.auth.signInWithOtp({
      email: mail.trim(),
      options: { emailRedirectTo: destino.toString() },
    });

    if (error) {
      setDetalle(error.message);
      setEstado('error');
    } else {
      setEstado('listo');
    }
  }

  if (estado === 'listo') {
    return (
      <div className="mt-6 rounded-tema bg-acento-suave px-4 py-5 text-center">
        <p className="font-titulo text-2xl text-tinta">Listo</p>
        <p className="mt-1 text-sm leading-relaxed text-tinta-suave">
          Te mandamos un link a <strong className="text-tinta">{mail}</strong>. Abrilo desde
          este mismo dispositivo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-6 flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-tinta">Tu mail</span>
        <input
          type="email"
          required
          autoFocus
          autoComplete="email"
          inputMode="email"
          value={mail}
          onChange={(e) => setMail(e.target.value)}
          placeholder="vos@ejemplo.com"
          className="foco rounded-tema border border-borde bg-fondo px-3 py-2.5 text-base text-tinta outline-none placeholder:text-tinta-suave/60"
        />
      </label>

      {estado === 'error' && (
        <p role="alert" className="text-sm text-acento">
          {detalle || 'No pudimos mandar el link.'}
        </p>
      )}

      <Boton type="submit" disabled={estado === 'enviando'}>
        {estado === 'enviando' ? 'Mandando…' : 'Mandame el link'}
      </Boton>
    </form>
  );
}
