import { test } from 'node:test';
import assert from 'node:assert/strict';
import colores, { cards, MAX_SCORE, type ColoresMatch } from './colores';
import { seededRng } from './random';

const P: [string, string] = ['juan', 'ceci'];
const ctx = { players: P, starter: 'juan', cards: [], titles: [], library: [], names: {} };
const rng = seededRng(3);

type State = { match: ColoresMatch; secret: Record<string, number> };
const report = (s: State, me: string, score: number) =>
  colores.apply({ match: s.match, secret: s.secret, me, move: { game: 'colores', score }, players: P, rng, now: 0 });

test('colores: the same seed makes the same cards, and the ink never matches the word', () => {
  const s = colores.start(ctx, rng, 0);
  const a = cards(s.match.seed, 60);
  assert.deepEqual(a, cards(s.match.seed, 60));
  assert.ok(a.every((c) => c.word !== c.ink));
  assert.notDeepEqual(a, cards(s.match.seed + 1, 60));
});

test('colores: one report each, hidden until both, higher wins, equal ties', () => {
  const s = colores.start(ctx, rng, 0);
  assert.throws(() => report(s, 'juan', -1), /no es válido/);
  assert.throws(() => report(s, 'juan', MAX_SCORE + 1), /no es válido/);

  let r = report(s, 'juan', 17);
  assert.equal(r.end, undefined);
  assert.equal(r.match.scores, undefined);
  assert.throws(() => report(r, 'juan', 20), /Ya jugaste/);

  r = report(r, 'ceci', 21);
  assert.deepEqual(r.end, { winnerId: 'ceci' });
  assert.deepEqual(r.match.scores, { juan: 17, ceci: 21 });

  const tie = report(report(s, 'juan', 9), 'ceci', 9);
  assert.deepEqual(tie.end, { winnerId: null });
  assert.equal(colores.isValidMove({ game: 'colores', score: 3.2 }), false);
});
