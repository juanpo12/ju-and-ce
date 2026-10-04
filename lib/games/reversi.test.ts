import { test } from 'node:test';
import assert from 'node:assert/strict';
import reversi, { flipsFor, legalMoves, type ReversiMatch } from './reversi';
import { seededRng } from './random';

const P: [string, string] = ['juan', 'ceci'];
const ctx = { players: P, starter: 'juan', cards: [], titles: [], library: [], names: {} };
const rng = seededRng(1);
const play = (match: ReversiMatch, me: string, cell: number) =>
  reversi.apply({ match, secret: null, me, move: { game: 'reversi', cell }, players: P, rng, now: 0 });

test('reversi: the opening, flips and turns', () => {
  const { match } = reversi.start(ctx, rng, 0);
  assert.equal(match.cells.filter(Boolean).length, 4);
  assert.equal(match.turn, 'juan');
  assert.deepEqual(legalMoves(match.cells, 8, 'juan').length, 4);

  assert.throws(() => play(match, 'ceci', 19), /No es tu turno/);
  assert.throws(() => play(match, 'juan', 0), /no da vuelta/);
  assert.throws(() => play(match, 'juan', 27), /ocupada/);

  // Juan owns 28 and 35; ceci 27 and 36. Playing 26 (row 3, col 2) flips 27.
  assert.deepEqual(flipsFor(match.cells, 8, 26, 'juan'), [27]);
  const r = play(match, 'juan', 26);
  assert.equal(r.match.cells[27], 'juan');
  assert.deepEqual(r.match.last, { by: 'juan', cell: 26, flipped: [27] });
  assert.equal(r.match.turn, 'ceci');
  assert.equal(r.end, undefined);
});

test('reversi: a player without moves passes, and a full stop counts discs', () => {
  // Row 0: juan, ceci, empty — juan can play 2, ceci has no move afterwards.
  const size = 8;
  const cells: (string | null)[] = Array(size * size).fill(null);
  cells[0] = 'juan';
  cells[1] = 'ceci';
  const match: ReversiMatch = { game: 'reversi', size, cells, turn: 'juan' };
  const r = play(match, 'juan', 2);
  assert.equal(r.match.cells[1], 'juan');
  assert.deepEqual(r.end, { winnerId: 'juan' });

  // A pass: juan plays, ceci cannot answer, juan keeps the turn.
  const c2: (string | null)[] = Array(size * size).fill(null);
  c2[0] = 'juan';
  c2[1] = 'ceci';
  c2[8] = 'ceci';
  const m2: ReversiMatch = { game: 'reversi', size, cells: c2, turn: 'juan' };
  const r2 = play(m2, 'juan', 2);
  assert.equal(r2.end, undefined);
  assert.equal(r2.match.turn, 'juan');
  assert.equal(r2.match.passed, 'ceci');
});

test('reversi: equal discs at the end is a tie', () => {
  const size = 8;
  const cells: (string | null)[] = Array(size * size).fill(null);
  // After juan plays 2 flipping 1: juan 0,1,2 vs ceci 10,11,12 isolated → no moves for either.
  cells[0] = 'juan';
  cells[1] = 'ceci';
  cells[61] = 'ceci';
  cells[62] = 'ceci';
  const r = play({ game: 'reversi', size, cells, turn: 'juan' }, 'juan', 2);
  // juan: 0,1,2 = 3; ceci: 61,62 = 2 → juan wins; add one more ceci to tie.
  assert.deepEqual(r.end, { winnerId: 'juan' });
  const tied = [...cells];
  tied[63] = 'ceci';
  const r2 = play({ game: 'reversi', size, cells: tied, turn: 'juan' }, 'juan', 2);
  assert.deepEqual(r2.end, { winnerId: null });
  assert.equal(reversi.isValidMove({ game: 'reversi', cell: 1.5 }), false);
});
