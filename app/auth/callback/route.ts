import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';

/**
 * La vuelta del magic link. En web esto es todo: el mail abre el navegador y
 * listo — nada de deep links ni de esquemas de URL. Es el flujo para el que el
 * magic link fue pensado.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const volver = searchParams.get('volver') ?? '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/entrar?error=sin-codigo`);
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth] no se pudo canjear el código', error.message);
    return NextResponse.redirect(`${origin}/entrar?error=link-vencido`);
  }

  // Detrás de un proxy (Vercel) `origin` es el interno: el header manda.
  const adelante = request.headers.get('x-forwarded-host');
  const destino = adelante ? `https://${adelante}${volver}` : `${origin}${volver}`;
  return NextResponse.redirect(destino);
}
