import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startConnectFour, applyDrop, lineThrough, COLS } from './connectfour';

const P: [string, string] = ['juan', 'ceci'];

test('connect four: pieces fall, turns alternate, bad moves are rejected', () => {
  let m = startConnectFour('juan');
  assert.throws(() => applyDrop(m, 'ceci', 0, P), /No es tu turno/);
  assert.throws(() => applyDrop(m, 'juan', 7, P), /no existe/);
  m = applyDrop(m, 'juan', 3, P).match;
  assert.equal(m.cells[5 * COLS + 3], 'juan', 'lands on the bottom row');
  assert.equal(m.turn, 'ceci');
  m = applyDrop(m, 'ceci', 3, P).match;
  assert.equal(m.cells[4 * COLS + 3], 'ceci', 'stacks on top');

  for (let i = 0; i < 4; i++) m = applyDrop(m, m.turn, 3, P).match;
  assert.throws(() => applyDrop(m, m.turn, 3, P), /llena/);
});

test('connect four: a horizontal line wins', () => {
  let m = startConnectFour('juan');
  for (const col of [0, 0, 1, 1, 2, 2]) m = applyDrop(m, m.turn, col, P).match;
  const r = applyDrop(m, 'juan', 3, P);
  assert.deepEqual(r.end, { winnerId: 'juan' });
  assert.deepEqual(r.match.line, [35, 36, 37, 38]);
});

test('connect four: a diagonal line wins', () => {
  let m = startConnectFour('juan');
  // Juan builds the rising diagonal from column 0; Ceci fills under it.
  const moves: [string, number][] = [
    ['juan', 0],
    ['ceci', 1],
    ['juan', 1],
    ['ceci', 2],
    ['juan', 2],
    ['ceci', 3],
    ['juan', 2],
    ['ceci', 3],
    ['juan', 3],
    ['ceci', 0],
  ];
  for (const [who, col] of moves) m = applyDrop(m, who, col, P).match;
  const r = applyDrop(m, 'juan', 3, P);
  assert.deepEqual(r.end, { winnerId: 'juan' });
  assert.equal(r.match.line?.length, 4);
});

test('connect four: a full board with no line is a tie', () => {
  // Rows top to bottom, a full board with no four anywhere (found by search, verified below).
  const pattern = ['OOXXXOX', 'XXXOXOO', 'OOXXOOX', 'XXOOOXO', 'OOXXOXX', 'XOXOXOO'].join('');
  const cells: (string | null)[] = [...pattern].map((c) => (c === 'X' ? 'juan' : 'ceci'));
  const full = { ...startConnectFour('juan'), cells };
  for (let i = 0; i < cells.length; i++) assert.equal(lineThrough(full, i), null, `no line through ${i}`);

  // Leave the top-right hole empty and let its owner fill it: board full, nobody wins.
  const almost = [...cells];
  const owner = almost[6]!;
  almost[6] = null;
  const m = { ...startConnectFour(owner), cells: almost };
  const r = applyDrop(m, owner, 6, P);
  assert.deepEqual(r.end, { winnerId: null });
  assert.ok(r.match.cells.every(Boolean));
});
