/**
 * Armar la URL de un póster no necesita la clave de TMDB, así que vive acá
 * afuera de `lib/tmdb.ts` y puede usarse también desde componentes de cliente.
 */
export function urlPoster(
  path: string | null | undefined,
  ancho: 'w185' | 'w342' | 'w500',
) {
  return path ? `https://image.tmdb.org/t/p/${ancho}${path}` : null;
}
