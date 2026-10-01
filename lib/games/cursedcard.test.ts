import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seededRng } from './random';
import { startCursedCard, applyFlip } from './cursedcard';

const P: [string, string] = ['juan', 'ceci'];

test('cursed card: turns, safe flips, and the cursed one loses', () => {
  const { match, cursed } = startCursedCard('juan', seededRng(3));
  assert.equal(match.cards, 12);
  assert.ok(cursed >= 0 && cursed < 12);
  assert.equal(match.cursed, undefined, 'the cursed one is not public');

  assert.throws(() => applyFlip(match, cursed, 'ceci', 0, P), /No es tu turno/);
  assert.throws(() => applyFlip(match, cursed, 'juan', 12, P), /no existe/);

  const safe = cursed === 0 ? 1 : 0;
  let r = applyFlip(match, cursed, 'juan', safe, P);
  assert.equal(r.end, undefined);
  assert.equal(r.match.turn, 'ceci');
  assert.deepEqual(r.match.flipped, [{ card: safe, by: 'juan' }]);
  assert.throws(() => applyFlip(r.match, cursed, 'ceci', safe, P), /ya está dada vuelta/);

  r = applyFlip(r.match, cursed, 'ceci', cursed, P);
  assert.deepEqual(r.end, { winnerId: 'juan' }, 'whoever flips the cursed card loses');
  assert.equal(r.match.cursed, cursed, 'revealed at the end');
});
