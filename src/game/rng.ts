import type {Rng} from './types';

/**
 * Seeded linear congruential generator.
 * Board generation NEVER uses Math.random — a bug must be reproducible from its seed.
 */
export function makeRng(seed: number): Rng {
  let s = seed >>> 0;
  if (s === 0) {
    s = 0x9e3779b9;
  }
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** One seed per attempt, logged by the caller so a layout can be replayed. */
export function stageSeed(stageIndex: number, attempt: number): number {
  return ((stageIndex * 7919) ^ (attempt * 104729)) >>> 0;
}

export function randInt(rng: Rng, maxExclusive: number): number {
  return Math.floor(rng() * maxExclusive) % maxExclusive;
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[randInt(rng, items.length)];
}
