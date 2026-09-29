'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente del navegador. Solo para dos cosas: la sesion (magic link, logout) y
 * el websocket de Realtime. Los datos los lee el servidor con Drizzle y los
 * escribe con server actions — asi el acceso a datos vive en un solo lugar.
 */
export function crearClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
