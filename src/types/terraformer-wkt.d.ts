declare module '@terraformer/wkt' {
  /**
   * Parses a WKT string and returns a GeoJSON object.
   * @param wkt - The Well-Known Text string to parse.
   * @returns A GeoJSON object (Point, LineString, Polygon, etc.).
   */
  export function parse(wkt: string): GeoJSON.Geometry;

  /**
   * Converts a GeoJSON object into a WKT string.
   * @param geoJSON - The GeoJSON object to convert.
   * @returns A Well-Known Text string.
   */
  export function convert(geoJSON: GeoJSON.Geometry): string;
}