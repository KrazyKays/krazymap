import { HINT_MULTIPLIERS, MAX_POINTS_PER_ROUND, POINTS_DECAY_KM } from './config';

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

export function applyHints(points: number, hintsUsed: number): number {
  const index = Math.min(Math.max(hintsUsed, 0), HINT_MULTIPLIERS.length - 1);
  return Math.round(points * HINT_MULTIPLIERS[index]);
}

export interface Rating {
  label: string;
  emoji: string;
  tone: 'perfect' | 'great' | 'good' | 'meh' | 'miss';
}

export function ratingFor(points: number): Rating {
  const ratio = points / MAX_POINTS_PER_ROUND;
  if (ratio >= 0.93) return { label: 'Dans le mille !', emoji: '🟩', tone: 'perfect' };
  if (ratio >= 0.7) return { label: 'Excellent', emoji: '🟩', tone: 'great' };
  if (ratio >= 0.45) return { label: 'Bien vu', emoji: '🟨', tone: 'good' };
  if (ratio >= 0.15) return { label: 'Pas loin…', emoji: '🟧', tone: 'meh' };
  return { label: 'Raté', emoji: '🟥', tone: 'miss' };
}

const RANKS: { min: number; title: string }[] = [
  { min: 0.9, title: 'Cartographe légendaire' },
  { min: 0.75, title: 'Géographe chevronné' },
  { min: 0.55, title: 'Guide local' },
  { min: 0.35, title: 'Randonneur curieux' },
  { min: 0.15, title: 'Touriste du dimanche' },
  { min: 0, title: 'Voyageur égaré' },
];

export function rankFor(total: number, max: number): string {
  const ratio = max > 0 ? total / max : 0;
  return RANKS.find((rank) => ratio >= rank.min)!.title;
}
