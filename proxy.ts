import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { esDemo } from '@/lib/demo';

/**
 * Refresca la sesion en cada request. Sin esto el token vence y los Server
 * Components empiezan a ver al usuario como deslogueado a mitad de uso.
 */
export async function proxy(request: NextRequest) {
  // En demo no hay sesión: entra directo.
  if (esDemo) return NextResponse.next({ request });

  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (nuevas) => {
          for (const { name, value } of nuevas) request.cookies.set(name, value);
          respuesta = NextResponse.next({ request });
          for (const { name, value, options } of nuevas) {
            respuesta.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Esta llamada es la que dispara el refresco. No la saques. getClaims() y no
  // getUser(): corre antes de cada request, y con claves asimétricas verifica
  // el JWT sin ir al servidor de Auth.
  const { data } = await supabase.auth.getClaims();
  const logueado = Boolean(data?.claims.sub);

  const ruta = request.nextUrl.pathname;
  const esPublica = ruta.startsWith('/entrar') || ruta.startsWith('/auth');
  // Tiene sesion pero todavia nadie lo sumo a una libreta: no puede entrar a la
  // app, y tampoco rebotarlo a /entrar — desde ahi volveria aca.
  const esAntesala = ruta.startsWith('/sin-libreta');

  if (!logueado && !esPublica) {
    const url = request.nextUrl.clone();
    url.pathname = '/entrar';
    url.searchParams.set('volver', ruta);
    return NextResponse.redirect(url);
  }

  if (logueado && ruta.startsWith('/entrar') && !esAntesala) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return respuesta;
}

export const config = {
  matcher: [
    // Todo menos estáticos, imágenes y el manifest.
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|iconos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
