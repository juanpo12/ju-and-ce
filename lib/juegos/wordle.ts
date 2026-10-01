import type { PartidaWordle, PistaWordle } from '@/lib/noche';
import { elegirUno, type Azar } from './azar';
import { ErrorDeJuego } from './error';
import { OBJETIVOS, esValida } from './palabras';

export const MAXIMO_INTENTOS = 6;
export const LARGO = 5;

/** Minúsculas y sin acentos, con la ñ: como está la lista. */
export function normalizarPalabra(texto: string) {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-̂̄-ͯ]/g, '')
    .normalize('NFC');
}

/**
 * Las pistas de un intento. Primero las que están en su lugar; después, de las
 * que sobran, las que están en otro lado — contando cada letra de la palabra
 * una sola vez, así «llave» contra «calle» no marca tres eles.
 */
export function puntuar(intento: string, palabra: string): PistaWordle[] {
  const pistas: PistaWordle[] = Array(palabra.length).fill('no');
  const sobran: Record<string, number> = {};

  for (let i = 0; i < palabra.length; i++) {
    if (intento[i] === palabra[i]) pistas[i] = 'bien';
    else sobran[palabra[i]!] = (sobran[palabra[i]!] ?? 0) + 1;
  }
  for (let i = 0; i < palabra.length; i++) {
    const c = intento[i]!;
    if (pistas[i] === 'bien') continue;
    if (sobran[c]) {
      pistas[i] = 'casi';
      sobran[c]!--;
    }
  }
  return pistas;
}

export function iniciarWordle(azar: Azar): { partida: PartidaWordle; palabra: string } {
  return {
    palabra: elegirUno(OBJETIVOS, azar),
    partida: { juego: 'wordle', intentos: {}, resultado: {}, maximo: MAXIMO_INTENTOS },
  };
}

/**
 * Cada uno adivina por su lado, sin turnos. Gana quien la saca en menos
 * intentos. La partida termina en cuanto el resultado ya no puede cambiar: si
 * el otro ya gastó más intentos de los que vos necesitaste, no hace falta que
 * siga. Igual cantidad, o los dos sin sacarla: moneda.
 */
export function aplicarIntento(
  partida: PartidaWordle,
  palabra: string,
  yo: string,
  intento: string,
  jugadores: [string, string],
): { partida: PartidaWordle; fin?: { ganadorId: string | null } } {
  if (partida.resultado[yo]) throw new ErrorDeJuego('Ya terminaste. Esperá al otro.');
  const p = normalizarPalabra(intento);
  if (p.length !== LARGO || !/^[a-zñ]+$/.test(p)) throw new ErrorDeJuego('Tienen que ser cinco letras.');
  if (!esValida(p)) throw new ErrorDeJuego('Esa palabra no está en la lista.');

  const mios = [...(partida.intentos[yo] ?? []), { letras: p, pistas: puntuar(p, palabra) }];
  const resultado = { ...partida.resultado };
  if (p === palabra) resultado[yo] = 'acerto';
  else if (mios.length >= partida.maximo) resultado[yo] = 'fallo';

  const nueva: PartidaWordle = { ...partida, intentos: { ...partida.intentos, [yo]: mios }, resultado };
  const fin = decidir(nueva, jugadores);
  return { partida: fin ? { ...nueva, palabra } : nueva, fin };
}

/**
 * Lo que cada uno ya tiene asegurado y lo mejor que podría llegar a tener. Si
 * ninguno puede cambiar el orden, se decide.
 */
function decidir(
  partida: PartidaWordle,
  jugadores: [string, string],
): { ganadorId: string | null } | undefined {
  const [a, b] = jugadores;
  const puntaje = (quien: string) => {
    const usados = partida.intentos[quien]?.length ?? 0;
    const r = partida.resultado[quien];
    if (r === 'acerto') return { fijo: usados, mejor: usados };
    if (r === 'fallo') return { fijo: Infinity, mejor: Infinity };
    return { fijo: null, mejor: usados + 1 };
  };
  const pa = puntaje(a);
  const pb = puntaje(b);

  if (pa.fijo !== null && pb.fijo !== null) {
    if (pa.fijo === pb.fijo) return { ganadorId: null };
    return { ganadorId: pa.fijo < pb.fijo ? a : b };
  }
  // Uno terminó y el otro ya no puede ni empatarle.
  if (pa.fijo !== null && pa.fijo < pb.mejor) return { ganadorId: a };
  if (pb.fijo !== null && pb.fijo < pa.mejor) return { ganadorId: b };
  return undefined;
}
