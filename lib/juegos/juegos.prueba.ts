/**
 * La lógica de los juegos, sin base ni navegador:
 *
 *   npm run juegos:test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { azarSemilla } from './azar';
import { ganaPPT, iniciarPPT, aplicarPPT } from './ppt';
import { cuantosPares, iniciarMemoria, aplicarMemoria } from './memoria';
import { normalizar, enmascarar, elegible, iniciarAhorcado, aplicarLetra, aplicarArriesgo } from './ahorcado';
import { puntuar, aplicarIntento, iniciarWordle } from './wordle';
import { aplicarJugada, iniciarPartida, esJugadaValida } from './indice';
import { OBJETIVOS, esValida } from './palabras';
import type { Carta } from '@/lib/noche';

const J: [string, string] = ['juan', 'ceci'];

const fichas: Carta[] = Array.from({ length: 8 }, (_, i) => ({
  entradaId: `e${i}`,
  titulo: `Peli ${i}`,
  anio: 2000 + i,
  posterPath: null,
}));

test('ppt: quién le gana a quién', () => {
  assert.equal(ganaPPT('piedra', 'tijera'), 'a');
  assert.equal(ganaPPT('tijera', 'papel'), 'a');
  assert.equal(ganaPPT('papel', 'piedra'), 'a');
  assert.equal(ganaPPT('piedra', 'papel'), 'b');
  assert.equal(ganaPPT('papel', 'papel'), 'empate');
});

test('ppt: la jugada queda escondida hasta que eligen los dos, y al mejor de 3', () => {
  let p = iniciarPPT(J);
  let s = {};
  let r = aplicarPPT(p, s, 'juan', 'piedra', J);
  assert.deepEqual(r.partida.eligieron, ['juan']);
  assert.equal(r.partida.rondas.length, 0, 'en público no hay jugada todavía');
  assert.equal(r.secreto.juan, 'piedra', 'el secreto sí la tiene');
  assert.throws(() => aplicarPPT(r.partida, r.secreto, 'juan', 'papel', J), /Ya elegiste/);

  r = aplicarPPT(r.partida, r.secreto, 'ceci', 'tijera', J);
  assert.equal(r.partida.rondas[0]!.ganador, 'juan');
  assert.deepEqual(r.secreto, {}, 'resuelta la ronda, el secreto se limpia');
  assert.equal(r.fin, undefined);
  ({ partida: p, secreto: s } = r);

  r = aplicarPPT(p, s, 'juan', 'papel', J);
  r = aplicarPPT(r.partida, r.secreto, 'ceci', 'papel', J);
  assert.equal(r.partida.rondas[1]!.ganador, null, 'empate se registra y se repite');

  r = aplicarPPT(r.partida, r.secreto, 'ceci', 'papel', J);
  r = aplicarPPT(r.partida, r.secreto, 'juan', 'tijera', J);
  assert.deepEqual(r.fin, { ganadorId: 'juan' });
  assert.equal(r.partida.marcador.juan, 2);
});

test('memoria: pares impares, turnos y final', () => {
  assert.equal(cuantosPares(3), 3);
  assert.equal(cuantosPares(4), 3);
  assert.equal(cuantosPares(6), 5);
  assert.equal(cuantosPares(20), 7);

  const { partida, tablero } = iniciarMemoria(fichas, J, 'juan', azarSemilla(7));
  assert.equal(tablero.length, 14);
  assert.equal(partida.totalPares, 7);

  // Juan da vuelta una, se ve; la segunda es otra peli: se tapan y pasa el turno.
  const otra = tablero.findIndex((c) => c.entradaId !== tablero[0]!.entradaId);
  let r = aplicarMemoria(partida, tablero, 'juan', 0, J);
  assert.equal(r.partida.cartas[0]!.revelada?.entradaId, tablero[0]!.entradaId);
  assert.throws(() => aplicarMemoria(r.partida, tablero, 'ceci', 1, J), /No es tu turno/);
  r = aplicarMemoria(r.partida, tablero, 'juan', otra, J);
  assert.equal(r.partida.cartas[0]!.revelada, null);
  assert.equal(r.partida.turno, 'ceci');
  assert.equal(r.partida.ultimaJugada?.acierto, false);
  assert.equal(r.partida.ultimaJugada?.n, 1);

  // Ceci acierta un par: sigue ella.
  const par = tablero.findIndex((c, i) => i !== 0 && c.entradaId === tablero[0]!.entradaId);
  r = aplicarMemoria(r.partida, tablero, 'ceci', 0, J);
  r = aplicarMemoria(r.partida, tablero, 'ceci', par, J);
  assert.equal(r.partida.cartas[par]!.de, 'ceci');
  assert.equal(r.partida.turno, 'ceci');
  assert.equal(r.partida.pares.ceci, 1);
  assert.throws(() => aplicarMemoria(r.partida, tablero, 'ceci', par, J), /ya está dada vuelta/);

  // Ceci se lleva todos los pares que quedan: termina y gana.
  let p = r.partida;
  for (let i = 0; i < tablero.length; i++) {
    if (p.cartas[i]!.de) continue;
    const j = tablero.findIndex((c, k) => k > i && !p.cartas[k]!.de && c.entradaId === tablero[i]!.entradaId);
    p = aplicarMemoria(p, tablero, 'ceci', i, J).partida;
    const fin = aplicarMemoria(p, tablero, 'ceci', j, J);
    p = fin.partida;
    if (fin.fin) {
      assert.deepEqual(fin.fin, { ganadorId: 'ceci' });
      assert.equal(p.pares.ceci, 7);
      return;
    }
  }
  assert.fail('tendría que haber terminado');
});

test('ahorcado: máscara, letras, errores y arriesgo', () => {
  assert.equal(normalizar('Anatomía de una caída'), 'ANATOMIA DE UNA CAIDA');
  assert.equal(enmascarar('La La Land', new Set(['L'])), 'L_ L_ L___');
  assert.equal(elegible('Up'), false, 'muy corta');
  assert.equal(elegible('千と千尋の神隠し'), false, 'no se puede escribir con el teclado');
  assert.equal(elegible('Parásitos'), true);

  const { partida, titulo } = iniciarAhorcado(
    [{ titulo: 'Elvis', anio: 2022, genero: 'Drama' }],
    'juan',
    azarSemilla(1),
  );
  assert.equal(titulo, 'Elvis');
  assert.equal(partida.mascara, '_____');
  assert.equal(partida.pista, '2022 · Drama');

  let r = aplicarLetra(partida, titulo, 'juan', 'e', J);
  assert.equal(r.partida.mascara, 'E____');
  assert.equal(r.partida.turno, 'ceci');
  assert.throws(() => aplicarLetra(r.partida, titulo, 'juan', 'l', J), /No es tu turno/);
  assert.throws(() => aplicarLetra(r.partida, titulo, 'ceci', 'e', J), /ya salió/);
  assert.throws(() => aplicarLetra(r.partida, titulo, 'ceci', '3', J), /no es una letra/);

  r = aplicarLetra(r.partida, titulo, 'ceci', 'z', J);
  assert.equal(r.partida.errores, 1);

  const mal = aplicarArriesgo(r.partida, titulo, 'juan', 'elvia', J);
  assert.deepEqual(mal.fin, { ganadorId: 'ceci' });
  const bien = aplicarArriesgo(r.partida, titulo, 'juan', ' élvis ', J);
  assert.deepEqual(bien.fin, { ganadorId: 'juan' });
  assert.equal(bien.partida.titulo, 'Elvis', 'al terminar se revela');

  // Completarlo letra por letra gana.
  let p = r.partida;
  for (const l of ['l', 'v', 'i']) p = aplicarLetra(p, titulo, p.turno, l, J).partida;
  const fin = aplicarLetra(p, titulo, p.turno, 's', J);
  assert.equal(fin.fin?.ganadorId, p.turno);

  // Seis errores compartidos: nadie, lo define la moneda.
  let q = partida;
  for (const l of ['a', 'b', 'c', 'd', 'f', 'g']) {
    const paso = aplicarLetra(q, titulo, q.turno, l, J);
    q = paso.partida;
    if (l === 'g') assert.deepEqual(paso.fin, { ganadorId: null });
    else assert.equal(paso.fin, undefined);
  }
});

test('wordle: las pistas cuentan cada letra una sola vez', () => {
  assert.deepEqual(puntuar('llave', 'calle'), ['casi', 'casi', 'casi', 'no', 'bien']);
  assert.deepEqual(puntuar('calle', 'calle'), ['bien', 'bien', 'bien', 'bien', 'bien']);
  assert.deepEqual(puntuar('aaaaa', 'abcda'), ['bien', 'no', 'no', 'no', 'bien']);
  assert.deepEqual(puntuar('xxxxa', 'abcde'), ['no', 'no', 'no', 'no', 'casi']);
});

test('wordle: la lista', () => {
  assert.ok(OBJETIVOS.length >= 500);
  assert.ok(OBJETIVOS.every((p) => /^[a-zñ]{5}$/.test(p)));
  assert.ok(OBJETIVOS.every(esValida), 'todo objetivo es un intento válido');
  assert.equal(esValida('zzzzz'), false);
  assert.equal(esValida('calle'), true);
});

test('wordle: menos intentos gana, y termina en cuanto se sabe', () => {
  const { partida, palabra } = iniciarWordle(azarSemilla(3));
  const otra = OBJETIVOS.find((p) => p !== palabra)!;

  assert.throws(() => aplicarIntento(partida, palabra, 'juan', 'abc', J), /cinco letras/);
  assert.throws(() => aplicarIntento(partida, palabra, 'juan', 'zzzzz', J), /no está en la lista/);

  // Juan la saca al primer intento. Ceci todavía no jugó: podría empatar, sigue.
  let r = aplicarIntento(partida, palabra, 'juan', palabra.toUpperCase(), J);
  assert.equal(r.partida.resultado.juan, 'acerto');
  assert.equal(r.fin, undefined);
  assert.throws(() => aplicarIntento(r.partida, palabra, 'juan', otra, J), /Ya terminaste/);

  // Ceci falla una: ya no puede igualar el 1 de Juan.
  r = aplicarIntento(r.partida, palabra, 'ceci', otra, J);
  assert.deepEqual(r.fin, { ganadorId: 'juan' });
  assert.equal(r.partida.palabra, palabra, 'al terminar se revela');

  // Los dos en dos intentos: empate.
  let q = aplicarIntento(partida, palabra, 'juan', otra, J).partida;
  q = aplicarIntento(q, palabra, 'ceci', otra, J).partida;
  q = aplicarIntento(q, palabra, 'juan', palabra, J).partida;
  const fin = aplicarIntento(q, palabra, 'ceci', palabra, J);
  assert.deepEqual(fin.fin, { ganadorId: null });

  // Seis fallos es «fallo»; si el otro también falla, moneda.
  let f = partida;
  for (let i = 0; i < 6; i++) f = aplicarIntento(f, palabra, 'juan', otra, J).partida;
  assert.equal(f.resultado.juan, 'fallo');
  for (let i = 0; i < 5; i++) f = aplicarIntento(f, palabra, 'ceci', otra, J).partida;
  const ultimo = aplicarIntento(f, palabra, 'ceci', otra, J);
  assert.deepEqual(ultimo.fin, { ganadorId: null });
});

test('indice: iniciar, jugar, moneda y validación de jugadas', () => {
  const ctx = {
    jugadores: J,
    empieza: 'ceci',
    fichas,
    titulos: fichas.map((f) => ({ titulo: f.titulo, anio: f.anio, genero: null })),
  };
  const azar = azarSemilla(11);

  const moneda = iniciarPartida('moneda', ctx, azar);
  assert.ok(moneda.fin && J.includes(moneda.fin.ganadorId));

  const ppt = iniciarPartida('ppt', ctx, azar);
  const r = aplicarJugada(ppt.partida, ppt.secreto, 'juan', { juego: 'ppt', jugada: 'piedra' }, J);
  assert.equal(r.secreto.ppt?.juan, 'piedra');
  assert.throws(
    () => aplicarJugada(ppt.partida, ppt.secreto, 'juan', { juego: 'wordle', intento: 'calle' }, J),
    /no es de este juego/,
  );

  const sinVistas = { ...ctx, fichas: [], titulos: [] };
  assert.throws(() => iniciarPartida('memoria', sinVistas, azar), /pelis vistas/);
  assert.throws(() => iniciarPartida('ahorcado', sinVistas, azar), /peli vista/);

  assert.equal(esJugadaValida({ juego: 'ppt', jugada: 'papel' }), true);
  assert.equal(esJugadaValida({ juego: 'ppt', jugada: 'lagarto' }), false);
  assert.equal(esJugadaValida({ juego: 'memoria', carta: 3 }), true);
  assert.equal(esJugadaValida({ juego: 'memoria', carta: '3' }), false);
  assert.equal(esJugadaValida({ juego: 'ahorcado', letra: 'a' }), true);
  assert.equal(esJugadaValida({ juego: 'ahorcado', arriesgo: 'Elvis' }), true);
  assert.equal(esJugadaValida({ juego: 'wordle', intento: 'calle' }), true);
  assert.equal(esJugadaValida(null), false);
});
