import { test } from 'node:test';
import assert from 'node:assert/strict';
import generala, { points, total, type GeneralaMatch, type GeneralaMove } from './generala';
import type { Rng } from './random';

const P: [string, string] = ['juan', 'ceci'];
const ctx = { players: P, starter: 'juan', cards: [], titles: [], library: [], names: {} };

/** Dice come out in the given order. */
const dice = (...values: number[]): Rng => {
  let i = 0;
  return { int: () => values[i++ % values.length]! - 1 };
};

/** A move without its `game`, per variant. */
type Body<T> = T extends unknown ? Omit<T, 'game'> : never;

type State = { match: GeneralaMatch; secret: null; end?: { winnerId: string | null } };
const play = (s: State, me: string, move: Body<GeneralaMove>, rng: Rng = dice(1)) =>
  generala.apply({ match: s.match, secret: null, me, move: { game: 'generala', ...move } as GeneralaMove, players: P, rng, now: 0 });
const NONE = [false, false, false, false, false];

test('generala: points per category, served bonuses and the doble rule', () => {
  assert.equal(points([3, 3, 3, 1, 2], 'c3', false, {}), 9);
  assert.equal(points([3, 3, 3, 1, 2], 'c6', false, {}), 0);
  assert.equal(points([1, 2, 3, 4, 5], 'escalera', false, {}), 20);
  assert.equal(points([6, 5, 4, 3, 2], 'escalera', true, {}), 25);
  assert.equal(points([1, 3, 4, 5, 6], 'escalera', false, {}), 20);
  assert.equal(points([1, 2, 3, 4, 6], 'escalera', false, {}), 0);
  assert.equal(points([2, 2, 5, 5, 5], 'full', false, {}), 30);
  assert.equal(points([2, 2, 5, 5, 5], 'full', true, {}), 35);
  assert.equal(points([5, 5, 5, 5, 5], 'full', false, {}), 0);
  assert.equal(points([4, 4, 4, 4, 1], 'poker', false, {}), 40);
  assert.equal(points([4, 4, 4, 4, 4], 'poker', true, {}), 45);
  assert.equal(points([4, 4, 4, 4, 4], 'generala', false, {}), 50);
  assert.equal(points([4, 4, 4, 4, 4], 'doble', false, {}), 0, 'no doble before a generala');
  assert.equal(points([4, 4, 4, 4, 4], 'doble', false, { generala: 50 }), 100);
  assert.equal(points([4, 4, 4, 4, 4], 'doble', false, { generala: 0 }), 0, 'a scratched generala does not count');
  assert.equal(total({ c1: 3, full: 30 }), 33);
});

test('generala: rolls, holds, turns and scoring', () => {
  let s: State = generala.start(ctx, dice(1), 0);
  assert.throws(() => play(s, 'ceci', { action: 'roll', hold: NONE }), /No es tu turno/);
  assert.throws(() => play(s, 'juan', { action: 'score', category: 'c1' }), /Primero tirá/);

  s = play(s, 'juan', { action: 'roll', hold: NONE }, dice(2, 2, 3, 5, 6));
  assert.deepEqual(s.match.dice, [2, 2, 3, 5, 6]);
  s = play(s, 'juan', { action: 'roll', hold: [true, true, false, false, false] }, dice(2, 4, 4));
  assert.deepEqual(s.match.dice, [2, 2, 2, 4, 4]);
  assert.throws(() => play(s, 'juan', { action: 'roll', hold: [true, true, true, true, true] }), /Soltá algún dado/);
  s = play(s, 'juan', { action: 'roll', hold: [true, true, true, true, true].map((_, i) => i < 4) }, dice(4));
  assert.throws(() => play(s, 'juan', { action: 'roll', hold: NONE }), /tres veces/);

  s = play(s, 'juan', { action: 'score', category: 'full' });
  assert.equal(s.match.sheets.juan!.full, 30, 'not served: third roll');
  assert.equal(s.match.turn, 'ceci');
  assert.deepEqual(s.match.dice, []);
  assert.deepEqual(s.match.last, { by: 'juan', category: 'full', points: 30 });

  s = play(s, 'ceci', { action: 'roll', hold: NONE }, dice(1, 2, 3, 4, 5));
  s = play(s, 'ceci', { action: 'score', category: 'escalera' });
  assert.equal(s.match.sheets.ceci!.escalera, 25, 'served straight');

  s = play(s, 'juan', { action: 'roll', hold: NONE }, dice(1, 1, 2, 3, 4));
  assert.throws(() => play(s, 'juan', { action: 'score', category: 'full' }), /ya la anotaste/);
});

test('generala: servida wins on the spot', () => {
  const s = play(generala.start(ctx, dice(1), 0), 'juan', { action: 'roll', hold: NONE }, dice(6, 6, 6, 6, 6));
  assert.deepEqual(s.end, { winnerId: 'juan' });
  assert.equal(s.match.servida, 'juan');
});

test('generala: after eleven turns each, more points wins; equal is a tie', () => {
  const run = (juanFaces: number, ceciFaces: number) => {
    let s: State = generala.start(ctx, dice(1), 0);
    const cats = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'escalera', 'full', 'poker', 'generala', 'doble'] as const;
    for (const cat of cats) {
      for (const [who, face] of [['juan', juanFaces], ['ceci', ceciFaces]] as const) {
        // Never a generala: four of a kind plus one.
        s = play(s, who, { action: 'roll', hold: NONE }, dice(face, face, face, face, face === 6 ? 5 : face + 1));
        s = play(s, who, { action: 'score', category: cat });
      }
    }
    return s;
  };
  assert.deepEqual(run(3, 2).end, { winnerId: 'juan' });
  assert.deepEqual(run(2, 2).end, { winnerId: null });
  assert.equal(generala.isValidMove({ game: 'generala', action: 'score', category: 'nope' }), false);
  assert.equal(generala.isValidMove({ game: 'generala', action: 'roll', hold: [true] }), false);
});
