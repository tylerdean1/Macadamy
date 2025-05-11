declare module 'wellknown' {
  export interface WellknownGeometry {
    type: 'Point' | 'LineString' | 'Polygon';
    coordinates: number[] | number[][] | number[][][];
  }

  /**
   * Parses a WKT string into a geometry object.
   */
  export default function parse(wkt: string): WellknownGeometry | null;
}
