import { test } from 'node:test';
import assert from 'node:assert/strict';
import anagrama, { MAX_MISSES, normalize, type AnagramaMatch, type AnagramaMove } from './anagrama';
import { seededRng } from './random';

const P: [string, string] = ['juan', 'ceci'];
const ctx = { players: P, starter: 'juan', cards: [], titles: [], library: [], names: {} };
const rng = seededRng(11);

type State = { match: AnagramaMatch; secret: { word: string; used: string[] } };
const move = (s: State, me: string, m: Omit<AnagramaMove, 'game'>) =>
  anagrama.apply({ match: s.match, secret: s.secret, me, move: { game: 'anagrama', ...m }, players: P, rng, now: 0 });

test('anagrama: the letters are public and scrambled, the word is not', () => {
  const s = anagrama.start(ctx, rng, 0);
  assert.notEqual(s.match.letters, s.secret.word);
  assert.equal([...s.match.letters].sort().join(''), [...s.secret.word].sort().join(''));
  assert.equal(JSON.stringify(s.match).includes(`"${s.secret.word}"`), false);
  assert.equal(normalize(' CORAZÓN '), 'corazon');
  assert.equal(normalize('Señor'), 'señor');
});

test('anagrama: wrong guesses count, the right one takes the round and deals a new word', () => {
  const s = anagrama.start(ctx, rng, 0);
  assert.throws(() => move(s, 'juan', { guess: 'ab' }), /letras/);

  let r = move(s, 'juan', { guess: 'zzzzz' });
  assert.equal(r.match.misses.juan, 1);
  const word = s.secret.word;
  r = move(r, 'ceci', { guess: word.toUpperCase() });
  assert.equal(r.match.rounds[0]!.winner, 'ceci');
  assert.equal(r.match.rounds[0]!.word, word);
  assert.equal(r.match.score.ceci, 1);
  assert.deepEqual(r.match.misses, { juan: 0, ceci: 0 });
  assert.notEqual(r.secret.word, word);
});

test('anagrama: miss limit, both passing voids the round, first to 3 wins', () => {
  let s: State = anagrama.start(ctx, rng, 0);
  for (let i = 0; i < MAX_MISSES; i++) s = move(s, 'juan', { guess: 'zzzzz' });
  assert.throws(() => move(s, 'juan', { guess: 'zzzzz' }), /sin intentos/);

  let r = move(s, 'juan', { pass: true });
  assert.throws(() => move(r, 'juan', { pass: true }), /Ya pasaste/);
  r = move(r, 'ceci', { pass: true });
  assert.equal(r.match.rounds[0]!.winner, null);
  assert.equal(r.match.score.juan, 0);

  s = r;
  let end;
  for (let i = 0; i < 3; i++) {
    const n = move(s, 'juan', { guess: s.secret.word });
    s = n;
    end = n.end;
  }
  assert.deepEqual(end, { winnerId: 'juan' });
  assert.equal(anagrama.isValidMove({ game: 'anagrama', guess: 'x'.repeat(30) }), false);
});
