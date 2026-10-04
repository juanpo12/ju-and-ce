import { test } from 'node:test';
import assert from 'node:assert/strict';
import pares, { type ParesMatch } from './pares';
import { seededRng } from './random';

const P: [string, string] = ['juan', 'ceci'];
const ctx = { players: P, starter: 'juan', cards: [], titles: [], library: [], names: {} };
const rng = seededRng(1);

type State = { match: ParesMatch; secret: Record<string, number> };

function play(state: State, me: string, fingers: number) {
  return pares.apply({ match: state.match, secret: state.secret, me, move: { game: 'pares', fingers }, players: P, rng, now: 0 });
}

test('pares: hands stay hidden until both show, the sum decides, «pares» alternates', () => {
  let s = pares.start(ctx, rng, 0);
  assert.equal(s.match.even, 'juan');

  let r = play(s, 'juan', 2);
  assert.deepEqual(r.match.chosen, ['juan']);
  assert.equal(r.match.rounds.length, 0);
  assert.equal(JSON.stringify(r.match).includes('"juan":2'), false, 'the hand is not public yet');
  assert.throws(() => play(r, 'juan', 3), /Ya mostraste/);

  r = play(r, 'ceci', 4); // 6: even → juan
  assert.equal(r.match.rounds[0]!.winner, 'juan');
  assert.equal(r.match.even, 'ceci');
  assert.deepEqual(r.secret, {});

  r = play(play(r, 'juan', 1), 'ceci', 1); // 2: even → ceci has pares now
  assert.equal(r.match.rounds[1]!.winner, 'ceci');
});

test('pares: first to 3, and fingers out of range are rejected', () => {
  let s: State = pares.start(ctx, rng, 0);
  assert.throws(() => play(s, 'juan', 6), /Entre 0 y 5/);
  let end;
  for (let i = 0; i < 9 && !end; i++) {
    // Juan always makes the sum fit whoever has «pares»… when it is him.
    const juanEven = s.match.even === 'juan';
    const r = play(play(s, 'juan', juanEven ? 0 : 1), 'ceci', 0);
    s = r;
    end = r.end;
  }
  assert.deepEqual(end, { winnerId: 'juan' });
  assert.equal(s.match.score.juan, 3);
  assert.equal(pares.isValidMove({ game: 'pares', fingers: 2.5 }), false);
});
