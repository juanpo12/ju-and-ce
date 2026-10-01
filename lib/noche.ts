import type { Noche, Tipo } from '@/db/schema';

/**
 * Los tipos de una «noche de peli»: la sesión en la que se elige qué ver.
 *
 * Este archivo lo importan el esquema, las acciones, la lógica de los juegos y
 * los componentes del navegador, así que no tiene nada que corra: solo tipos,
 * constantes y un par de funciones puras.
 */

/** Los mismos valores que los checks de `noches` en la base. */
export const MODOS_NOCHE = ['individual', 'duo'] as const;
export const FASES_NOCHE = ['esperando', 'candidatas', 'juego', 'jugando', 'terminada', 'cancelada'] as const;
export const JUEGOS = ['ppt', 'memoria', 'ahorcado', 'wordle', 'moneda'] as const;

export type Modo = (typeof MODOS_NOCHE)[number];

/**
 * esperando   → el que abrió la sesión espera al otro
 * candidatas  → los dos presentes; cada uno propone la suya
 * juego       → las candidatas difieren: hay que elegir con qué se define
 * jugando     → la partida en curso
 * terminada   → hay elegida (y ganador, salvo que hayan coincidido)
 * cancelada   → alguien cerró la sesión antes de terminar
 */
export type Fase = (typeof FASES_NOCHE)[number];

export type Juego = (typeof JUEGOS)[number];

export const NOMBRE_JUEGO: Record<Juego, string> = {
  ppt: 'Piedra, papel o tijera',
  memoria: 'Memoria',
  ahorcado: 'Ahorcado',
  wordle: 'La palabra',
  moneda: 'Moneda',
};

/** «ganó Juan al ahorcado», «ganó Ceci a la moneda». */
export const AL_JUEGO: Record<Juego, string> = {
  ppt: 'a piedra, papel o tijera',
  memoria: 'a la memoria',
  ahorcado: 'al ahorcado',
  wordle: 'a la palabra',
  moneda: 'a la moneda',
};

export type Candidata = { entradaId: string; como: 'elijo' | 'azar' };

export type FiltrosNoche = { tipo?: Tipo; genero?: string; duracionMax?: number };

/** Lo que una pendiente necesita tener para pasar por los filtros del sorteo. */
export type Filtrable = { tipo: Tipo; generos: string[]; duracionMin: number | null };

/**
 * Las candidatas que quedan con los filtros puestos. Corre igual en el
 * navegador (para decir «7 candidatas» mientras se eligen) y en el servidor
 * (para sortear de verdad). Una sin duración pasa el tope: no se sabe cuánto dura.
 */
export function filtrarPendientes<T extends Filtrable>(lista: readonly T[], f: FiltrosNoche): T[] {
  return lista.filter(
    (p) =>
      (!f.tipo || p.tipo === f.tipo) &&
      (!f.genero || p.generos.includes(f.genero)) &&
      (!f.duracionMax || p.duracionMin === null || p.duracionMin <= f.duracionMax),
  );
}

export function filtrosValidos(f: unknown): FiltrosNoche {
  if (!f || typeof f !== 'object') return {};
  const o = f as Record<string, unknown>;
  return {
    ...(o.tipo === 'pelicula' || o.tipo === 'serie' ? { tipo: o.tipo } : {}),
    ...(typeof o.genero === 'string' && o.genero ? { genero: o.genero.slice(0, 60) } : {}),
    ...(typeof o.duracionMax === 'number' && o.duracionMax > 0 ? { duracionMax: o.duracionMax } : {}),
  };
}

/* ------------------------------- los juegos ------------------------------ */

export type Jugada = 'piedra' | 'papel' | 'tijera';
export const JUGADAS: Jugada[] = ['piedra', 'papel', 'tijera'];

export type PartidaPPT = {
  juego: 'ppt';
  /** Las rondas ya resueltas. `ganador: null` es empate, y se repite. */
  rondas: { jugadas: Record<string, Jugada>; ganador: string | null }[];
  /** Quiénes ya eligieron en la ronda en curso (sin decir qué). */
  eligieron: string[];
  marcador: Record<string, number>;
  /** A cuántos puntos se juega: 2 es «al mejor de 3». */
  meta: number;
};

/** Una carta del tablero: una peli de la biblioteca, con lo que `Poster` necesita. */
export type Carta = {
  entradaId: string;
  titulo: string;
  anio: number | null;
  posterPath: string | null;
};

export type PartidaMemoria = {
  juego: 'memoria';
  /** Una por posición. `revelada` es la cara visible (dada vuelta o ya ganada). */
  cartas: { revelada: Carta | null; de: string | null }[];
  /** Las posiciones dadas vuelta en el turno en curso (0 o 1). */
  volteadas: number[];
  turno: string;
  pares: Record<string, number>;
  totalPares: number;
  /**
   * El último par que se intentó. Si falló, el servidor ya tapó las dos: el
   * cliente las muestra un momento cuando cambia `n`, y después las da vuelta.
   */
  ultimaJugada?: {
    n: number;
    por: string;
    cartas: [number, number];
    fichas: [Carta, Carta];
    acierto: boolean;
  };
};

export type PartidaAhorcado = {
  juego: 'ahorcado';
  /** El título con las letras que faltan como «_». Espacios y signos, visibles. */
  mascara: string;
  letras: { letra: string; por: string; acierto: boolean }[];
  turno: string;
  errores: number;
  maximo: number;
  /** Para ubicarse: el año, o el género. */
  pista: string | null;
  arriesgo?: { por: string; texto: string; acierto: boolean };
  /** Se revela al terminar. */
  titulo?: string;
};

export type PistaWordle = 'bien' | 'casi' | 'no';

export type PartidaWordle = {
  juego: 'wordle';
  intentos: Record<string, { letras: string; pistas: PistaWordle[] }[]>;
  resultado: Record<string, 'acerto' | 'fallo'>;
  maximo: number;
  /** Se revela al terminar. */
  palabra?: string;
};

export type PartidaMoneda = {
  juego: 'moneda';
  resultado: string;
  lanzadaPor: string;
};

export type Partida = PartidaPPT | PartidaMemoria | PartidaAhorcado | PartidaWordle | PartidaMoneda;

/* ----------------------------- estado y secreto --------------------------- */

export type EstadoNoche = {
  /** Quiénes entraron a la sesión. */
  presentes?: string[];
  candidatas?: Record<string, Candidata>;
  partida?: Partida;
  /** Cuando el juego empató, lo define una moneda. */
  desempate?: { resultado: string };
  /** Quién canceló. */
  cerradaPor?: string;
};

/** Lo que el servidor necesita para arbitrar y no se muestra. */
export type SecretoNoche = {
  ppt?: Record<string, Jugada>;
  memoria?: { tablero: Carta[] };
  ahorcado?: { titulo: string };
  wordle?: { palabra: string };
};

/** La fila sin el secreto: lo único que viaja al navegador. */
export type NochePublica = Omit<Noche, 'secreto'>;

/** Una jugada, según el juego. Lo que manda el celular al servidor. */
export type JugadaDeJuego =
  | { juego: 'ppt'; jugada: Jugada }
  | { juego: 'memoria'; carta: number }
  | { juego: 'ahorcado'; letra: string }
  | { juego: 'ahorcado'; arriesgo: string }
  | { juego: 'wordle'; intento: string };

/* -------------------------------- ayudas --------------------------------- */

export const FASES_VIVAS: Fase[] = ['esperando', 'candidatas', 'juego', 'jugando'];

export const estaViva = (fase: Fase) => FASES_VIVAS.includes(fase);

/** El otro de los dos. */
export const elOtro = (jugadores: [string, string], yo: string) =>
  jugadores[0] === yo ? jugadores[1] : jugadores[0];
