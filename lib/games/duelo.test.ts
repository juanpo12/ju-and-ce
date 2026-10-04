import { test } from 'node:test';
import assert from 'node:assert/strict';
import duelo, { MAX_DELAY_MS, MIN_DELAY_MS, type DueloMatch, type DueloMove } from './duelo';
import { seededRng } from './random';

const P: [string, string] = ['juan', 'ceci'];
const ctx = { players: P, starter: 'juan', cards: [], titles: [], library: [], names: {} };
const rng = seededRng(7);

type State = { match: DueloMatch; secret: Record<string, unknown> };
const shoot = (s: State, me: string, move: Omit<DueloMove, 'game'>) =>
  duelo.apply({ match: s.match, secret: s.secret as never, me, move: { game: 'duelo', ...move }, players: P, rng, now: 0 });

test('duelo: shots stay hidden, the faster one takes the round, a new delay comes', () => {
  const s = duelo.start(ctx, rng, 0);
  assert.ok(s.match.delayMs >= MIN_DELAY_MS && s.match.delayMs <= MAX_DELAY_MS);

  let r = shoot(s, 'juan', { reactionMs: 310 });
  assert.deepEqual(r.match.drawn, ['juan']);
  assert.equal(JSON.stringify(r.match).includes('310'), false, 'the time is not public yet');
  assert.throws(() => shoot(r, 'juan', { reactionMs: 200 }), /Ya disparaste/);

  r = shoot(r, 'ceci', { reactionMs: 280 });
  assert.equal(r.match.rounds[0]!.winner, 'ceci');
  assert.equal(r.match.score.ceci, 1);
  assert.deepEqual(r.match.drawn, []);
  assert.deepEqual(r.secret, {});
});

test('duelo: drawing early loses, both early or a dead heat is replayed', () => {
  const s = duelo.start(ctx, rng, 0);
  let r = shoot(shoot(s, 'juan', { early: true }), 'ceci', { reactionMs: 900 });
  assert.equal(r.match.rounds[0]!.winner, 'ceci');

  r = shoot(shoot(r, 'juan', { early: true }), 'ceci', { early: true });
  assert.equal(r.match.rounds[1]!.winner, null);

  r = shoot(shoot(r, 'juan', { reactionMs: 250 }), 'ceci', { reactionMs: 250 });
  assert.equal(r.match.rounds[2]!.winner, null);
  assert.equal(r.match.score.ceci, 1);
  assert.equal(r.match.score.juan, 0);

  // Too fast to be a reaction: early.
  r = shoot(shoot(r, 'juan', { reactionMs: 40 }), 'ceci', { reactionMs: 400 });
  assert.equal(r.match.rounds[3]!.winner, 'ceci');
  assert.deepEqual(r.match.rounds[3]!.shots.juan, { early: true });
});

test('duelo: out of range times are rejected, first to 3 wins', () => {
  let s: State = duelo.start(ctx, rng, 0);
  assert.throws(() => shoot(s, 'juan', { reactionMs: 5001 }), /no es válido/);
  assert.throws(() => shoot(s, 'juan', { reactionMs: -3 }), /no es válido/);
  assert.equal(duelo.isValidMove({ game: 'duelo', reactionMs: 1.5 }), false);
  assert.equal(duelo.isValidMove({ game: 'duelo', early: true }), true);

  let end;
  for (let i = 0; i < 3; i++) {
    const r = shoot(shoot(s, 'juan', { reactionMs: 200 }), 'ceci', { reactionMs: 500 });
    s = r;
    end = r.end;
  }
  assert.deepEqual(end, { winnerId: 'juan' });
});
