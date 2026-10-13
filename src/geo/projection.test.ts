import { describe, expect, it } from 'vitest';
import { MAP_VIEWBOX, project, unproject } from './projection';

describe('projection', () => {
  it('round-trips a coordinate', () => {
    const paris = { lon: 2.3522, lat: 48.8566 };
    const back = unproject(project(paris));
    expect(back.lon).toBeCloseTo(paris.lon, 9);
    expect(back.lat).toBeCloseTo(paris.lat, 9);
  });

  it('places north above south and west left of east', () => {
    const north = project({ lon: 2, lat: 50 });
    const south = project({ lon: 2, lat: 44 });
    const west = project({ lon: -2, lat: 47 });
    const east = project({ lon: 6, lat: 47 });
    expect(north.y).toBeLessThan(south.y);
    expect(west.x).toBeLessThan(east.x);
  });

  it('keeps metropolitan France and Corsica inside the viewBox', () => {
    const points = [
      { lon: -4.8, lat: 48.4 },
      { lon: 9.56, lat: 42.4 },
      { lon: 8.6, lat: 41.4 },
      { lon: 7.2, lat: 51.1 },
    ];
    for (const point of points) {
      const { x, y } = project(point);
      expect(x).toBeGreaterThanOrEqual(MAP_VIEWBOX.x);
      expect(x).toBeLessThanOrEqual(MAP_VIEWBOX.x + MAP_VIEWBOX.width);
      expect(y).toBeGreaterThanOrEqual(MAP_VIEWBOX.y);
      expect(y).toBeLessThanOrEqual(MAP_VIEWBOX.y + MAP_VIEWBOX.height);
    }
  });
});
