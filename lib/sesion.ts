import { cache } from 'react';
import { redirect } from 'next/navigation';
import { crearClienteServidor } from './supabase/server';
import { esDemo, PERFIL_DEMO } from './demo';
import { buscarPerfil, type PerfilConCompanero } from '@/db/queries';

/**
 * El id del usuario logueado, o null. Una sola vez por render: el layout, la
 * página y `generateMetadata` lo piden todos.
 *
 * getClaims(), no getSession(): verifica la firma del JWT en vez de creerle a la
 * cookie. Y no getUser(), que va al servidor de Auth en cada llamada: con las
 * claves asimétricas de Supabase, getClaims() verifica localmente contra el JWKS
 * cacheado. Con el secreto simétrico viejo cae solo a lo mismo que getUser().
 */
const usuarioActual = cache(async (): Promise<string | null> => {
  if (esDemo) return PERFIL_DEMO;

  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getClaims();
  return data?.claims.sub ?? null;
});

/**
 * El perfil del usuario logueado, o null. Va envuelto en `cache()` para que las
 * varias llamadas dentro de un mismo render peguen una sola vez a la base.
 */
export const perfilActual = cache(async (): Promise<PerfilConCompanero | null> => {
  const userId = await usuarioActual();
  return userId ? buscarPerfil(userId) : null;
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
  if (!(await usuarioActual())) redirect('/entrar');

  const perfil = await perfilActual();
  if (!perfil) redirect('/sin-libreta');
  return perfil;
}
