declare module '@terraformer/wkt' {
  export function wktToGeoJSON(wkt: string): GeoJSON.Geometry;
  export function geojsonToWKT(geo: GeoJSON.Geometry): string;
}
