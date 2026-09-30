'use client';

import { useActionState } from 'react';
import { accionUnirse } from '@/app/acciones';
import { Boton } from '@/components/Boton';

const CAMPO =
  'foco rounded-tema border border-borde bg-fondo px-3 py-2.5 text-base text-tinta outline-none placeholder:text-tinta-suave/60';

export function FormularioUnirse({ token }: { token: string }) {
  const [estado, enviar, enviando] = useActionState(
    (_: Awaited<ReturnType<typeof accionUnirse>>, datos: FormData) => accionUnirse(token, datos),
    undefined,
  );

  return (
    <form action={enviar} className="mt-6 flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-tinta">Tu nombre</span>
        <input name="nombre" required autoFocus autoComplete="given-name" className={CAMPO} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-tinta">Mail</span>
        <input
          name="mail"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="vos@ejemplo.com"
          className={CAMPO}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-tinta">Contraseña</span>
        <input
          name="clave"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={CAMPO}
        />
        <span className="text-xs text-tinta-suave">Al menos 8 caracteres.</span>
      </label>

      {estado?.error && (
        <p role="alert" className="text-sm text-acento">
          {estado.error}
        </p>
      )}

      <Boton type="submit" disabled={enviando}>
        {enviando ? 'Creando tu cuenta…' : 'Entrar a la libreta'}
      </Boton>
    </form>
  );
}
