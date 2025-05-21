import * as WKT from "@terraformer/wkt";
import type { GeometryData } from "@/lib/types";

export interface PointGeometry {
  type: "Point";
  coordinates: [number, number];
}

export interface LineStringGeometry {
  type: "LineString";
  coordinates: [[number, number]];
}

export interface PolygonGeometry {
  type: "Polygon";
  coordinates: [[[number, number]]];
}

export interface GoogleLatLng {
  lat: number;
  lng: number;
}

/**
 * Parses a WKT string into a GeometryData object (GeoJSON-compatible).
 */
export function parseWktToGeoJson(wkt: string | null): GeometryData | null {
  if (wkt === null || wkt === undefined || wkt === "") return null;
  try {
    return WKT.wktToGeoJSON(wkt) as GeometryData;
  } catch (err) {
    console.error("[parseWktToGeoJson] Failed to parse WKT:", wkt, err);
    return null;
  }
}

/**
 * Converts a parsed GeoJSON geometry to Google Maps lat/lng format.
 */
export function convertToGooglePath(
  geo: GeometryData | null,
): google.maps.LatLng | google.maps.LatLng[] | google.maps.LatLng[][] | null {
  if (!geo) return null;

  switch (geo.type) {
    case "Point": {
      const [lng, lat] = geo.coordinates as [number, number];
      return new google.maps.LatLng(lat, lng);
    }

    case "LineString": {
      return (geo.coordinates as [number, number][]).map(([lng, lat]) =>
        new google.maps.LatLng(lat, lng)
      );
    }

    case "Polygon": {
      return (geo.coordinates as [number, number][][]).map((ring) =>
        ring.map(([lng, lat]) => new google.maps.LatLng(lat, lng))
      );
    }

    default:
      return null;
  }
}

/**
 * Converts a GeometryData object to WKT string format
 */
export function geometryToWKT(geo: GeometryData | null): string | null {
  if (!geo) return null;

  try {
    switch (geo.type) {
      case "Point": {
        const [lng, lat] = geo.coordinates as [number, number];
        return `POINT(${lng} ${lat})`;
      }

      case "LineString": {
        const coords = (geo.coordinates as [number, number][])
          .map(([lng, lat]) => `${lng} ${lat}`)
          .join(", ");
        return `LINESTRING(${coords})`;
      }

      case "Polygon": {
        const rings = (geo.coordinates as [number, number][][])
          .map((ring) => {
            const ringCoords = ring.map(([lng, lat]) => `${lng} ${lat}`).join(
              ", ",
            );
            return `(${ringCoords})`;
          })
          .join(", ");
        return `POLYGON(${rings})`;
      }

      default:
        console.error("[geometryToWKT] Unsupported geometry type:", geo.type);
        return null;
    }
  } catch (err) {
    console.error(
      "[geometryToWKT] Failed to convert geometry to WKT:",
      geo,
      err,
    );
    return null;
  }
}
