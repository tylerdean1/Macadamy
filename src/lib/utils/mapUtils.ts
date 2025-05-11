import type { GeometryData } from '@/lib/types';

/* ------------------------------------------------------------------ */
/*  getGeometryCenter                                                 */
/* ------------------------------------------------------------------ */
export function getGeometryCenter(
  geometry: GeometryData | null | undefined,
): google.maps.LatLngLiteral | undefined {
  if (!geometry) return undefined;

  switch (geometry.type) {
    case 'Point': {
      const [lng, lat] = geometry.coordinates as [number, number];
      return { lat, lng };
    }

    case 'LineString': {
      const coords = geometry.coordinates as [number, number][];
      if (!coords.length) return undefined;
      const mid = coords[Math.floor(coords.length / 2)];
      return { lat: mid[1], lng: mid[0] };
    }

    case 'Polygon': {
      const rings = geometry.coordinates as [number, number][][];
      if (!rings.length || !rings[0].length) return undefined;

      const outer = rings[0];
      const sum = outer.reduce(
        (acc, [lng, lat]) => ({ lat: acc.lat + lat, lng: acc.lng + lng }),
        { lat: 0, lng: 0 },
      );
      return {
        lat: sum.lat / outer.length,
        lng: sum.lng / outer.length,
      };
    }

    default:
      return undefined;
  }
}

/* ------------------------------------------------------------------ */
/*  geometryToPath – for drawing polylines / polygons                 */
/* ------------------------------------------------------------------ */
export function geometryToPath(
  geometry: GeometryData | null | undefined,
): google.maps.LatLngLiteral[] {
  if (!geometry) return [];

  switch (geometry.type) {
    case 'LineString':
      return (geometry.coordinates as [number, number][]).map(([lng, lat]) => ({
        lat,
        lng,
      }));

    case 'Polygon': {
      const rings = geometry.coordinates as [number, number][][];
      const outer = rings[0] ?? [];
      return outer.map(([lng, lat]) => ({ lat, lng }));
    }

    case 'Point': {
      const [lng, lat] = geometry.coordinates as [number, number];
      return [{ lat, lng }];
    }

    default:
      return [];
  }
}

/* ------------------------------------------------------------------ */
/*  parseGeometryToPins – NEW                                          */
/* ------------------------------------------------------------------ */
/**
 * Convert a GeometryData object into one or more “pin” positions.
 * - Point      → the point itself
 * - LineString → first & last vertices
 * - Polygon    → centroid of outer ring
 * - null/other → []
 */
export function parseGeometryToPins(
  geometry: GeometryData | null | undefined,
): google.maps.LatLngLiteral[] {
  if (!geometry) return [];

  switch (geometry.type) {
    case 'Point': {
      const [lng, lat] = geometry.coordinates as [number, number];
      return [{ lat, lng }];
    }

    case 'LineString': {
      const coords = geometry.coordinates as [number, number][];
      if (coords.length === 0) return [];
      const [firstLng, firstLat] = coords[0];
      const [lastLng, lastLat] = coords[coords.length - 1];
      return [
        { lat: firstLat, lng: firstLng },
        { lat: lastLat, lng: lastLng },
      ];
    }

    case 'Polygon': {
      const center = getGeometryCenter(geometry);
      return center ? [center] : [];
    }

    default:
      return [];
  }
}