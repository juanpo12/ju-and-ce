import { NextResponse } from 'next/server';
import { buscar, traerFicha } from '@/lib/tmdb';
import { claveFicha, guardarFicha, fichasEnBiblioteca } from '@/db/queries';
import { TIPOS, type Tipo } from '@/db/schema';
import { perfilActual } from '@/lib/sesion';

/**
 * El único punto de contacto con TMDB. Existe para que la clave no salga al
 * navegador.
 *
 *   GET  /api/peliculas?q=interstellar  → películas y series, ya normalizadas
 *   POST { tmdb_id, tipo }              → guarda la ficha completa y la devuelve
 */

export async function GET(request: Request) {
  const perfil = await perfilActual();
  if (!perfil) return NextResponse.json({ error: 'Sin sesión' }, { status: 401 });

  const q = new URL(request.url).searchParams.get('q') ?? '';
  if (q.trim().length < 2) return NextResponse.json({ resultados: [] });

  try {
    // `ya_en_biblioteca` lo calcula el handler, cruzando contra `entradas` con
    // la sesión del usuario: es lo que apaga el botón en la pantalla de búsqueda.
    const [encontradas, yaEstan] = await Promise.all([
      buscar(q),
      fichasEnBiblioteca(perfil.id),
    ]);

    return NextResponse.json({
      resultados: encontradas.map((p) => ({
        ...p,
        ya_en_biblioteca: yaEstan.has(claveFicha(p.tmdb_id, p.tipo)),
      })),
    });
  } catch (e) {
    console.error('[tmdb] búsqueda falló', e);
    return NextResponse.json({ error: 'No pudimos buscar en TMDB' }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const perfil = await perfilActual();
  if (!perfil) return NextResponse.json({ error: 'Sin sesión' }, { status: 401 });

  const cuerpo = (await request.json().catch(() => null)) as
    | { tmdb_id?: unknown; tipo?: unknown }
    | null;
  const tmdbId = Number(cuerpo?.tmdb_id);
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ error: 'tmdb_id inválido' }, { status: 400 });
  }
  const tipo = (cuerpo?.tipo ?? 'pelicula') as Tipo;
  if (!TIPOS.includes(tipo)) {
    return NextResponse.json({ error: 'tipo inválido' }, { status: 400 });
  }

  try {
    const ficha = await traerFicha(tmdbId, tipo);
    await guardarFicha(ficha);
    return NextResponse.json({ pelicula: ficha });
  } catch (e) {
    console.error('[tmdb] import falló', e);
    return NextResponse.json({ error: 'No pudimos importar la ficha' }, { status: 502 });
  }
}
