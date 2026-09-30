import { redirect } from 'next/navigation';
import { crearClienteServidor } from '@/lib/supabase/server';
import { perfilActual } from '@/lib/sesion';
import { BotonSalir } from '@/app/(libreta)/ajustes/BotonSalir';

export const metadata = { title: 'Todavía no — Nuestra libreta' };

/**
 * Entraste bien, pero no estás en ninguna libreta. Con el registro público
 * apagado casi no pasa: las cuentas nacen de una invitación, que ya suma al
 * espacio. Queda para una cuenta creada a mano desde el panel de Supabase.
 */
export default async function SinLibreta() {
  const perfil = await perfilActual();
  if (perfil) redirect('/');

  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/entrar');

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="tarjeta w-full max-w-md px-6 py-8">
        <h1 className="font-titulo text-3xl leading-tight text-tinta">Casi</h1>
        <p className="mt-2 text-sm leading-relaxed text-tinta-suave">
          Entraste como <strong className="text-tinta">{data.user.email}</strong>, pero todavía
          no estás en ninguna libreta. Pedile a quien la armó el link de invitación: se genera
          desde Ajustes.
        </p>

        <div className="mt-5">
          <BotonSalir />
        </div>
      </div>
    </main>
  );
}
