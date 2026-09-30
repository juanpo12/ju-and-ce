import 'server-only';
import type { Tipo } from '@/db/schema';

/**
 * Cliente de TMDB. Solo del lado del servidor: la clave vive en
 * `process.env.TMDB_API_KEY`, sin `NEXT_PUBLIC_`, que es lo que la mandaría al
 * bundle del navegador.
 */

const BASE = 'https://api.themoviedb.org/3';
const IDIOMA = 'es-AR';

// TMDB acepta la clave v3 como query param y el token v4 como Bearer. Aceptamos
// las dos para no hacerte elegir en el panel.
function credenciales(): { headers: HeadersInit; query: string } {
  const clave = process.env.TMDB_API_KEY;
  if (!clave) throw new Error('Falta TMDB_API_KEY');
  return clave.startsWith('ey')
    ? { headers: { Authorization: `Bearer ${clave}` }, query: '' }
    : { headers: {}, query: `&api_key=${clave}` };
}

async function pedir<T>(ruta: string, revalidar = 86_400): Promise<T> {
  const { headers, query } = credenciales();
  const url = `${BASE}${ruta}${ruta.includes('?') ? '' : '?'}${query}`;
  // El caché del `fetch` de Next del lado del servidor. Acá murió la
  // conversación sobre Redis: esto más la tabla `peliculas` alcanza y sobra.
  const r = await fetch(url, { headers, next: { revalidate: revalidar } });
  if (!r.ok) throw new Error(`TMDB ${r.status} en ${ruta}`);
  return r.json() as Promise<T>;
}

export type Resultado = {
  tmdb_id: number;
  tipo: Tipo;
  titulo: string;
  titulo_original: string | null;
  anio: number | null;
  generos: string[];
  poster_path: string | null;
  sinopsis: string | null;
  // No vienen en /search: se completan al importar, con /movie/{id} o /tv/{id}.
  director: string | null;
  duracion_min: number | null;
  ya_en_biblioteca: boolean;
};

/** Lo que devuelve /search/multi: las películas traen `title`, las series `name`. */
type ItemBusqueda = {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  poster_path?: string | null;
  overview?: string;
};

const RUTA: Record<Tipo, 'movie' | 'tv'> = { pelicula: 'movie', serie: 'tv' };

/**
 * El mapa de géneros, que /search no trae: devuelve ids, no nombres. Películas
 * y series tienen listas distintas (la de series tiene «Sci-Fi & Fantasy», por
 * ejemplo), pero los ids no se pisan: alcanza con un mapa para las dos.
 */
async function generosPorId(): Promise<Map<number, string>> {
  const listas = await Promise.all(
    (['movie', 'tv'] as const).map((r) =>
      pedir<{ genres: { id: number; name: string }[] }>(
        `/genre/${r}/list?language=${IDIOMA}`,
        604_800,
      ),
    ),
  );
  return new Map(listas.flatMap((l) => l.genres.map((g) => [g.id, g.name] as const)));
}

export async function buscar(consulta: string): Promise<Omit<Resultado, 'ya_en_biblioteca'>[]> {
  const q = consulta.trim();
  if (!q) return [];

  // /search/multi y no /search/movie: así las series aparecen en la misma lista,
  // ordenadas por relevancia junto con las películas. Las personas se descartan.
  const [{ results }, generos] = await Promise.all([
    pedir<{ results: ItemBusqueda[] }>(
      `/search/multi?query=${encodeURIComponent(q)}&language=${IDIOMA}&include_adult=false`,
      3_600,
    ),
    generosPorId(),
  ]);

  return results
    .filter((p) => p.media_type === 'movie' || p.media_type === 'tv')
    .slice(0, 20)
    .map((p) => {
      const tipo: Tipo = p.media_type === 'tv' ? 'serie' : 'pelicula';
      return {
        tmdb_id: p.id,
        tipo,
        titulo: (tipo === 'serie' ? p.name : p.title) ?? '',
        titulo_original: (tipo === 'serie' ? p.original_name : p.original_title) ?? null,
        anio: anioDe(tipo === 'serie' ? p.first_air_date : p.release_date),
        generos: (p.genre_ids ?? []).map((id) => generos.get(id)).filter((g): g is string => !!g),
        poster_path: p.poster_path ?? null,
        sinopsis: p.overview || null,
        director: null,
        duracion_min: null,
      };
    });
}

type Detalle = {
  id: number;
  // Película
  title?: string;
  original_title?: string;
  release_date?: string;
  runtime?: number | null;
  credits?: { crew?: { job?: string; name?: string }[] };
  // Serie
  name?: string;
  original_name?: string;
  first_air_date?: string;
  created_by?: { name?: string }[];
  // Las dos
  genres?: { id: number; name: string }[];
  poster_path?: string | null;
  overview?: string;
};

/**
 * La ficha completa. Son dos cosas que /search no da:
 *   - el director, que viene en `credits` (por eso el `append_to_response`). En
 *     una serie no hay director: va quien la creó, que viene en `created_by`.
 *   - la duración. Una serie no tiene una sola, así que queda vacía y no suma
 *     a las horas del resumen.
 *
 * El caso borde del idioma: si no tiene sinopsis traducida, TMDB devuelve el
 * campo vacío en lugar del inglés. Ahí pedimos de nuevo con en-US.
 */
export async function traerFicha(tmdbId: number, tipo: Tipo = 'pelicula') {
  const ruta = `/${RUTA[tipo]}/${tmdbId}`;
  const p = await pedir<Detalle>(
    `${ruta}?language=${IDIOMA}${tipo === 'pelicula' ? '&append_to_response=credits' : ''}`,
  );

  let sinopsis = p.overview?.trim() || null;
  if (!sinopsis) {
    const ingles = await pedir<Detalle>(`${ruta}?language=en-US`);
    sinopsis = ingles.overview?.trim() || null;
  }

  const director =
    tipo === 'serie'
      ? (p.created_by ?? []).map((c) => c.name).filter(Boolean).join(', ') || null
      : (p.credits?.crew?.find((c) => c.job === 'Director')?.name ?? null);

  return {
    tmdbId: p.id,
    tipo,
    titulo: (tipo === 'serie' ? p.name : p.title) ?? '',
    tituloOriginal: (tipo === 'serie' ? p.original_name : p.original_title) ?? null,
    anio: anioDe(tipo === 'serie' ? p.first_air_date : p.release_date),
    duracionMin: tipo === 'serie' ? null : (p.runtime ?? null),
    director,
    generos: (p.genres ?? []).map((g) => g.name),
    posterPath: p.poster_path ?? null,
    sinopsis,
  };
}

function anioDe(fecha?: string): number | null {
  const n = Number(fecha?.slice(0, 4));
  return Number.isFinite(n) && n > 1800 ? n : null;
}

/** Los pósters: w342 en la grilla, w500 en la ficha. Vive en `lib/tmdb-url.ts`
 *  porque no necesita la clave y lo usan también componentes de cliente. */
export { urlPoster } from './tmdb-url';
