import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seededRng } from './random';
import { hasTimelineCandidates, startTimeline, applyOrder, timelineScore } from './timeline';
import type { LibraryEntry } from '@/lib/movie-night';

const P: [string, string] = ['juan', 'ceci'];

const library: LibraryEntry[] = [1999, 2004, 2004, 2010, 2016, 2021, null].map((year, i) => ({
  entryId: `e${i}`,
  title: `Peli ${i}`,
  year,
  director: null,
  durationMin: null,
  genres: [],
  posterPath: null,
  ratings: {},
}));

test('timeline: needs five distinct years', () => {
  assert.equal(hasTimelineCandidates(library.slice(0, 5)), false, 'a repeated year and a missing one');
  assert.equal(hasTimelineCandidates(library), true);
});

test('timeline: the right order is by year; more right positions wins', () => {
  const { match, correct, years } = startTimeline(library, seededRng(4));
  assert.equal(match.items.length, 5);
  assert.equal(new Set(years).size, 5);
  assert.ok(correct.every((item, k) => k === 0 || years[item]! > years[correct[k - 1]!]!), 'oldest to newest');
  assert.equal(match.correct, undefined, 'hidden until the end');

  assert.throws(() => applyOrder(match, correct, years, 'juan', [0, 1, 2], P), /ordenar las cinco/);
  assert.throws(() => applyOrder(match, correct, years, 'juan', [0, 0, 1, 2, 3], P), /ordenar las cinco/);

  let r = applyOrder(match, correct, years, 'juan', correct, P);
  assert.equal(r.end, undefined);
  assert.throws(() => applyOrder(r.match, correct, years, 'juan', correct, P), /Ya mandaste/);

  const wrong = [...correct].reverse();
  assert.equal(timelineScore(wrong, correct), 1, 'only the middle one stays');
  r = applyOrder(r.match, correct, years, 'ceci', wrong, P);
  assert.deepEqual(r.end, { winnerId: 'juan' });
  assert.deepEqual(r.match.correct, correct);
  assert.deepEqual(r.match.years, years);

  const tie = applyOrder(applyOrder(match, correct, years, 'juan', wrong, P).match, correct, years, 'ceci', wrong, P);
  assert.deepEqual(tie.end, { winnerId: null });
});
