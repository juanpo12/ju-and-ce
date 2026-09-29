import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Cliente de servidor, con la sesion en cookies. `@supabase/ssr`, no los
 * `auth-helpers` viejos: es el unico que maneja bien cookies en middleware,
 * Server Components y route handlers a la vez.
 */
export async function crearClienteServidor() {
  const store = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (nuevas) => {
          try {
            for (const { name, value, options } of nuevas) {
              store.set(name, value, options);
            }
          } catch {
            // Un Server Component no puede escribir cookies. No pasa nada: el
            // middleware ya refresco la sesion antes de llegar acá.
          }
        },
      },
    },
  );
}
