import { dbAdmin, peliculas } from './index';

/**
 * Las tres películas a mano de la fase 1.
 *
 * Si hay `TMDB_API_KEY`, trae las fichas de verdad — póster y sinopsis incluidos.
 * Si no, deja los datos que sabemos y esos dos campos en null: los completa el
 * route handler la primera vez que alguien busque la película. Inventarlos acá
 * sería cargar datos falsos en la base.
 *
 *   npm run db:seed
 */
const TRES = [129, 157336, 496243];

const SIN_TMDB = [
  {
    tmdbId: 157336,
    titulo: 'Interestelar',
    tituloOriginal: 'Interstellar',
    anio: 2014,
    duracionMin: 169,
    director: 'Christopher Nolan',
    generos: ['Aventura', 'Drama', 'Ciencia ficción'],
  },
  {
    tmdbId: 496243,
    titulo: 'Parásitos',
    tituloOriginal: '기생충',
    anio: 2019,
    duracionMin: 132,
    director: 'Bong Joon-ho',
    generos: ['Comedia', 'Thriller', 'Drama'],
  },
  {
    tmdbId: 129,
    titulo: 'El viaje de Chihiro',
    tituloOriginal: '千と千尋の神隠し',
    anio: 2001,
    duracionMin: 125,
    director: 'Hayao Miyazaki',
    generos: ['Animación', 'Familia', 'Fantasía'],
  },
];

const fichas = process.env.TMDB_API_KEY
  ? await (async () => {
      const { traerFicha } = await import('../lib/tmdb');
      console.log('Trayendo las fichas de TMDB…');
      return Promise.all(TRES.map((id) => traerFicha(id)));
    })()
  : (console.log('Sin TMDB_API_KEY: cargo lo que sabemos, sin póster ni sinopsis.'), SIN_TMDB);

for (const ficha of fichas) {
  await dbAdmin
    .insert(peliculas)
    .values(ficha)
    .onConflictDoUpdate({
      target: [peliculas.tmdbId, peliculas.tipo],
      set: { ...ficha, actualizadaEn: new Date() },
    });
  console.log(`  ${ficha.tmdbId}  ${ficha.titulo}`);
}

console.log(`\n${fichas.length} películas listas.`);
process.exit(0);
