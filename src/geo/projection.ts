export interface LonLat {
  lon: number;
  lat: number;
}

interface PlanePoint {
  x: number;
  y: number;
}

export type Geometry =
  | { type: 'Polygon'; coordinates: number[][][] }
  | { type: 'MultiPolygon'; coordinates: number[][][][] };

const CENTER_LAT = 46.6;
const CENTER_LON = 2.5;
const COS_CENTER = Math.cos((CENTER_LAT * Math.PI) / 180);

export function project({ lon, lat }: LonLat): PlanePoint {
  return { x: (lon - CENTER_LON) * COS_CENTER, y: CENTER_LAT - lat };
}

export function unproject({ x, y }: PlanePoint): LonLat {
  return { lon: x / COS_CENTER + CENTER_LON, lat: CENTER_LAT - y };
}

const topLeft = project({ lon: -5.6, lat: 51.3 });
const bottomRight = project({ lon: 9.8, lat: 41.2 });

export const MAP_VIEWBOX = {
  x: topLeft.x,
  y: topLeft.y,
  width: bottomRight.x - topLeft.x,
  height: bottomRight.y - topLeft.y,
};

function ringToPath(ring: number[][]): string {
  const points = ring.map(([lon, lat]) => {
    const { x, y } = project({ lon, lat });
    return `${x.toFixed(4)} ${y.toFixed(4)}`;
  });
  return `M${points.join('L')}Z`;
}

export function geometryToPath(geometry: Geometry): string {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map((rings) => rings.map(ringToPath).join('')).join('');
}
