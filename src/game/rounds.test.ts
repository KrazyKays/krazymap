import { describe, expect, it } from 'vitest';
import { pickRandom } from './rounds';

describe('pickRandom', () => {
  it('returns the requested number of distinct items', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f'];
    const picked = pickRandom(items, 4, () => 0.42);
    expect(picked).toHaveLength(4);
    expect(new Set(picked).size).toBe(4);
    picked.forEach((item) => expect(items).toContain(item));
  });

  it('does not mutate the source list', () => {
    const items = [1, 2, 3];
    pickRandom(items, 2);
    expect(items).toEqual([1, 2, 3]);
  });

  it('caps the count to the list size', () => {
    expect(pickRandom([1, 2], 5)).toHaveLength(2);
  });
});
