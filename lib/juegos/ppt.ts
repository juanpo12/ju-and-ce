import type { Jugada, PartidaPPT } from '@/lib/noche';
import { ErrorDeJuego } from './error';

/** Qué le gana a qué. */
const VENCE: Record<Jugada, Jugada> = { piedra: 'tijera', papel: 'piedra', tijera: 'papel' };

export function ganaPPT(a: Jugada, b: Jugada): 'a' | 'b' | 'empate' {
  if (a === b) return 'empate';
  return VENCE[a] === b ? 'a' : 'b';
}

/** Al mejor de 3: gana el primero que llega a 2. */
export const META_PPT = 2;

export function iniciarPPT(jugadores: [string, string]): PartidaPPT {
  return {
    juego: 'ppt',
    rondas: [],
    eligieron: [],
    marcador: { [jugadores[0]]: 0, [jugadores[1]]: 0 },
    meta: META_PPT,
  };
}

/**
 * Cada uno elige a escondidas: la jugada va al secreto y en público solo queda
 * «ya eligió». Con la segunda, el servidor resuelve la ronda y recién ahí las
 * dos jugadas pasan a ser públicas. Un empate es una ronda sin ganador, y se
 * vuelve a tirar.
 */
export function aplicarPPT(
  partida: PartidaPPT,
  secreto: Record<string, Jugada>,
  yo: string,
  jugada: Jugada,
  jugadores: [string, string],
): { partida: PartidaPPT; secreto: Record<string, Jugada>; fin?: { ganadorId: string } } {
  if (partida.eligieron.includes(yo)) throw new ErrorDeJuego('Ya elegiste. Esperá a que elija el otro.');

  const elegidas = { ...secreto, [yo]: jugada };
  const eligieron = [...partida.eligieron, yo];
  const [a, b] = jugadores;
  const faltan = !elegidas[a] || !elegidas[b];

  if (faltan) {
    return { partida: { ...partida, eligieron }, secreto: elegidas };
  }

  const resultado = ganaPPT(elegidas[a]!, elegidas[b]!);
  const ganador = resultado === 'empate' ? null : resultado === 'a' ? a : b;
  const marcador = { ...partida.marcador };
  if (ganador) marcador[ganador] = (marcador[ganador] ?? 0) + 1;

  const nueva: PartidaPPT = {
    ...partida,
    rondas: [...partida.rondas, { jugadas: { [a]: elegidas[a]!, [b]: elegidas[b]! }, ganador }],
    eligieron: [],
    marcador,
  };
  const fin = ganador && marcador[ganador]! >= partida.meta ? { ganadorId: ganador } : undefined;
  return { partida: nueva, secreto: {}, fin };
}
