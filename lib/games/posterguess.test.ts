import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seededRng } from './random';
import { hasPosterCandidates, startPosterGuess, applyPosterGuess, lettersOnly } from './posterguess';
import type { LibraryEntry } from '@/lib/movie-night';

const P: [string, string] = ['juan', 'ceci'];

const entry = (over: Partial<LibraryEntry>): LibraryEntry => ({
  entryId: 'e1',
  title: 'Anatomía de una caída',
  year: 2023,
  director: null,
  durationMin: null,
  genres: ['Drama'],
  posterPath: '/anatomia.jpg',
  ratings: {},
  ...over,
});

test('poster: needs a poster and a typeable title', () => {
  assert.equal(hasPosterCandidates([entry({ posterPath: null })]), false);
  assert.equal(hasPosterCandidates([entry({ title: '千と千尋の神隠し' })]), false);
  assert.equal(hasPosterCandidates([entry({})]), true);
});

test('poster: guesses ignore accents, case and punctuation; both running out is a tie', () => {
  const now = 1_700_000_000_000;
  const { match, title } = startPosterGuess([entry({})], seededRng(1), now);
  assert.equal(title, 'Anatomía de una caída');
  assert.equal(match.posterPath, '/anatomia.jpg');
  assert.equal(match.hint, '2023 · Drama');
  assert.equal(match.startedAt, now);
  assert.equal(lettersOnly('¡La La Land!'), 'LALALAND');

  assert.throws(() => applyPosterGuess(match, title, 'juan', '   ', P), /Escribí/);

  const hit = applyPosterGuess(match, title, 'juan', 'anatomia de una CAIDA!', P);
  assert.deepEqual(hit.end, { winnerId: 'juan' });
  assert.equal(hit.match.title, title, 'revealed when it ends');

  let m = match;
  for (let i = 0; i < 4; i++) {
    const r = applyPosterGuess(m, title, 'juan', `nada ${i}`, P);
    m = r.match;
    assert.equal(r.end, undefined);
  }
  assert.throws(() => applyPosterGuess(m, title, 'juan', 'otra', P), /acabaron/);
  for (let i = 0; i < 3; i++) m = applyPosterGuess(m, title, 'ceci', `tampoco ${i}`, P).match;
  const last = applyPosterGuess(m, title, 'ceci', 'ni idea', P);
  assert.deepEqual(last.end, { winnerId: null });
  assert.equal(last.match.title, title);
});
