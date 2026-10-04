import { test } from 'node:test';
import assert from 'node:assert/strict';
import cinco, { type CincoMatch } from './cinco';
import { seededRng } from './random';

const P: [string, string] = ['juan', 'ceci'];
const ctx = { players: P, starter: 'ceci', cards: [], titles: [], library: [], names: {} };
const rng = seededRng(1);
const play = (match: CincoMatch, me: string, cell: number) =>
  cinco.apply({ match, secret: null, me, move: { game: 'cinco', cell }, players: P, rng, now: 0 });

test('cinco: turns, occupied cells, and five in a diagonal win', () => {
  let { match } = cinco.start(ctx, rng, 0);
  assert.equal(match.size, 11);
  assert.equal(match.turn, 'ceci');
  assert.throws(() => play(match, 'juan', 0), /No es tu turno/);
  assert.throws(() => play(match, 'ceci', 121), /no existe/);

  const n = match.size;
  let end;
  for (let i = 0; i < 5 && !end; i++) {
    const r = play(match, 'ceci', i * n + i);
    match = r.match;
    end = r.end;
    if (end) break;
    assert.throws(() => play(match, 'juan', i * n + i), /ocupada/);
    match = play(match, 'juan', i * n + 10).match;
  }
  assert.deepEqual(end, { winnerId: 'ceci' });
  assert.deepEqual(match.line, [0, 12, 24, 36, 48]);
  assert.equal(match.last, 48);
});

test('cinco: four is not enough, a full board is a tie', () => {
  let { match } = cinco.start(ctx, rng, 0);
  for (let i = 0; i < 4; i++) {
    match = play(match, 'ceci', i).match;
    match = play(match, 'juan', 50 + i).match;
  }
  assert.equal(match.line, undefined);

  const size = 3;
  const cells: (string | null)[] = ['juan', 'ceci', 'juan', 'ceci', 'juan', 'ceci', 'ceci', 'juan', null];
  const r = play({ game: 'cinco', size, cells, turn: 'juan' }, 'juan', 8);
  assert.deepEqual(r.end, { winnerId: null });
});
