import { departementAt, departementByCode } from '../data/departements';
import { distanceToGeometryKm } from '../geo/geometry';
import type { LonLat } from '../geo/projection';
import { MAX_POINTS_PER_ROUND } from './config';
import type { Round } from './modes';
import { applyHints, haversineKm, pointsForDistance } from './scoring';

/** Hors du département visé, on plafonne pour que viser juste reste récompensé. */
const OUTSIDE_DEPARTEMENT_CAP = 0.8;

export interface RoundResult {
  round: Round;
  guess: LonLat | null;
  distanceKm: number | null;
  points: number;
  hintsUsed: number;
  inDepartement: boolean;
  seconds: number;
}

export function evaluateGuess(round: Round, guess: LonLat | null, hintsUsed: number, seconds = 0): RoundResult {
  if (!guess) {
    return { round, guess, distanceKm: null, points: 0, hintsUsed, inDepartement: false, seconds };
  }
  const inDepartement = departementAt(guess).code === round.departementCode;
  let distanceKm: number;
  let base: number;
  if (round.wholeDepartement) {
    const dep = departementByCode(round.departementCode)!;
    distanceKm = distanceToGeometryKm(dep, guess);
    base =
      distanceKm === 0
        ? MAX_POINTS_PER_ROUND
        : Math.min(Math.round(MAX_POINTS_PER_ROUND * OUTSIDE_DEPARTEMENT_CAP), pointsForDistance(distanceKm));
  } else {
    distanceKm = haversineKm(guess.lat, guess.lon, round.answer.lat, round.answer.lon);
    base = pointsForDistance(distanceKm);
  }
  return { round, guess, distanceKm, points: applyHints(base, hintsUsed), hintsUsed, inDepartement, seconds };
}
