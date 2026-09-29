import { cache } from 'react';
import { redirect } from 'next/navigation';
import { crearClienteServidor } from './supabase/server';
import { esDemo, PERFIL_DEMO } from './demo';
import { buscarPerfil, type PerfilConCompanero } from '@/db/queries';

/**
 * El perfil del usuario logueado, o null. Va envuelto en `cache()` para que las
 * varias llamadas dentro de un mismo render peguen una sola vez a la base.
 */
export const perfilActual = cache(async (): Promise<PerfilConCompanero | null> => {
  if (esDemo) return buscarPerfil(PERFIL_DEMO);

  const supabase = await crearClienteServidor();
  // getUser(), no getSession(): valida el token contra Supabase en vez de creerle
  // a la cookie.
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return buscarPerfil(data.user.id);
});

/**
 * Lo mismo, pero sin dejar seguir sin perfil.
 *
 * Los dos casos no son el mismo y mandarlos al mismo lado causa un bucle: sin
 * sesion hay que ir a /entrar, pero *con* sesion y sin perfil ir a /entrar hace
 * que el middleware rebote a / porque ve un usuario valido, y de ahi otra vez
 * aca. Por eso el segundo caso tiene pantalla propia.
 */
export async function exigirPerfil(): Promise<PerfilConCompanero> {
  if (esDemo) return (await perfilActual())!;

  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/entrar');

  const perfil = await perfilActual();
  if (!perfil) redirect('/sin-libreta');
  return perfil;
}
