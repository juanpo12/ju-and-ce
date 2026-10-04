/**
 * Randomness comes in through here so the game logic is deterministic in
 * tests: `crypto` in production (`secure-random.ts`, server only), a seed in
 * the tests. This file stays free of Node APIs so game logic can also run in
 * the browser (the simulator).
 */
export type Rng = {
  /** An integer in [0, n). */
  int(n: number): number;
};

/** mulberry32: small, fast and good enough to shuffle in a test. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return {
    int(n) {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      const u = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      return Math.floor(u * n);
    },
  };
}

export function pickOne<T>(items: readonly T[], rng: Rng): T {
  if (items.length === 0) throw new Error('Nothing to pick from');
  return items[rng.int(items.length)]!;
}

/** Fisher–Yates, on a copy. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}
