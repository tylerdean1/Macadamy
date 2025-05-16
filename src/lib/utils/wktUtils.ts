import * as WKT from "@terraformer/wkt";
import type { GeometryData } from "@/lib/types";
import type { Geometry, LineString, Point, Polygon } from "geojson";

/**
 * Converts a GeometryData object into a WKT string.
 * Returns null if invalid or if conversion fails.
 */
export function geometryToWKT(geometry: GeometryData | null): string | null {
  if (!geometry || !geometry.type || !geometry.coordinates) return null;

  try {
    let geo: Geometry;

    switch (geometry.type) {
      case "Point":
        geo = {
          type: "Point",
          coordinates: geometry.coordinates as Point["coordinates"],
        };
        break;
      case "LineString":
        geo = {
          type: "LineString",
          coordinates: geometry.coordinates as LineString["coordinates"],
        };
        break;
      case "Polygon":
        geo = {
          type: "Polygon",
          coordinates: geometry.coordinates as Polygon["coordinates"],
        };
        break;
      default:
        return null;
    }

    return WKT.convert(geo);
  } catch (error) {
    console.warn("Failed to convert GeometryData to WKT:", geometry, error);
    return null;
  }
}
