import { redirect } from 'next/navigation';
import { crearClienteServidor } from '@/lib/supabase/server';
import { perfilActual } from '@/lib/sesion';
import { BotonSalir } from '@/app/(libreta)/ajustes/BotonSalir';

export const metadata = { title: 'Todavía no — Nuestra libreta' };

/**
 * Entraste bien, pero nadie te sumó a una libreta todavía. `perfiles` no tiene
 * política de insert a propósito: el alta la hace el servidor, con el script
 * `npm run alta`. Esta pantalla te da el id que ese script necesita.
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
          no estás en ninguna libreta. Pasale este código a quien la creó:
        </p>

        <code className="mt-4 block overflow-x-auto rounded-tema border border-borde bg-fondo px-3 py-2.5 font-mono text-xs text-tinta">
          {data.user.id}
        </code>

        <p className="mt-4 text-xs leading-relaxed text-tinta-suave">
          Con eso corre <code className="text-tinta">npm run alta -- --sumar</code> y quedás
          adentro. Después recargá esta página.
        </p>

        <div className="mt-5">
          <BotonSalir />
        </div>
      </div>
    </main>
  );
}
