/**
 * Modo demo: la app entera andando sin Supabase, contra un Postgres de juguete
 * con datos de ejemplo. Sirve para ver y tocar todo antes de tener credenciales.
 *
 *   npm run demo
 *
 * Nunca se enciende en producción, aunque la variable quede puesta: el chequeo de
 * NODE_ENV es la parte que importa, porque saltea el login.
 */
export const esDemo =
  process.env.NEXT_PUBLIC_LIBRETA_DEMO === '1' && process.env.NODE_ENV !== 'production';

/** El id del perfil con el que entra la demo. Lo siembra `db/demo.ts`. */
export const PERFIL_DEMO = '00000000-0000-4000-8000-00000000d3e0';
