import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seededRng } from './random';
import { placeFleet, startBattleship, applyShot, BOARD_SIZE, SHIPS } from './battleship';

const P: [string, string] = ['juan', 'ceci'];

test('battleship: fleets are placed inside the grid, in line, without overlapping', () => {
  for (let seed = 1; seed < 40; seed++) {
    const fleet = placeFleet(BOARD_SIZE, SHIPS, seededRng(seed));
    assert.deepEqual(fleet.map((s) => s.length), SHIPS);
    const all = fleet.flat();
    assert.equal(new Set(all).size, all.length, 'no overlap');
    assert.ok(all.every((c) => c >= 0 && c < BOARD_SIZE * BOARD_SIZE), 'in bounds');
    for (const ship of fleet) {
      const rows = ship.map((c) => Math.floor(c / BOARD_SIZE));
      const cols = ship.map((c) => c % BOARD_SIZE);
      const horizontal = new Set(rows).size === 1 && cols.every((c, i) => i === 0 || c === cols[i - 1]! + 1);
      const vertical = new Set(cols).size === 1 && rows.every((r, i) => i === 0 || r === rows[i - 1]! + 1);
      assert.ok(horizontal || vertical, 'ships are straight and contiguous');
    }
  }
});

test('battleship: miss passes the turn, hit keeps it, sinking everything wins', () => {
  const { match, fleets } = startBattleship(P, 'juan', seededRng(3));
  assert.equal(match.turn, 'juan');
  assert.throws(() => applyShot(match, fleets, 'ceci', 0, P), /No es tu turno/);
  assert.throws(() => applyShot(match, fleets, 'juan', 99, P), /no existe/);

  const ceciCells = new Set(fleets.ceci!.flat());
  const water = Array.from({ length: 36 }, (_, i) => i).find((i) => !ceciCells.has(i))!;

  let r = applyShot(match, fleets, 'juan', water, P);
  assert.equal(r.match.shots.juan![0]!.hit, false);
  assert.equal(r.match.turn, 'ceci', 'a miss passes the turn');
  assert.throws(() => applyShot({ ...r.match, turn: 'juan' }, fleets, 'juan', water, P), /Ya tiraste/);

  // Ceci sinks Juan's whole fleet, shot by shot: every hit keeps her turn.
  let m = r.match;
  let end: { winnerId: string } | undefined;
  for (const ship of fleets.juan!) {
    for (const cell of ship) {
      assert.equal(m.turn, 'ceci');
      const step = applyShot(m, fleets, 'ceci', cell, P);
      m = step.match;
      end = step.end;
    }
  }
  assert.equal(m.sunk.ceci, SHIPS.length);
  assert.deepEqual(end, { winnerId: 'ceci' });
  assert.deepEqual(m.fleets, fleets, 'fleets are revealed at the end');
});
