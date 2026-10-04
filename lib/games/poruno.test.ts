import { test } from 'node:test';
import assert from 'node:assert/strict';
import poruno, { scoreRound, type PorunoMatch } from './poruno';
import { seededRng } from './random';

const P: [string, string] = ['juan', 'ceci'];
const ctx = { players: P, starter: 'juan', cards: [], titles: [], library: [], names: {} };
const rng = seededRng(1);

type State = { match: PorunoMatch; secret: Record<string, number> };
const play = (s: State, me: string, pick: number) =>
  poruno.apply({ match: s.match, secret: s.secret, me, move: { game: 'poruno', pick }, players: P, rng, now: 0 });
const round = (s: State, a: number, b: number) => play(play(s, 'juan', a), 'ceci', b);

test('poruno: one below steals both, otherwise each keeps their own', () => {
  assert.deepEqual(scoreRound(P, { juan: 4, ceci: 5 }), { points: { juan: 9, ceci: 0 }, undercut: 'juan' });
  assert.deepEqual(scoreRound(P, { juan: 3, ceci: 2 }), { points: { ceci: 5, juan: 0 }, undercut: 'ceci' });
  assert.deepEqual(scoreRound(P, { juan: 5, ceci: 2 }), { points: { juan: 5, ceci: 2 }, undercut: null });
  assert.deepEqual(scoreRound(P, { juan: 3, ceci: 3 }), { points: { juan: 3, ceci: 3 }, undercut: null });
});

test('poruno: the pick stays hidden until both are in', () => {
  const s = poruno.start(ctx, rng, 0);
  const r = play(s, 'juan', 5);
  assert.deepEqual(r.match.chosen, ['juan']);
  assert.equal(JSON.stringify(r.match).includes('"juan":5'), false, 'the pick is not public yet');
  assert.throws(() => play(r, 'juan', 4), /Ya elegiste/);
  assert.throws(() => play(s, 'juan', 6), /del 1 al 5/);
  assert.throws(() => play(s, 'juan', 0), /del 1 al 5/);
  const done = play(r, 'ceci', 4);
  assert.deepEqual(done.secret, {});
  assert.equal(done.match.score.ceci, 9);
});

test('poruno: first to 25 wins', () => {
  let s: State = poruno.start(ctx, rng, 0);
  let end;
  while (!end) {
    const r = round(s, 4, 5); // juan undercuts every round: 9 a round
    s = r;
    end = r.end;
  }
  assert.deepEqual(end, { winnerId: 'juan' });
  assert.equal(s.match.rounds.length, 3);
  assert.equal(s.match.score.juan, 27);
});

test('poruno: after 10 rounds the higher score wins, equal is a tie', () => {
  let s: State = poruno.start(ctx, rng, 0);
  let end;
  for (let i = 0; i < 10; i++) {
    const r = round(s, 1, 1);
    s = r;
    end = r.end;
    if (i < 9) assert.equal(end, undefined);
  }
  assert.deepEqual(end, { winnerId: null });
  assert.equal(poruno.isValidMove({ game: 'poruno', pick: 2.5 }), false);
});
