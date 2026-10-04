import { test } from 'node:test';
import assert from 'node:assert/strict';
import robar, { splitPot, ROBAR_POTS, type RobarChoice, type RobarMatch } from './robar';
import { seededRng } from './random';

const P: [string, string] = ['juan', 'ceci'];
const ctx = { players: P, starter: 'juan', cards: [], titles: [], library: [], names: {} };
const rng = seededRng(1);

type State = { match: RobarMatch; secret: Record<string, RobarChoice> };
const play = (s: State, me: string, choice: RobarChoice) =>
  robar.apply({ match: s.match, secret: s.secret, me, move: { game: 'robar', choice }, players: P, rng, now: 0 });
const round = (s: State, a: RobarChoice, b: RobarChoice) => play(play(s, 'juan', a), 'ceci', b);

test('robar: sharing splits rounding up, a lone steal takes all, two steals burn it', () => {
  assert.equal(splitPot(5, 'share', 'share'), 3);
  assert.equal(splitPot(5, 'steal', 'share'), 5);
  assert.equal(splitPot(5, 'share', 'steal'), 0);
  assert.equal(splitPot(5, 'steal', 'steal'), 0);
});

test('robar: the choice stays hidden until both are in', () => {
  const s = robar.start(ctx, rng, 0);
  const r = play(s, 'juan', 'steal');
  assert.equal(JSON.stringify(r.match).includes('steal'), false);
  assert.throws(() => play(r, 'juan', 'share'), /Ya elegiste/);
  const done = play(r, 'ceci', 'share');
  assert.deepEqual(done.match.rounds[0]!.points, { juan: 2, ceci: 0 });
  assert.deepEqual(done.secret, {});
  assert.equal(robar.isValidMove({ game: 'robar', choice: 'both' }), false);
});

test('robar: after five pots the higher score wins, equal is a tie', () => {
  let s: State = robar.start(ctx, rng, 0);
  let end;
  for (let i = 0; i < ROBAR_POTS.length; i++) {
    const r = round(s, 'share', 'share');
    s = r;
    end = r.end;
  }
  assert.deepEqual(end, { winnerId: null });
  assert.equal(s.match.score.juan, 1 + 2 + 2 + 3 + 4);

  s = robar.start(ctx, rng, 0);
  for (let i = 0; i < ROBAR_POTS.length; i++) {
    const r = round(s, i === 4 ? 'steal' : 'share', 'share');
    s = r;
    end = r.end;
  }
  assert.deepEqual(end, { winnerId: 'juan' });
  assert.throws(() => play(s, 'juan', 'share'), /terminó/);
});
