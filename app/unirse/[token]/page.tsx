import { redirect } from 'next/navigation';
import { perfilActual } from '@/lib/sesion';
import { invitacionValida } from '@/db/queries';
import { BotonLink } from '@/components/Boton';
import { FormularioUnirse } from './FormularioUnirse';

export const metadata = { title: 'Sumate — Nuestra libreta' };

/**
 * A donde lleva el link de invitación. Es la única forma de crear una cuenta:
 * el registro público de Supabase está apagado, así que tener la URL de la app
 * no alcanza para entrar.
 */
export default async function Unirse({ params }: { params: Promise<{ token: string }> }) {
  if (await perfilActual()) redirect('/');

  const { token } = await params;
  const invitacion = await invitacionValida(token);

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="tarjeta w-full max-w-sm px-6 py-8">
        {invitacion ? (
          <>
            <h1 className="font-titulo text-4xl leading-none text-tinta">Sumate</h1>
            <p className="mt-2 text-sm leading-relaxed text-tinta-suave">
              {invitacion.invita} te invitó a{' '}
              <strong className="text-tinta">{invitacion.espacioNombre}</strong>. Elegí tu mail y
              una contraseña: con eso vas a entrar siempre.
            </p>
            <FormularioUnirse token={token} />
          </>
        ) : (
          <>
            <h1 className="font-titulo text-3xl leading-tight text-tinta">Este link ya no sirve</h1>
            <p className="mt-2 text-sm leading-relaxed text-tinta-suave">
              Ya se usó o venció. Pedile a quien te lo mandó que genere uno nuevo desde Ajustes.
            </p>
            <div className="mt-5">
              <BotonLink href="/entrar" variante="secundario">
                Ya tengo cuenta
              </BotonLink>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
