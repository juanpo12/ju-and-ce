import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente con la clave secreta: puede crear usuarios aunque el registro público
 * esté apagado. Solo del lado del servidor, y solo para eso: que la otra persona
 * entre con una invitación válida. Nunca con `NEXT_PUBLIC_`.
 */
export function clienteAdmin() {
  const clave = process.env.SUPABASE_SECRET_KEY;
  if (!clave) throw new Error('Falta SUPABASE_SECRET_KEY (Supabase → Settings → API Keys).');

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, clave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
