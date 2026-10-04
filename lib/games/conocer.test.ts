import { test } from 'node:test';
import assert from 'node:assert/strict';
import conocer, { type ConocerMatch } from './conocer';
import { seededRng } from './random';

const P: [string, string] = ['juan', 'ceci'];
const ctx = { players: P, starter: 'juan', cards: [], titles: [], library: [], names: {} };
const rng = seededRng(3);
type State = { match: ConocerMatch; secret: { picks: Record<string, number>; used: number[] }; end?: { winnerId: string | null } };

const pick = (s: State, me: string, choice: number): State =>
  conocer.apply({ match: s.match, secret: s.secret, me, move: { game: 'conocer', choice }, players: P, rng, now: 0 });

test('conocer: choices stay hidden until both are in, and a match is a point for the guesser', () => {
  let s: State = conocer.start(ctx, rng, 0);
  const r0 = s.match.rounds[0]!;
  assert.equal(r0.guesser, 'juan');
  assert.equal(r0.subject, 'ceci');
  assert.equal(r0.options.length, 4);

  s = pick(s, 'ceci', 2);
  assert.deepEqual(s.match.rounds[0]!.chosen, ['ceci']);
  assert.equal(s.match.rounds[0]!.answer, undefined, 'not revealed yet');
  assert.throws(() => pick(s, 'ceci', 1), /Ya elegiste/);
  assert.throws(() => pick(s, 'juan', 4), /no existe/);

  s = pick(s, 'juan', 2);
  assert.equal(s.match.rounds[0]!.answer, 2);
  assert.equal(s.match.rounds[0]!.guess, 2);
  assert.deepEqual(s.match.score, { juan: 1, ceci: 0 });
  assert.deepEqual(s.secret.picks, {});
  const r1 = s.match.rounds[1]!;
  assert.equal(r1.guesser, 'ceci', 'roles alternate');
  assert.notEqual(r1.question, r0.question);
});

test('conocer: six rounds, each guesses three times, ties are ties', () => {
  let s: State = conocer.start(ctx, rng, 0);
  const guesses: Record<string, number> = { juan: 0, ceci: 0 };
  for (let i = 0; i < 6; i++) {
    const r = s.match.rounds[i]!;
    guesses[r.guesser]!++;
    // Juan always guesses right, Ceci only on her first two.
    const right = r.guesser === 'juan' || guesses.ceci! <= 2;
    s = pick(pick(s, r.subject, 1), r.guesser, right ? 1 : 0);
  }
  assert.deepEqual(guesses, { juan: 3, ceci: 3 });
  assert.deepEqual(s.match.score, { juan: 3, ceci: 2 });
  assert.deepEqual(s.end, { winnerId: 'juan' });
  assert.equal(new Set(s.match.rounds.map((r) => r.question)).size, 6);

  let t: State = conocer.start(ctx, rng, 0);
  for (let i = 0; i < 6; i++) {
    const r = t.match.rounds[i]!;
    t = pick(pick(t, r.subject, 0), r.guesser, 0);
  }
  assert.deepEqual(t.end, { winnerId: null });
  assert.equal(conocer.isValidMove({ game: 'conocer', choice: 1.5 }), false);
  assert.equal(conocer.isValidMove({ game: 'conocer', choice: 3 }), true);
});
