import { describe, expect, it } from 'vitest';
import { ANECDOTES } from './anecdotes';
import { DEPARTEMENTS, departementAt, departementCenter, regionOf } from './departements';
import { containsPoint, distanceToGeometryKm } from '../geo/geometry';

describe('departements', () => {
  it('assigns every departement to a region', () => {
    for (const dep of DEPARTEMENTS) expect(regionOf(dep.code), dep.code).not.toBe('');
  });

  it('finds the departement of a city', () => {
    expect(departementAt({ lat: 44.841, lon: -0.57 }).code).toBe('33');
    expect(departementAt({ lat: 48.8566, lon: 2.3522 }).code).toBe('75');
  });

  it('places every anecdote in or right next to a departement', () => {
    for (const a of ANECDOTES) {
      expect(distanceToGeometryKm(departementAt(a), a), a.id).toBeLessThan(5);
    }
  });

  it('matches the departement written in the anecdote place', () => {
    for (const a of ANECDOTES) {
      const match = a.lieu.match(/\(([^)]+)\)$/);
      if (match) expect(departementAt(a).nom, a.id).toBe(match[1]);
    }
  });

  it('computes a center inside most departements', () => {
    const inside = DEPARTEMENTS.filter((dep) => containsPoint(dep, departementCenter(dep)));
    expect(inside.length).toBeGreaterThan(DEPARTEMENTS.length * 0.9);
  });
});
