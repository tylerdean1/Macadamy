import type { GeometryData } from '@/lib/types';

export interface MapPin {
  lat: number;
  lng: number;
  label?: string;
}

/**
 * Converts any valid GeometryData into an array of lat/lng pins.
 */
export function parseGeometryToPins(geometry: GeometryData | null, label?: string): MapPin[] {
  if (!geometry || !geometry.type || !geometry.coordinates) return [];

  if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
    const coords = geometry.coordinates as [number, number];
    return [{ lat: coords[1], lng: coords[0], label }];
  }

  if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates)) {
    const coords = geometry.coordinates as [number, number][];
    return coords.map(([lng, lat]) => ({ lat, lng, label }));
  }

  if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
    const coords = geometry.coordinates as [number, number][][];
    return coords[0].map(([lng, lat]) => ({ lat, lng, label }));
  }

  return [];
}

/**
 * Basic validity check for GeometryData before parsing.
 */
export function isValidGeometry(geometry: GeometryData | null): boolean {
  if (!geometry || !geometry.type || !geometry.coordinates) return false;
  if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) return true;
  if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates)) return true;
  if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates)) return true;
  return false;
}