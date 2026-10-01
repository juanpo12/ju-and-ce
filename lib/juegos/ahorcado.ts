import type { PartidaAhorcado } from '@/lib/noche';
import { elegirUno, type Azar } from './azar';
import { ErrorDeJuego } from './error';

export const MAXIMO_ERRORES = 6;
const MINIMO_LETRAS_DISTINTAS = 3;

/** Una peli vista, con lo que sirve de pista. */
export type TituloParaAhorcar = { titulo: string; anio: number | null; genero: string | null };

/**
 * Mayúsculas y sin acentos, con la Ñ: lo que se adivina son letras, y «Anatomía»
 * se adivina con la I de siempre. Espacios y signos quedan como están.
 */
export function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-̂̄-ͯ]/g, '')
    .normalize('NFC')
    .toUpperCase();
}

const ES_LETRA = /^[A-ZÑ]$/;

export function letrasDe(titulo: string) {
  return new Set([...normalizar(titulo)].filter((c) => ES_LETRA.test(c)));
}

/** Sirve si tiene letras para adivinar y nada que el teclado no pueda escribir. */
export function elegible(titulo: string) {
  const n = normalizar(titulo);
  if (letrasDe(titulo).size < MINIMO_LETRAS_DISTINTAS) return false;
  return /^[A-ZÑ0-9\s.,:;'’!?¡¿&()\-]+$/.test(n);
}

/** El título con las letras que faltan tapadas. */
export function enmascarar(titulo: string, adivinadas: ReadonlySet<string>) {
  return [...normalizar(titulo)]
    .map((c) => (ES_LETRA.test(c) && !adivinadas.has(c) ? '_' : c))
    .join('');
}

/** Solo las letras, para comparar un arriesgo sin que un espacio de más lo arruine. */
const soloLetras = (texto: string) => [...normalizar(texto)].filter((c) => ES_LETRA.test(c)).join('');

export function iniciarAhorcado(
  titulos: readonly TituloParaAhorcar[],
  empieza: string,
  azar: Azar,
): { partida: PartidaAhorcado; titulo: string } {
  const elegibles = titulos.filter((t) => elegible(t.titulo));
  if (elegibles.length === 0) throw new ErrorDeJuego('No hay títulos para el ahorcado.');
  const { titulo, anio, genero } = elegirUno(elegibles, azar);
  return {
    titulo,
    partida: {
      juego: 'ahorcado',
      mascara: enmascarar(titulo, new Set()),
      letras: [],
      turno: empieza,
      errores: 0,
      maximo: MAXIMO_ERRORES,
      pista: [anio, genero].filter(Boolean).join(' · ') || null,
    },
  };
}

type Resultado = { partida: PartidaAhorcado; fin?: { ganadorId: string | null } };

/**
 * Una letra por turno. Completar el título gana; los errores son de los dos,
 * y si llegan al máximo nadie lo adivinó: lo define la moneda.
 */
export function aplicarLetra(
  partida: PartidaAhorcado,
  titulo: string,
  yo: string,
  letra: string,
  jugadores: [string, string],
): Resultado {
  if (partida.turno !== yo) throw new ErrorDeJuego('No es tu turno.');
  const l = normalizar(letra);
  if (!ES_LETRA.test(l)) throw new ErrorDeJuego('Eso no es una letra.');
  if (partida.letras.some((x) => x.letra === l)) throw new ErrorDeJuego('Esa letra ya salió.');

  const acierto = letrasDe(titulo).has(l);
  const adivinadas = new Set([...partida.letras.map((x) => x.letra), l]);
  const mascara = enmascarar(titulo, adivinadas);
  const errores = partida.errores + (acierto ? 0 : 1);
  const otro = jugadores[0] === yo ? jugadores[1] : jugadores[0];

  const nueva: PartidaAhorcado = {
    ...partida,
    mascara,
    letras: [...partida.letras, { letra: l, por: yo, acierto }],
    errores,
    turno: otro,
  };

  if (!mascara.includes('_')) return { partida: { ...nueva, titulo }, fin: { ganadorId: yo } };
  if (errores >= partida.maximo) return { partida: { ...nueva, titulo }, fin: { ganadorId: null } };
  return { partida: nueva };
}

/** Arriesgar el título entero: si acertás ganás, si no gana el otro. */
export function aplicarArriesgo(
  partida: PartidaAhorcado,
  titulo: string,
  yo: string,
  texto: string,
  jugadores: [string, string],
): Resultado {
  if (partida.turno !== yo) throw new ErrorDeJuego('No es tu turno.');
  if (!texto.trim()) throw new ErrorDeJuego('Escribí el título para arriesgar.');

  const acierto = soloLetras(texto) === soloLetras(titulo);
  const otro = jugadores[0] === yo ? jugadores[1] : jugadores[0];
  return {
    partida: { ...partida, titulo, arriesgo: { por: yo, texto: texto.trim(), acierto } },
    fin: { ganadorId: acierto ? yo : otro },
  };
}
