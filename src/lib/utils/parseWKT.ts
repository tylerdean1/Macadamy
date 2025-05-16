import parse from 'wellknown';
import type { GeometryData } from '@/lib/types';

/**
 * Convert either a PostGIS‐style WKT string *or* a GeoJSON object
 * into our shared `GeometryData` shape.
 *
 * Returns `null` when the input is falsy or cannot be parsed.
 */
export function parseWKT(input: string | object | null): GeometryData | null {
  if (!input) return null;

  /* 1️⃣  Already GeoJSON ➜ quick structural check */
  if (typeof input === 'object') {
    const geo = input as GeometryData;
    if (geo.type && geo.coordinates) return geo;
    console.warn('[parseWKT] Invalid GeoJSON:', geo);
    return null;
  }

  /* 2️⃣  Plain WKT ➜ convert via wellknown */
  try {
    const geom = parse(input);
    if (geom && (geom as GeometryData).type) return geom as GeometryData;
    return null;
  } catch (err) {
    console.error('[parseWKT] Error parsing WKT:', input, err);
    return null;
  }
}