import { describe, expect, it } from 'vitest';
import { MAX_POINTS_PER_ROUND } from './config';
import { haversineKm, pointsForDistance } from './scoring';

describe('haversineKm', () => {
  it('returns 0 for the same point', () => {
    expect(haversineKm(48.85, 2.35, 48.85, 2.35)).toBe(0);
  });

  it('measures Paris to Marseille within a few km', () => {
    const d = haversineKm(48.8566, 2.3522, 43.2965, 5.3698);
    expect(d).toBeGreaterThan(660);
    expect(d).toBeLessThan(670);
  });
});

describe('pointsForDistance', () => {
  it('gives the maximum for a perfect hit', () => {
    expect(pointsForDistance(0)).toBe(MAX_POINTS_PER_ROUND);
  });

  it('decreases as distance grows', () => {
    expect(pointsForDistance(10)).toBeGreaterThan(pointsForDistance(50));
    expect(pointsForDistance(50)).toBeGreaterThan(pointsForDistance(300));
  });

  it('stays a non-negative integer', () => {
    const p = pointsForDistance(900);
    expect(Number.isInteger(p)).toBe(true);
    expect(p).toBeGreaterThanOrEqual(0);
  });
});
