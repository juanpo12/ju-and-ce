import { test } from 'node:test';
import assert from 'node:assert/strict';
import subasta, { type SubastaMatch } from './subasta';
import { seededRng } from './random';

const P: [string, string] = ['juan', 'ceci'];
const ctx = { players: P, starter: 'juan', cards: [], titles: [], library: [], names: {} };
const rng = seededRng(7);

type State = { match: SubastaMatch; secret: { deck: number[]; bids: Record<string, number> } };
const play = (s: State, me: string, card: number) =>
  subasta.apply({ match: s.match, secret: s.secret, me, move: { game: 'subasta', card }, players: P, rng, now: 0 });

test('subasta: the deck stays secret, bids stay hidden, hands shrink only on reveal', () => {
  const s = subasta.start(ctx, rng, 0);
  assert.equal(s.match.prizesLeft, 8);
  assert.equal(s.secret.deck.length, 8);
  assert.deepEqual([s.match.prize!, ...s.secret.deck].sort((x, y) => x - y), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal('deck' in s.match, false);

  const r = play(s, 'juan', 9);
  assert.deepEqual(r.match.hands.juan!.length, 9, 'the spent card is not public before the reveal');
  assert.throws(() => play(r, 'juan', 8), /Ya ofertaste/);

  const done = play(r, 'ceci', 3);
  assert.equal(done.match.rounds[0]!.winner, 'juan');
  assert.equal(done.match.score.juan, s.match.prize);
  assert.equal(done.match.hands.juan!.includes(9), false);
  assert.equal(done.match.hands.ceci!.includes(3), false);
  assert.throws(() => play(done, 'juan', 9), /ya no la tenés/);
});

test('subasta: equal bids throw the prize away, nine rounds end it', () => {
  let s: State = subasta.start(ctx, rng, 0);
  let end;
  for (let card = 1; card <= 9; card++) {
    const r = play(play(s, 'juan', card), 'ceci', card);
    assert.equal(r.match.rounds.at(-1)!.winner, null);
    s = r;
    end = r.end;
  }
  assert.deepEqual(end, { winnerId: null });
  assert.equal(s.match.prize, null);
  assert.equal(s.match.score.juan, 0);
  assert.throws(() => play(s, 'juan', 1), /no quedan premios/);
});

test('subasta: the higher total of prizes wins', () => {
  let end;
  let s: State = subasta.start(ctx, rng, 0);
  const juan = [9, 1, 2, 3, 4, 5, 6, 7, 8];
  const ceci = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < 9; i++) {
    const r = play(play(s, 'juan', juan[i]!), 'ceci', ceci[i]!);
    s = r;
    end = r.end;
  }
  const juanPoints = s.match.score.juan!;
  const ceciPoints = s.match.score.ceci!;
  assert.equal(juanPoints + ceciPoints <= 45, true);
  assert.deepEqual(end, { winnerId: juanPoints === ceciPoints ? null : juanPoints > ceciPoints ? 'juan' : 'ceci' });
  assert.equal(subasta.isValidMove({ game: 'subasta', card: '3' }), false);
});
