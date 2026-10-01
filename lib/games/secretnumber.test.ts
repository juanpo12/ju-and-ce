import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startSecretNumber, applyPick } from './secretnumber';

const P: [string, string] = ['juan', 'ceci'];

test('secret number: picks stay hidden, closer to the target wins', () => {
  const match = startSecretNumber();
  assert.equal(match.max, 100);

  assert.throws(() => applyPick(match, {}, 'juan', 0, P, { int: () => 0 }), /del 1 al 100/);
  assert.throws(() => applyPick(match, {}, 'juan', 2.5, P, { int: () => 0 }), /del 1 al 100/);

  let r = applyPick(match, {}, 'juan', 30, P, { int: () => 0 });
  assert.deepEqual(r.match.picked, ['juan']);
  assert.equal(r.match.picks, undefined, 'the pick is not public yet');
  assert.equal(r.picks.juan, 30, 'but the secret has it');
  assert.throws(() => applyPick(r.match, r.picks, 'juan', 40, P, { int: () => 0 }), /Ya elegiste/);

  // Target 50 (int(100) + 1): Ceci at 60 is 10 away, Juan at 30 is 20 away.
  r = applyPick(r.match, r.picks, 'ceci', 60, P, { int: () => 49 });
  assert.equal(r.match.target, 50);
  assert.deepEqual(r.match.picks, { juan: 30, ceci: 60 }, 'revealed at the end');
  assert.deepEqual(r.end, { winnerId: 'ceci' });

  // Same distance: tie.
  const first = applyPick(match, {}, 'juan', 40, P, { int: () => 0 });
  const tie = applyPick(first.match, first.picks, 'ceci', 60, P, { int: () => 49 });
  assert.deepEqual(tie.end, { winnerId: null });
});
