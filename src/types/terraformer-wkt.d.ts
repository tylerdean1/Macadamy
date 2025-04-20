declare module '@terraformer/wkt' {
  const mod: {
    parse(wkt: string): GeoJSON.Geometry;
    convert(geo: GeoJSON.Geometry): string;
  };
  export = mod;
}
