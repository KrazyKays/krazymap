import type { Geometry, LonLat } from './projection';
import { haversineKm } from '../game/scoring';

function polygons(geometry: Geometry): number[][][][] {
  return geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
}

function pointInRing({ lon, lat }: LonLat, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function containsPoint(geometry: Geometry, point: LonLat): boolean {
  return polygons(geometry).some(
    ([outer, ...holes]) => pointInRing(point, outer) && !holes.some((hole) => pointInRing(point, hole)),
  );
}

/** Distance approximative (aux sommets) entre un point et le contour d'une géométrie, 0 si le point est dedans. */
export function distanceToGeometryKm(geometry: Geometry, point: LonLat): number {
  if (containsPoint(geometry, point)) return 0;
  let best = Infinity;
  for (const rings of polygons(geometry)) {
    for (const [lon, lat] of rings[0]) {
      best = Math.min(best, haversineKm(point.lat, point.lon, lat, lon));
    }
  }
  return best;
}

/** Centre de la plus grande surface de la géométrie (barycentre de l'anneau extérieur). */
export function centroid(geometry: Geometry): LonLat {
  let bestArea = -1;
  let result: LonLat = { lon: 0, lat: 0 };
  for (const [ring] of polygons(geometry)) {
    let area = 0;
    let cx = 0;
    let cy = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [x0, y0] = ring[j];
      const [x1, y1] = ring[i];
      const cross = x0 * y1 - x1 * y0;
      area += cross;
      cx += (x0 + x1) * cross;
      cy += (y0 + y1) * cross;
    }
    if (Math.abs(area) > bestArea) {
      bestArea = Math.abs(area);
      result = { lon: cx / (3 * area), lat: cy / (3 * area) };
    }
  }
  return result;
}
