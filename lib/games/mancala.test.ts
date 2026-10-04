import { test } from 'node:test';
import assert from 'node:assert/strict';
import mancala, { type MancalaMatch } from './mancala';
import { seededRng } from './random';

const P: [string, string] = ['juan', 'ceci'];
const ctx = { players: P, starter: 'juan', cards: [], titles: [], library: [], names: {} };
const rng = seededRng(1);
const play = (match: MancalaMatch, me: string, pit: number) =>
  mancala.apply({ match, secret: null, me, move: { game: 'mancala', pit }, players: P, rng, now: 0 });

test('mancala: sowing, the extra turn and the rules on the pit', () => {
  const { match } = mancala.start(ctx, rng, 0);
  assert.deepEqual(match.pits.juan, [4, 4, 4, 4, 4, 4]);
  assert.throws(() => play(match, 'ceci', 0), /No es tu turno/);
  assert.throws(() => play(match, 'juan', 6), /no existe/);

  // Pit 2 has 4 seeds: 3, 4, 5 and the store → another turn.
  const r = play(match, 'juan', 2);
  assert.deepEqual(r.match.pits.juan, [4, 4, 0, 5, 5, 5]);
  assert.equal(r.match.stores.juan, 1);
  assert.equal(r.match.turn, 'juan');
  assert.equal(r.match.last?.extra, true);
  assert.throws(() => play(r.match, 'juan', 2), /vacío/);

  // Pit 0: 1, 2, 3, 4 → turn passes.
  const r2 = play(r.match, 'juan', 0);
  assert.deepEqual(r2.match.pits.juan, [0, 5, 1, 6, 6, 5]);
  assert.equal(r2.match.turn, 'ceci');
});

test('mancala: sowing goes around into the other side, skipping their store', () => {
  const match: MancalaMatch = {
    game: 'mancala',
    pits: { juan: [0, 0, 1, 0, 0, 10], ceci: [1, 1, 1, 1, 1, 1] },
    stores: { juan: 0, ceci: 0 },
    turn: 'juan',
  };
  const r = play(match, 'juan', 5);
  // 1 to the store, 6 to ceci's pits, skip ceci's store, 3 back to juan 0–2
  // (pit 2 was not empty, so no capture).
  assert.equal(r.match.stores.juan, 1);
  assert.equal(r.match.stores.ceci, 0);
  assert.deepEqual(r.match.pits.ceci, [2, 2, 2, 2, 2, 2]);
  assert.deepEqual(r.match.pits.juan, [1, 1, 2, 0, 0, 0]);
});

test('mancala: landing in an empty pit of yours captures the pit across', () => {
  const match: MancalaMatch = {
    game: 'mancala',
    pits: { juan: [1, 0, 3, 0, 0, 2], ceci: [2, 2, 2, 2, 7, 2] },
    stores: { juan: 0, ceci: 0 },
    turn: 'juan',
  };
  const r = play(match, 'juan', 0); // lands in pit 1, empty; across is ceci pit 4 (7 seeds)
  assert.equal(r.match.last?.captured, 8);
  assert.equal(r.match.stores.juan, 8);
  assert.equal(r.match.pits.juan?.[1], 0);
  assert.equal(r.match.pits.ceci?.[4], 0);
  assert.equal(r.match.turn, 'ceci');
});

test('mancala: an empty side ends it, the rest sweeps home, equal stores tie', () => {
  const match: MancalaMatch = {
    game: 'mancala',
    pits: { juan: [0, 0, 0, 0, 0, 1], ceci: [0, 0, 0, 3, 0, 0] },
    stores: { juan: 10, ceci: 9 },
    turn: 'juan',
  };
  const r = play(match, 'juan', 5); // into the store; juan's side is empty
  assert.deepEqual(r.match.swept, { juan: 0, ceci: 3 });
  assert.deepEqual(r.match.stores, { juan: 11, ceci: 12 });
  assert.deepEqual(r.end, { winnerId: 'ceci' });

  const tie = play({ ...match, stores: { juan: 10, ceci: 8 } }, 'juan', 5);
  assert.deepEqual(tie.end, { winnerId: null });
});
