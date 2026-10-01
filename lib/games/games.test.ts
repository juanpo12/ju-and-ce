/**
 * The game logic, with no database and no browser:
 *
 *   npm run games:test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seededRng } from './random';
import { rpsWinner, startRps, applyRps } from './rps';
import { pairCount, startMemory, applyMemory } from './memory';
import { normalize, mask, isEligible, startHangman, applyLetter, applyGuess } from './hangman';
import { score, applyAttempt, startWordle } from './wordle';
import { applyMove, startMatch, isValidMove } from './index';
import { TARGETS, isValidWord } from './words';
import type { Card } from '@/lib/movie-night';

const P: [string, string] = ['juan', 'ceci'];

const cards: Card[] = Array.from({ length: 8 }, (_, i) => ({
  entryId: `e${i}`,
  title: `Peli ${i}`,
  year: 2000 + i,
  posterPath: null,
}));

test('rps: who beats whom', () => {
  assert.equal(rpsWinner('rock', 'scissors'), 'a');
  assert.equal(rpsWinner('scissors', 'paper'), 'a');
  assert.equal(rpsWinner('paper', 'rock'), 'a');
  assert.equal(rpsWinner('rock', 'paper'), 'b');
  assert.equal(rpsWinner('paper', 'paper'), 'tie');
});

test('rps: the throw stays hidden until both chose, best of 3', () => {
  let m = startRps(P);
  let s = {};
  let r = applyRps(m, s, 'juan', 'rock', P);
  assert.deepEqual(r.match.chosen, ['juan']);
  assert.equal(r.match.rounds.length, 0, 'nothing public yet');
  assert.equal(r.secret.juan, 'rock', 'the secret has it');
  assert.throws(() => applyRps(r.match, r.secret, 'juan', 'paper', P), /Ya elegiste/);

  r = applyRps(r.match, r.secret, 'ceci', 'scissors', P);
  assert.equal(r.match.rounds[0]!.winner, 'juan');
  assert.deepEqual(r.secret, {}, 'round settled, secret cleared');
  assert.equal(r.end, undefined);
  ({ match: m, secret: s } = r);

  r = applyRps(m, s, 'juan', 'paper', P);
  r = applyRps(r.match, r.secret, 'ceci', 'paper', P);
  assert.equal(r.match.rounds[1]!.winner, null, 'a tie is recorded and replayed');

  r = applyRps(r.match, r.secret, 'ceci', 'paper', P);
  r = applyRps(r.match, r.secret, 'juan', 'scissors', P);
  assert.deepEqual(r.end, { winnerId: 'juan' });
  assert.equal(r.match.score.juan, 2);
});

test('memory: odd pairs, turns and the end', () => {
  assert.equal(pairCount(3), 3);
  assert.equal(pairCount(4), 3);
  assert.equal(pairCount(6), 5);
  assert.equal(pairCount(20), 7);

  const { match, board } = startMemory(cards, P, 'juan', seededRng(7));
  assert.equal(board.length, 14);
  assert.equal(match.totalPairs, 7);

  // Juan flips one, it shows; the second is another movie: both hide, turn passes.
  const another = board.findIndex((c) => c.entryId !== board[0]!.entryId);
  let r = applyMemory(match, board, 'juan', 0, P);
  assert.equal(r.match.cards[0]!.faceUp?.entryId, board[0]!.entryId);
  assert.throws(() => applyMemory(r.match, board, 'ceci', 1, P), /No es tu turno/);
  r = applyMemory(r.match, board, 'juan', another, P);
  assert.equal(r.match.cards[0]!.faceUp, null);
  assert.equal(r.match.turn, 'ceci');
  assert.equal(r.match.lastMove?.hit, false);
  assert.equal(r.match.lastMove?.n, 1);

  // Ceci matches a pair: she goes on.
  const pair = board.findIndex((c, i) => i !== 0 && c.entryId === board[0]!.entryId);
  r = applyMemory(r.match, board, 'ceci', 0, P);
  r = applyMemory(r.match, board, 'ceci', pair, P);
  assert.equal(r.match.cards[pair]!.ownedBy, 'ceci');
  assert.equal(r.match.turn, 'ceci');
  assert.equal(r.match.pairs.ceci, 1);
  assert.throws(() => applyMemory(r.match, board, 'ceci', pair, P), /ya está dada vuelta/);

  // Ceci takes every remaining pair: it ends and she wins.
  let m = r.match;
  for (let i = 0; i < board.length; i++) {
    if (m.cards[i]!.ownedBy) continue;
    const j = board.findIndex((c, k) => k > i && !m.cards[k]!.ownedBy && c.entryId === board[i]!.entryId);
    m = applyMemory(m, board, 'ceci', i, P).match;
    const end = applyMemory(m, board, 'ceci', j, P);
    m = end.match;
    if (end.end) {
      assert.deepEqual(end.end, { winnerId: 'ceci' });
      assert.equal(m.pairs.ceci, 7);
      return;
    }
  }
  assert.fail('should have ended');
});

test('hangman: mask, letters, misses and guess', () => {
  assert.equal(normalize('Anatomía de una caída'), 'ANATOMIA DE UNA CAIDA');
  assert.equal(mask('La La Land', new Set(['L'])), 'L_ L_ L___');
  assert.equal(isEligible('Up'), false, 'too short');
  assert.equal(isEligible('千と千尋の神隠し'), false, 'cannot be typed on the keyboard');
  assert.equal(isEligible('Parásitos'), true);

  const { match, title } = startHangman(
    [{ title: 'Elvis', year: 2022, genre: 'Drama' }],
    'juan',
    seededRng(1),
  );
  assert.equal(title, 'Elvis');
  assert.equal(match.mask, '_____');
  assert.equal(match.hint, '2022 · Drama');

  let r = applyLetter(match, title, 'juan', 'e', P);
  assert.equal(r.match.mask, 'E____');
  assert.equal(r.match.turn, 'ceci');
  assert.throws(() => applyLetter(r.match, title, 'juan', 'l', P), /No es tu turno/);
  assert.throws(() => applyLetter(r.match, title, 'ceci', 'e', P), /ya salió/);
  assert.throws(() => applyLetter(r.match, title, 'ceci', '3', P), /no es una letra/);

  r = applyLetter(r.match, title, 'ceci', 'z', P);
  assert.equal(r.match.misses, 1);

  const wrong = applyGuess(r.match, title, 'juan', 'elvia', P);
  assert.deepEqual(wrong.end, { winnerId: 'ceci' });
  const right = applyGuess(r.match, title, 'juan', ' élvis ', P);
  assert.deepEqual(right.end, { winnerId: 'juan' });
  assert.equal(right.match.title, 'Elvis', 'revealed at the end');

  // Completing it letter by letter wins.
  let m = r.match;
  for (const l of ['l', 'v', 'i']) m = applyLetter(m, title, m.turn, l, P).match;
  const end = applyLetter(m, title, m.turn, 's', P);
  assert.equal(end.end?.winnerId, m.turn);

  // Six shared misses: nobody, the coin settles it.
  let q = match;
  for (const l of ['a', 'b', 'c', 'd', 'f', 'g']) {
    const step = applyLetter(q, title, q.turn, l, P);
    q = step.match;
    if (l === 'g') assert.deepEqual(step.end, { winnerId: null });
    else assert.equal(step.end, undefined);
  }
});

test('wordle: hints count each letter only once', () => {
  assert.deepEqual(score('llave', 'calle'), ['near', 'near', 'near', 'miss', 'hit']);
  assert.deepEqual(score('calle', 'calle'), ['hit', 'hit', 'hit', 'hit', 'hit']);
  assert.deepEqual(score('aaaaa', 'abcda'), ['hit', 'miss', 'miss', 'miss', 'hit']);
  assert.deepEqual(score('xxxxa', 'abcde'), ['miss', 'miss', 'miss', 'miss', 'near']);
});

test('wordle: the list', () => {
  assert.ok(TARGETS.length >= 500);
  assert.ok(TARGETS.every((w) => /^[a-zñ]{5}$/.test(w)));
  assert.ok(TARGETS.every(isValidWord), 'every target is a valid attempt');
  assert.equal(isValidWord('zzzzz'), false);
  assert.equal(isValidWord('calle'), true);
});

test('wordle: fewest attempts wins, and it ends as soon as it is known', () => {
  const { match, word } = startWordle(seededRng(3));
  const other = TARGETS.find((w) => w !== word)!;

  assert.throws(() => applyAttempt(match, word, 'juan', 'abc', P), /cinco letras/);
  assert.throws(() => applyAttempt(match, word, 'juan', 'zzzzz', P), /no está en la lista/);

  // Juan solves it on the first try. Ceci has not played: she could tie, go on.
  let r = applyAttempt(match, word, 'juan', word.toUpperCase(), P);
  assert.equal(r.match.result.juan, 'solved');
  assert.equal(r.end, undefined);
  assert.throws(() => applyAttempt(r.match, word, 'juan', other, P), /Ya terminaste/);

  // Ceci misses one: she can no longer match Juan's 1.
  r = applyAttempt(r.match, word, 'ceci', other, P);
  assert.deepEqual(r.end, { winnerId: 'juan' });
  assert.equal(r.match.word, word, 'revealed at the end');

  // Both in two attempts: tie.
  let q = applyAttempt(match, word, 'juan', other, P).match;
  q = applyAttempt(q, word, 'ceci', other, P).match;
  q = applyAttempt(q, word, 'juan', word, P).match;
  const end = applyAttempt(q, word, 'ceci', word, P);
  assert.deepEqual(end.end, { winnerId: null });

  // Six misses is "failed"; if the other fails too, coin.
  let f = match;
  for (let i = 0; i < 6; i++) f = applyAttempt(f, word, 'juan', other, P).match;
  assert.equal(f.result.juan, 'failed');
  for (let i = 0; i < 5; i++) f = applyAttempt(f, word, 'ceci', other, P).match;
  const last = applyAttempt(f, word, 'ceci', other, P);
  assert.deepEqual(last.end, { winnerId: null });
});

test('index: start, play, coin and move validation', () => {
  const ctx = {
    players: P,
    starter: 'ceci',
    cards,
    titles: cards.map((c) => ({ title: c.title, year: c.year, genre: null })),
  };
  const rng = seededRng(11);

  const coin = startMatch('moneda', ctx, rng);
  assert.ok(coin.end && P.includes(coin.end.winnerId));

  const rps = startMatch('ppt', ctx, rng);
  const r = applyMove(rps.match, rps.secret, 'juan', { game: 'ppt', throw: 'rock' }, P);
  assert.equal(r.secret.rps?.juan, 'rock');
  assert.throws(
    () => applyMove(rps.match, rps.secret, 'juan', { game: 'wordle', attempt: 'calle' }, P),
    /no es de este juego/,
  );

  const nothingWatched = { ...ctx, cards: [], titles: [] };
  assert.throws(() => startMatch('memoria', nothingWatched, rng), /pelis vistas/);
  assert.throws(() => startMatch('ahorcado', nothingWatched, rng), /peli vista/);

  assert.equal(isValidMove({ game: 'ppt', throw: 'paper' }), true);
  assert.equal(isValidMove({ game: 'ppt', throw: 'lizard' }), false);
  assert.equal(isValidMove({ game: 'memoria', card: 3 }), true);
  assert.equal(isValidMove({ game: 'memoria', card: '3' }), false);
  assert.equal(isValidMove({ game: 'ahorcado', letter: 'a' }), true);
  assert.equal(isValidMove({ game: 'ahorcado', guess: 'Elvis' }), true);
  assert.equal(isValidMove({ game: 'wordle', attempt: 'calle' }), true);
  assert.equal(isValidMove(null), false);
});
