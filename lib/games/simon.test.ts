import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seededRng } from './random';
import { startSimon, applySimonInput } from './simon';

const P: [string, string] = ['juan', 'ceci'];

test('simon: climbing levels, slipping, and settling early', () => {
  const match = startSimon(P, seededRng(4));
  assert.equal(match.sequence.length, 12);
  assert.ok(match.sequence.every((c) => c >= 0 && c < 4));
  const seq = match.sequence;

  // Juan climbs two levels, then slips.
  let m = applySimonInput(match, 'juan', seq.slice(0, 1), P).match;
  assert.equal(m.runs.juan!.reached, 1);
  m = applySimonInput(m, 'juan', seq.slice(0, 2), P).match;
  assert.equal(m.runs.juan!.reached, 2);
  let r = applySimonInput(m, 'juan', [seq[0]!, (seq[1]! + 1) % 4, seq[2]!], P);
  m = r.match;
  assert.equal(m.runs.juan!.done, true);
  assert.equal(m.runs.juan!.reached, 2);
  assert.equal(r.end, undefined, 'Ceci can still beat 2');
  assert.throws(() => applySimonInput(m, 'juan', seq.slice(0, 1), P), /ya terminó/);

  // Too short an input does not count either.
  const short = applySimonInput(match, 'ceci', [], P);
  assert.equal(short.match.runs.ceci!.done, true);

  // Ceci passes level 3: she already beats Juan, no need to go on.
  for (let level = 1; level <= 2; level++) m = applySimonInput(m, 'ceci', seq.slice(0, level), P).match;
  r = applySimonInput(m, 'ceci', seq.slice(0, 3), P);
  assert.deepEqual(r.end, { winnerId: 'ceci' });

  // Both slip at the same level: tie.
  let t = applySimonInput(match, 'juan', [9], P).match;
  const tie = applySimonInput(t, 'ceci', [9], P);
  assert.deepEqual(tie.end, { winnerId: null });

  // Finishing the whole sequence is done with the maximum.
  let full = match;
  for (let level = 1; level <= 12; level++) full = applySimonInput(full, 'juan', seq.slice(0, level), P).match;
  assert.equal(full.runs.juan!.reached, 12);
  assert.equal(full.runs.juan!.done, true);
});
