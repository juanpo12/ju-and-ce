import type { Carta, PartidaMemoria } from '@/lib/noche';
import { barajar, type Azar } from './azar';
import { ErrorDeJuego } from './error';

/** Con menos de 3 pelis vistas no hay tablero que valga. */
export const MINIMO_FICHAS_MEMORIA = 3;
const MAXIMO_PARES = 7;

/**
 * Cuántos pares entran: impar, para que no pueda haber empate. Con 7 o más
 * vistas, 7 pares (14 cartas, entra en el celular); con menos, el mayor impar.
 */
export function cuantosPares(fichas: number) {
  const n = Math.min(fichas, MAXIMO_PARES);
  return n % 2 === 0 ? n - 1 : n;
}

/** El tablero real, con las caras. Vive en el secreto: en público se ven solo las dadas vuelta. */
export function generarTablero(fichas: readonly Carta[], azar: Azar): Carta[] {
  if (fichas.length < MINIMO_FICHAS_MEMORIA) throw new ErrorDeJuego('Faltan pelis vistas para la memoria.');
  const elegidas = barajar(fichas, azar).slice(0, cuantosPares(fichas.length));
  return barajar([...elegidas, ...elegidas], azar);
}

export function iniciarMemoria(
  fichas: readonly Carta[],
  jugadores: [string, string],
  empieza: string,
  azar: Azar,
): { partida: PartidaMemoria; tablero: Carta[] } {
  const tablero = generarTablero(fichas, azar);
  return {
    tablero,
    partida: {
      juego: 'memoria',
      cartas: tablero.map(() => ({ revelada: null, de: null })),
      volteadas: [],
      turno: empieza,
      pares: { [jugadores[0]]: 0, [jugadores[1]]: 0 },
      totalPares: tablero.length / 2,
    },
  };
}

/**
 * Dar vuelta una carta. La primera del turno queda a la vista; con la segunda se
 * resuelve: si son iguales quedan ganadas y el turno sigue, si no el servidor
 * las tapa ya y deja en `ultimaJugada` lo que había, para que el celular las
 * muestre un momento antes de darlas vuelta.
 */
export function aplicarMemoria(
  partida: PartidaMemoria,
  tablero: readonly Carta[],
  yo: string,
  carta: number,
  jugadores: [string, string],
): { partida: PartidaMemoria; fin?: { ganadorId: string } } {
  if (partida.turno !== yo) throw new ErrorDeJuego('No es tu turno.');
  if (!Number.isInteger(carta) || carta < 0 || carta >= partida.cartas.length) {
    throw new ErrorDeJuego('Esa carta no existe.');
  }
  if (partida.cartas[carta]!.de || partida.volteadas.includes(carta)) {
    throw new ErrorDeJuego('Esa carta ya está dada vuelta.');
  }

  const cara = tablero[carta]!;
  const cartas = partida.cartas.map((c) => ({ ...c }));

  if (partida.volteadas.length === 0) {
    cartas[carta] = { revelada: cara, de: null };
    return { partida: { ...partida, cartas, volteadas: [carta] } };
  }

  const primera = partida.volteadas[0]!;
  const acierto = tablero[primera]!.entradaId === cara.entradaId;
  const n = (partida.ultimaJugada?.n ?? 0) + 1;
  const ultimaJugada = {
    n,
    por: yo,
    cartas: [primera, carta] as [number, number],
    fichas: [tablero[primera]!, cara] as [Carta, Carta],
    acierto,
  };

  if (acierto) {
    cartas[primera] = { revelada: tablero[primera]!, de: yo };
    cartas[carta] = { revelada: cara, de: yo };
    const pares = { ...partida.pares, [yo]: (partida.pares[yo] ?? 0) + 1 };
    const nueva: PartidaMemoria = { ...partida, cartas, volteadas: [], pares, ultimaJugada };
    const ganados = Object.values(pares).reduce((s, v) => s + v, 0);
    if (ganados === partida.totalPares) {
      const [a, b] = jugadores;
      return { partida: nueva, fin: { ganadorId: (pares[a] ?? 0) > (pares[b] ?? 0) ? a : b } };
    }
    return { partida: nueva };
  }

  cartas[primera] = { revelada: null, de: null };
  cartas[carta] = { revelada: null, de: null };
  const otro = jugadores[0] === yo ? jugadores[1] : jugadores[0];
  return { partida: { ...partida, cartas, volteadas: [], turno: otro, ultimaJugada } };
}
