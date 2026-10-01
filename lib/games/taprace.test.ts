import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startTapRace, applyTapCount } from './taprace';

const P: [string, string] = ['juan', 'ceci'];

test('tap race: one count each, more taps wins, equal is a tie', () => {
  const match = startTapRace();
  assert.equal(match.seconds, 10);

  assert.throws(() => applyTapCount(match, 'juan', -1, P), /no es válido/);
  assert.throws(() => applyTapCount(match, 'juan', 9999, P), /no es válido/);

  let r = applyTapCount(match, 'juan', 61, P);
  assert.equal(r.end, undefined);
  assert.throws(() => applyTapCount(r.match, 'juan', 70, P), /Ya corriste/);

  r = applyTapCount(r.match, 'ceci', 58, P);
  assert.deepEqual(r.end, { winnerId: 'juan' });

  const tie = applyTapCount(applyTapCount(match, 'juan', 40, P).match, 'ceci', 40, P);
  assert.deepEqual(tie.end, { winnerId: null });
});
