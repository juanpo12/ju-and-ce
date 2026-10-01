import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startBoxes, applyEdge } from './boxes';

const P: [string, string] = ['juan', 'ceci'];

test('boxes: edges alternate turns, bad moves are rejected', () => {
  let m = startBoxes('juan', P);
  assert.equal(m.horizontal.length, 12);
  assert.equal(m.vertical.length, 12);
  assert.equal(m.boxes.length, 9);
  assert.throws(() => applyEdge(m, 'ceci', 'h', 0, P), /No es tu turno/);
  assert.throws(() => applyEdge(m, 'juan', 'h', 12, P), /no existe/);
  m = applyEdge(m, 'juan', 'h', 0, P).match;
  assert.equal(m.horizontal[0], 'juan');
  assert.equal(m.turn, 'ceci');
  assert.throws(() => applyEdge(m, 'ceci', 'h', 0, P), /ya está dibujada/);
});

test('boxes: closing a box scores it and keeps the turn', () => {
  let m = startBoxes('juan', P);
  // Box (0,0): top h0, bottom h3, left v0, right v1.
  m = applyEdge(m, 'juan', 'h', 0, P).match;
  m = applyEdge(m, 'ceci', 'h', 3, P).match;
  m = applyEdge(m, 'juan', 'v', 0, P).match;
  assert.equal(m.turn, 'ceci');
  const r = applyEdge(m, 'ceci', 'v', 1, P);
  assert.equal(r.match.boxes[0], 'ceci');
  assert.equal(r.match.score.ceci, 1);
  assert.equal(r.match.turn, 'ceci', 'closing a box means going again');
  assert.equal(r.end, undefined);
});

test('boxes: when every box is closed the higher score wins', () => {
  let m = startBoxes('juan', P);
  let end: { winnerId: string } | undefined;
  // Draw every edge in order; whoever is on turn draws. Closing keeps the turn.
  const edges: ['h' | 'v', number][] = [
    ...Array.from({ length: 12 }, (_, i): ['h' | 'v', number] => ['h', i]),
    ...Array.from({ length: 12 }, (_, i): ['h' | 'v', number] => ['v', i]),
  ];
  for (const [edge, index] of edges) {
    const r = applyEdge(m, m.turn, edge, index, P);
    m = r.match;
    if (r.end) {
      end = r.end;
      break;
    }
  }
  assert.ok(end, 'the match ends');
  assert.ok(m.boxes.every(Boolean));
  const [a, b] = P;
  assert.equal((m.score[a] ?? 0) + (m.score[b] ?? 0), 9);
  assert.equal(end!.winnerId, (m.score[a] ?? 0) > (m.score[b] ?? 0) ? a : b);
});
