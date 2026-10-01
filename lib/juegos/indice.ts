import type {
  Carta,
  Juego,
  JugadaDeJuego,
  Partida,
  SecretoNoche,
} from '@/lib/noche';
import { elegirUno, type Azar } from './azar';
import { ErrorDeJuego } from './error';
import { iniciarPPT, aplicarPPT } from './ppt';
import { iniciarMemoria, aplicarMemoria, MINIMO_FICHAS_MEMORIA } from './memoria';
import { iniciarAhorcado, aplicarLetra, aplicarArriesgo, elegible, type TituloParaAhorcar } from './ahorcado';
import { iniciarWordle, aplicarIntento } from './wordle';

export { ErrorDeJuego };

/** Lo que un juego necesita para arrancar. */
export type ContextoDePartida = {
  jugadores: [string, string];
  /** Quién abre la partida, en los juegos por turnos. */
  empieza: string;
  /** Las pelis vistas: cartas para la memoria, títulos para el ahorcado. */
  fichas: Carta[];
  titulos: TituloParaAhorcar[];
};

/** Por qué un juego no se puede jugar hoy, o null si se puede. */
export function porQueNoSePuede(juego: Juego, ctx: Pick<ContextoDePartida, 'fichas' | 'titulos'>) {
  if (juego === 'memoria' && ctx.fichas.length < MINIMO_FICHAS_MEMORIA) {
    return `Hacen falta ${MINIMO_FICHAS_MEMORIA} pelis vistas para armar el tablero.`;
  }
  if (juego === 'ahorcado' && !ctx.titulos.some((t) => elegible(t.titulo))) {
    return 'Hace falta alguna peli vista para adivinar.';
  }
  return null;
}

export type Inicio = { partida: Partida; secreto: SecretoNoche; fin?: { ganadorId: string } };

export function iniciarPartida(juego: Juego, ctx: ContextoDePartida, azar: Azar): Inicio {
  const motivo = porQueNoSePuede(juego, ctx);
  if (motivo) throw new ErrorDeJuego(motivo);

  switch (juego) {
    case 'ppt':
      return { partida: iniciarPPT(ctx.jugadores), secreto: {} };
    case 'memoria': {
      const { partida, tablero } = iniciarMemoria(ctx.fichas, ctx.jugadores, ctx.empieza, azar);
      return { partida, secreto: { memoria: { tablero } } };
    }
    case 'ahorcado': {
      const { partida, titulo } = iniciarAhorcado(ctx.titulos, ctx.empieza, azar);
      return { partida, secreto: { ahorcado: { titulo } } };
    }
    case 'wordle': {
      const { partida, palabra } = iniciarWordle(azar);
      return { partida, secreto: { wordle: { palabra } } };
    }
    case 'moneda': {
      const resultado = elegirUno(ctx.jugadores, azar);
      return {
        partida: { juego: 'moneda', resultado, lanzadaPor: ctx.empieza },
        secreto: {},
        fin: { ganadorId: resultado },
      };
    }
  }
}

export type Aplicacion = {
  partida: Partida;
  secreto: SecretoNoche;
  /** `ganadorId: null` es empate: lo define la moneda. */
  fin?: { ganadorId: string | null };
};

export function aplicarJugada(
  partida: Partida,
  secreto: SecretoNoche,
  yo: string,
  jugada: JugadaDeJuego,
  jugadores: [string, string],
): Aplicacion {
  if (jugada.juego !== partida.juego) throw new ErrorDeJuego('Esa jugada no es de este juego.');

  switch (partida.juego) {
    case 'ppt': {
      if (jugada.juego !== 'ppt') break;
      const r = aplicarPPT(partida, secreto.ppt ?? {}, yo, jugada.jugada, jugadores);
      return { partida: r.partida, secreto: { ...secreto, ppt: r.secreto }, fin: r.fin };
    }
    case 'memoria': {
      if (jugada.juego !== 'memoria') break;
      const tablero = secreto.memoria?.tablero;
      if (!tablero) throw new ErrorDeJuego('El tablero se perdió.');
      const r = aplicarMemoria(partida, tablero, yo, jugada.carta, jugadores);
      return { partida: r.partida, secreto, fin: r.fin };
    }
    case 'ahorcado': {
      if (jugada.juego !== 'ahorcado') break;
      const titulo = secreto.ahorcado?.titulo;
      if (!titulo) throw new ErrorDeJuego('El título se perdió.');
      const r =
        'letra' in jugada
          ? aplicarLetra(partida, titulo, yo, jugada.letra, jugadores)
          : aplicarArriesgo(partida, titulo, yo, jugada.arriesgo, jugadores);
      return { partida: r.partida, secreto, fin: r.fin };
    }
    case 'wordle': {
      if (jugada.juego !== 'wordle') break;
      const palabra = secreto.wordle?.palabra;
      if (!palabra) throw new ErrorDeJuego('La palabra se perdió.');
      const r = aplicarIntento(partida, palabra, yo, jugada.intento, jugadores);
      return { partida: r.partida, secreto, fin: r.fin };
    }
  }
  // La moneda no se juega: ya cayó al elegirla.
  throw new ErrorDeJuego('Esa jugada no es de este juego.');
}

/** Cuando el juego empató: cara o cruz. */
export function desempatar(jugadores: [string, string], azar: Azar) {
  return elegirUno(jugadores, azar);
}

/** Si la jugada que llegó del navegador tiene la forma que corresponde. */
export function esJugadaValida(j: unknown): j is JugadaDeJuego {
  if (!j || typeof j !== 'object') return false;
  const o = j as Record<string, unknown>;
  switch (o.juego) {
    case 'ppt':
      return o.jugada === 'piedra' || o.jugada === 'papel' || o.jugada === 'tijera';
    case 'memoria':
      return typeof o.carta === 'number' && Number.isInteger(o.carta);
    case 'ahorcado':
      return (
        (typeof o.letra === 'string' && o.letra.length === 1) ||
        (typeof o.arriesgo === 'string' && o.arriesgo.length <= 200)
      );
    case 'wordle':
      return typeof o.intento === 'string' && o.intento.length <= 10;
    default:
      return false;
  }
}
