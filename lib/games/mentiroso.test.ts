import { test } from 'node:test';
import assert from 'node:assert/strict';
import mentiroso, { matching, raises, type MentirosoMatch, type MentirosoMove } from './mentiroso';
import type { Rng } from './random';

const P: [string, string] = ['juan', 'ceci'];
const ctx = { players: P, starter: 'juan', cards: [], titles: [], library: [], names: {} };
const dice = (...values: number[]): Rng => {
  let i = 0;
  return { int: () => values[i++ % values.length]! - 1 };
};

/** A move without its `game`, per variant. */
type Body<T> = T extends unknown ? Omit<T, 'game'> : never;

type State = { match: MentirosoMatch; secret: { dice: Record<string, number[]> }; end?: { winnerId: string | null } };
const play = (s: State, me: string, move: Body<MentirosoMove>, rng: Rng = dice(2)) =>
  mentiroso.apply({ match: s.match, secret: s.secret, me, move: { game: 'mentiroso', ...move } as MentirosoMove, players: P, rng, now: 0 });

test('mentiroso: wild ones, raising, and nothing public about the dice', () => {
  assert.equal(matching([1, 1, 3, 3, 5], 3), 4);
  assert.equal(matching([1, 1, 3, 3, 5], 1), 2);
  assert.equal(raises(undefined, 1, 2), true);
  assert.equal(raises({ by: 'x', qty: 3, face: 4 }, 3, 5), true);
  assert.equal(raises({ by: 'x', qty: 3, face: 4 }, 3, 4), false);
  assert.equal(raises({ by: 'x', qty: 3, face: 4 }, 4, 2), true);

  const s = mentiroso.start(ctx, dice(1, 3, 3, 5, 6, 2, 2, 2, 4, 1), 0);
  assert.deepEqual(s.secret.dice.juan, [1, 3, 3, 5, 6]);
  assert.equal(JSON.stringify(s.match).includes('dice'), false, 'no dice in the public match');
  assert.deepEqual(mentiroso.privateView!({ match: s.match, secret: s.secret, me: 'ceci' }), [1, 2, 2, 2, 4]);
  assert.deepEqual(mentiroso.privateView!({ match: s.match, secret: s.secret, me: 'juan' }), [1, 3, 3, 5, 6]);
});

test('mentiroso: bids by turns, a call reveals and someone loses a die', () => {
  // juan: 1 3 3 5 6 · ceci: 1 2 2 2 4 → threes on the table: 2 + two wild ones = 4.
  let s: State = mentiroso.start(ctx, dice(1, 3, 3, 5, 6, 2, 2, 2, 4, 1), 0);
  assert.throws(() => play(s, 'ceci', { action: 'call' }), /No es tu turno/);
  assert.throws(() => play(s, 'juan', { action: 'call' }), /no hay apuesta/);
  assert.throws(() => play(s, 'juan', { action: 'bid', qty: 11, face: 3 }), /Entre 1 y 10/);

  s = play(s, 'juan', { action: 'bid', qty: 3, face: 3 });
  assert.equal(s.match.turn, 'ceci');
  assert.throws(() => play(s, 'ceci', { action: 'bid', qty: 3, face: 2 }), /Tenés que subir/);
  s = play(s, 'ceci', { action: 'bid', qty: 4, face: 3 });

  // Juan calls: there are exactly 4 threes, the bid holds, Juan loses a die.
  const r = play(s, 'juan', { action: 'call' }, dice(6));
  assert.equal(r.match.counts.juan, 4);
  assert.equal(r.match.counts.ceci, 5);
  assert.equal(r.match.reveals[0]!.matched, 4);
  assert.equal(r.match.reveals[0]!.loser, 'juan');
  assert.deepEqual(r.match.reveals[0]!.dice.ceci, [1, 2, 2, 2, 4], 'revealed in the history');
  assert.equal(r.match.turn, 'juan', 'the loser opens');
  assert.equal(r.match.round, 2);
  assert.deepEqual(r.match.bids, []);
  assert.equal(r.secret.dice.juan!.length, 4);

  // Instead Juan raises to four fours: one four plus two wild ones is 3, so
  // when Ceci calls, the liar is Juan.
  const lie = play(play(s, 'juan', { action: 'bid', qty: 4, face: 4 }), 'ceci', { action: 'call' });
  assert.equal(lie.match.reveals[0]!.matched, 3);
  assert.equal(lie.match.reveals[0]!.loser, 'juan');
  assert.equal(lie.match.turn, 'juan');
});

test('mentiroso: out of dice, out of the game', () => {
  let s: State = mentiroso.start(ctx, dice(2), 0);
  for (let i = 0; i < 5; i++) {
    // Every die is a 2: «ten sixes» is always a lie, and Ceci keeps calling it.
    s = play(s, s.match.turn, { action: 'bid', qty: s.match.counts.juan! + s.match.counts.ceci!, face: 6 });
    s = play(s, s.match.turn, { action: 'call' });
    if (s.end) break;
  }
  assert.ok(s.end);
  assert.equal(s.match.counts[s.end!.winnerId === 'juan' ? 'ceci' : 'juan'], 0);
  assert.equal(mentiroso.isValidMove({ game: 'mentiroso', action: 'bid', qty: 1.5, face: 2 }), false);
});
