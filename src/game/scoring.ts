import { MAX_POINTS_PER_ROUND, POINTS_DECAY_KM } from './config';

const EARTH_RADIUS_KM = 6371;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function pointsForDistance(distanceKm: number): number {
  return Math.round(MAX_POINTS_PER_ROUND * Math.exp(-distanceKm / POINTS_DECAY_KM));
}
