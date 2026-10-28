import departementsData from './departements.json';
import { centroid, containsPoint, distanceToGeometryKm } from '../geo/geometry';
import type { Geometry, LonLat } from '../geo/projection';

export type Departement = Geometry & {
  code: string;
  nom: string;
};

export const DEPARTEMENTS = departementsData as Departement[];

const REGION_CODES: Record<string, string[]> = {
  'Auvergne-Rhône-Alpes': ['01', '03', '07', '15', '26', '38', '42', '43', '63', '69', '73', '74'],
  'Bourgogne-Franche-Comté': ['21', '25', '39', '58', '70', '71', '89', '90'],
  Bretagne: ['22', '29', '35', '56'],
  'Centre-Val de Loire': ['18', '28', '36', '37', '41', '45'],
  Corse: ['2A', '2B'],
  'Grand Est': ['08', '10', '51', '52', '54', '55', '57', '67', '68', '88'],
  'Hauts-de-France': ['02', '59', '60', '62', '80'],
  'Île-de-France': ['75', '77', '78', '91', '92', '93', '94', '95'],
  Normandie: ['14', '27', '50', '61', '76'],
  'Nouvelle-Aquitaine': ['16', '17', '19', '23', '24', '33', '40', '47', '64', '79', '86', '87'],
  Occitanie: ['09', '11', '12', '30', '31', '32', '34', '46', '48', '65', '66', '81', '82'],
  'Pays de la Loire': ['44', '49', '53', '72', '85'],
  "Provence-Alpes-Côte d'Azur": ['04', '05', '06', '13', '83', '84'],
};

const REGION_BY_CODE = new Map<string, string>(
  Object.entries(REGION_CODES).flatMap(([region, codes]) => codes.map((code) => [code, region] as const)),
);

export function regionOf(code: string): string {
  return REGION_BY_CODE.get(code) ?? '';
}

export function departementsOfRegion(region: string): string[] {
  return REGION_CODES[region] ?? [];
}

export function departementByCode(code: string): Departement | undefined {
  return DEPARTEMENTS.find((dep) => dep.code === code);
}

/** Département contenant le point, ou le plus proche (utile pour les lieux sur le littoral). */
export function departementAt(point: LonLat): Departement {
  const inside = DEPARTEMENTS.find((dep) => containsPoint(dep, point));
  if (inside) return inside;
  let best = DEPARTEMENTS[0];
  let bestDistance = Infinity;
  for (const dep of DEPARTEMENTS) {
    const d = distanceToGeometryKm(dep, point);
    if (d < bestDistance) {
      bestDistance = d;
      best = dep;
    }
  }
  return best;
}

export function departementCenter(dep: Departement): LonLat {
  return centroid(dep);
}
