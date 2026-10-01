import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startNim, applyTake } from './nim';

const P: [string, string] = ['juan', 'ceci'];

test('nim: take from one row, turns alternate, bad moves are rejected', () => {
  let m = startNim('juan');
  assert.deepEqual(m.rows, [3, 5, 7]);
  assert.throws(() => applyTake(m, 'ceci', 0, 1, P), /No es tu turno/);
  assert.throws(() => applyTake(m, 'juan', 3, 1, P), /no existe/);
  assert.throws(() => applyTake(m, 'juan', 0, 0, P), /al menos uno/);
  assert.throws(() => applyTake(m, 'juan', 0, 4, P), /tantos/);

  m = applyTake(m, 'juan', 2, 7, P).match;
  assert.deepEqual(m.rows, [3, 5, 0]);
  assert.deepEqual(m.last, { by: 'juan', row: 2, count: 7 });
  assert.equal(m.turn, 'ceci');
});

test('nim: whoever takes the last match loses', () => {
  let m = startNim('juan');
  m = applyTake(m, 'juan', 2, 7, P).match;
  m = applyTake(m, 'ceci', 1, 5, P).match;
  m = applyTake(m, 'juan', 0, 2, P).match;
  const r = applyTake(m, 'ceci', 0, 1, P);
  assert.deepEqual(r.match.rows, [0, 0, 0]);
  assert.deepEqual(r.end, { winnerId: 'juan' });
});
