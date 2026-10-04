import 'server-only';
import { randomInt } from 'node:crypto';
import type { Rng } from './random';

/** The randomness real matches use: unpredictable, server only. */
export function secureRng(): Rng {
  return { int: (n) => randomInt(n) };
}
