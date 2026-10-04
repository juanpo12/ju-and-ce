import { test } from 'node:test';
import assert from 'node:assert/strict';
import dibujo, { normalize, ROUND_SECONDS, type DibujoMatch, type DibujoMove } from './dibujo';
import { seededRng } from './random';

const P: [string, string] = ['juan', 'ceci'];
const ctx = { players: P, starter: 'juan', cards: [], titles: [], library: [], names: {} };
const rng = seededRng(7);
type State = { match: DibujoMatch; secret: { word: string; used: number[] }; end?: { winnerId: string | null } };

const mv = (s: State, me: string, move: Omit<DibujoMove, 'game'>, now = 0): State =>
  dibujo.apply({ match: s.match, secret: s.secret, me, move: { game: 'dibujo', ...move } as DibujoMove, players: P, rng, now });

const stroke = { color: 'tinta' as const, width: 6, points: [10, 10, 500, 500] };

test('dibujo: only the drawer sees the word, draws after beginning, and the guesser cannot draw', () => {
  let s: State = dibujo.start(ctx, rng, 0);
  const round = s.match.rounds[0]!;
  assert.equal(round.drawer, 'juan');
  assert.equal(dibujo.privateView!({ match: s.match, secret: s.secret, me: 'juan' }), s.secret.word);
  assert.equal(dibujo.privateView!({ match: s.match, secret: s.secret, me: 'ceci' }), null);
  assert.equal(JSON.stringify(s.match).includes(s.secret.word), false, 'the word is not public');

  assert.throws(() => mv(s, 'juan', { stroke }), /Empezar/);
  assert.throws(() => mv(s, 'ceci', { begin: true }), /Empieza quien dibuja/);
  s = mv(s, 'juan', { begin: true }, 1000);
  s = mv(s, 'juan', { stroke }, 2000);
  s = mv(s, 'juan', { stroke }, 2500);
  assert.equal(s.match.rounds[0]!.strokes.length, 2);
  s = mv(s, 'juan', { undo: true }, 2600);
  assert.equal(s.match.rounds[0]!.strokes.length, 1);
  assert.throws(() => mv(s, 'ceci', { stroke }, 3000), /dibuja la otra/);
  assert.throws(() => mv(s, 'juan', { guess: 'algo' }, 3000), /no adivina/);
});

test('dibujo: a fast right guess scores 3 + 2, ignores accents, and the roles swap', () => {
  let s: State = dibujo.start(ctx, rng, 0);
  s = mv(s, 'juan', { begin: true }, 0);
  s = mv(s, 'ceci', { guess: 'nada que ver' }, 1000);
  assert.equal(s.match.rounds.length, 1);
  const word = s.secret.word;
  s = mv(s, 'ceci', { guess: `  ¡${word.toUpperCase()}!  ` }, 5000);
  const done = s.match.rounds[0]!;
  assert.deepEqual(done.result, { word, guessed: true, points: { ceci: 3, juan: 2 } });
  assert.deepEqual(s.match.score, { juan: 2, ceci: 3 });
  const next = s.match.rounds[1]!;
  assert.equal(next.drawer, 'ceci');
  assert.notEqual(s.secret.word, word, 'a fresh word');
  assert.equal(normalize('Pingüino'), 'pinguino');
});

test('dibujo: timeout only after the clock, slow guesses score less, and the end compares totals', () => {
  let s: State = dibujo.start(ctx, rng, 0);
  s = mv(s, 'juan', { begin: true }, 0);
  assert.throws(() => mv(s, 'ceci', { timeout: true }, 10_000), /queda tiempo/);
  const late = ROUND_SECONDS * 1000 + 1;
  assert.throws(() => mv(s, 'ceci', { guess: s.secret.word }, late), /terminó el tiempo/);
  s = mv(s, 'ceci', { timeout: true }, late);
  assert.equal(s.match.rounds[0]!.result!.guessed, false);
  assert.deepEqual(s.match.score, { juan: 0, ceci: 0 });

  // Round 2: Ceci draws, Juan guesses in the last third (1 point).
  s = mv(s, 'ceci', { begin: true }, 0);
  s = mv(s, 'juan', { guess: s.secret.word }, 70_000);
  assert.deepEqual(s.match.score, { juan: 1, ceci: 2 });
  // Round 3: Juan draws, Ceci guesses in the middle third (2 points).
  s = mv(s, 'juan', { begin: true }, 0);
  s = mv(s, 'ceci', { guess: s.secret.word }, 40_000);
  assert.deepEqual(s.match.score, { juan: 3, ceci: 4 });
  // Round 4: Ceci draws, Juan guesses fast (3): 6 to 6 → tie.
  s = mv(s, 'ceci', { begin: true }, 0);
  s = mv(s, 'juan', { guess: s.secret.word }, 1000);
  assert.deepEqual(s.match.score, { juan: 6, ceci: 6 });
  assert.deepEqual(s.end, { winnerId: null });
  assert.equal(new Set(s.match.rounds.map((r) => r.result!.word)).size, 4, 'no repeated words');
});

test('dibujo: move shapes are checked strictly', () => {
  const ok = (m: Record<string, unknown>) => dibujo.isValidMove({ game: 'dibujo', ...m });
  assert.equal(ok({ stroke }), true);
  assert.equal(ok({ stroke: { ...stroke, color: '#ff0000' } }), false);
  assert.equal(ok({ stroke: { ...stroke, points: [1, 2, 3] } }), false);
  assert.equal(ok({ stroke: { ...stroke, points: [1, 2000] } }), false);
  assert.equal(ok({ stroke: { ...stroke, width: 500 } }), false);
  assert.equal(ok({ stroke: { ...stroke, points: Array(400).fill(1) } }), false);
  assert.equal(ok({ guess: 'gato' }), true);
  assert.equal(ok({ timeout: true }), true);
  assert.equal(ok({ begin: true, guess: 'x' }), false);
});
