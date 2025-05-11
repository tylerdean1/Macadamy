// src/lib/utils/parseWKT.ts
import parse from 'wellknown';
import type { GeometryData } from '@/lib/types';

/**
 * Converts WKT string to GeometryData, or null if invalid.
 */
export function parseWKT(wkt: string | null): GeometryData | null {
  if (!wkt) return null;

  try {
    const geometry = parse(wkt);
    if (!geometry || !geometry.type) return null;

    return geometry as GeometryData;
  } catch (error) {
    console.error('[parseWKT] Invalid WKT:', wkt, error);
    return null;
  }
}
