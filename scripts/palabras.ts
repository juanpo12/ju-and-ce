/**
 * Arma `lib/juegos/palabras.ts`, la lista del juego de la palabra.
 *
 *   npm run palabras
 *
 * Se corre a mano y el resultado se commitea: la app no toca la red por esto.
 *
 * Dos fuentes, las dos abiertas:
 *   - FrequencyWords (hermitdave), frecuencia de palabras en subtítulos en
 *     español. Da el orden: qué palabras se usan de verdad.
 *   - Words (lorenbrichter), el diccionario de Letterpress en español. Da la
 *     validez: qué es una palabra y qué es un nombre propio o inglés colado.
 *
 * OBJETIVOS son las palabras que hay que adivinar: las más frecuentes que
 * están en el diccionario, menos los nombres propios y las groserías que
 * sobreviven al cruce. VALIDAS son todas las de cinco letras del diccionario:
 * un intento se acepta si está ahí, así no se rechaza una palabra correcta por
 * poco común.
 */
import { writeFile } from 'node:fs/promises';

const FRECUENCIA =
  'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/es/es_50k.txt';
const DICCIONARIO = 'https://raw.githubusercontent.com/lorenbrichter/Words/master/Words/es.txt';

const CUANTOS_OBJETIVOS = 800;

/** Lo que el cruce no filtra solo: nombres, marcas, groserías, inglés. */
const EXCLUIDAS = new Set([
  'james', 'henry', 'paris', 'maria', 'simon', 'julia', 'lucas', 'vegas', 'robin', 'bruce',
  'rusia', 'japon', 'china', 'india', 'grant', 'pedro', 'diana', 'cesar', 'diego', 'marte',
  'mason', 'green', 'colin', 'corea', 'carla', 'paula', 'allen', 'bruno', 'times', 'nazis',
  'siria', 'maura', 'margo', 'petra', 'olive', 'spray', 'chips', 'nobel', 'islam', 'santa',
  'joder', 'perra', 'zorra', 'tetas', 'putas', 'porno', 'polla', 'jodan', 'jodas', 'jodio',
  'cogio', 'coger', 'cojan', 'cojas', 'orina', 'orgia', 'judio', 'macho', 'bolas', 'culpo',
]);

/** Minúsculas, sin acentos, con la ñ. `[a-zñ]{5}` es lo que entra al tablero. */
function normalizar(palabra: string) {
  return palabra
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-̂̄-ͯ]/g, '') // todo menos la tilde de la ñ (U+0303)
    .normalize('NFC');
}

const cincoLetras = (p: string) => /^[a-zñ]{5}$/.test(p);

async function bajar(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.text();
}

console.log('Bajando las listas…');
const [frecuencia, diccionario] = await Promise.all([bajar(FRECUENCIA), bajar(DICCIONARIO)]);

const validas = new Set<string>();
for (const linea of diccionario.split('\n')) {
  const p = normalizar(linea);
  if (cincoLetras(p)) validas.add(p);
}

const objetivos: string[] = [];
const vistas = new Set<string>();
for (const linea of frecuencia.split('\n')) {
  const p = normalizar(linea.split(' ')[0] ?? '');
  if (!cincoLetras(p) || !validas.has(p) || vistas.has(p) || EXCLUIDAS.has(p)) continue;
  vistas.add(p);
  objetivos.push(p);
  if (objetivos.length === CUANTOS_OBJETIVOS) break;
}

const ordenadas = [...validas].sort();

const salida = `/**
 * Generado por \`npm run palabras\` (scripts/palabras.ts). No se edita a mano.
 *
 * Fuentes: FrequencyWords (hermitdave, CC BY-SA 4.0) para el orden de uso y
 * Words (lorenbrichter, el diccionario de Letterpress) para la validez.
 *
 * OBJETIVOS: ${objetivos.length} palabras frecuentes, las que hay que adivinar.
 * VALIDAS: ${ordenadas.length} palabras de cinco letras, las que se aceptan como intento.
 * Todas en minúsculas y sin acentos, con la ñ.
 */

export const OBJETIVOS: readonly string[] = ${JSON.stringify(objetivos)};

const TODAS = \`${ordenadas.join('\n')}\`;

let indice: Set<string> | null = null;

/** Si se acepta como intento. El índice se arma la primera vez que se pregunta. */
export function esValida(palabra: string) {
  indice ??= new Set(TODAS.split('\\n'));
  return indice.has(palabra);
}
`;

await writeFile(new URL('../lib/juegos/palabras.ts', import.meta.url), salida);
console.log(`Listo: ${objetivos.length} objetivos, ${ordenadas.length} válidas.`);
