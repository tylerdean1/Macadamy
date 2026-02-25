// AUTO-GENERATED — DO NOT EDIT. Run npm run gen:edge-functions
// Generated from src/lib/mapsServer.ts
import type * as MapsServer from './mapsServer';

export const EDGE_FUNCTIONS = [
  'maps_geocode',
  'maps_roads_snap',
  'maps_routes',
  'maps_static',
  'maps_weather',
] as const;

export const EDGE_METHOD_TO_FUNCTION = {
  geocode: 'maps_geocode',
  getRouteDistance: 'maps_routes',
  getStaticMapImage: 'maps_static',
  getWeather: 'maps_weather',
  reverseGeocode: 'maps_geocode',
  snapToRoads: 'maps_roads_snap',
} as const;

export const EDGE_FUNCTION_METHODS = {
  maps_geocode: [
    'geocode',
    'reverseGeocode',
  ],
  maps_roads_snap: [
    'snapToRoads',
  ],
  maps_routes: [
    'getRouteDistance',
  ],
  maps_static: [
    'getStaticMapImage',
  ],
  maps_weather: [
    'getWeather',
  ],
} as const;

export type EdgeFunctionName = typeof EDGE_FUNCTIONS[number];
export type EdgeClientMethod = keyof typeof EDGE_METHOD_TO_FUNCTION;
export type EdgeFunctionForMethod<M extends EdgeClientMethod> = (typeof EDGE_METHOD_TO_FUNCTION)[M];
export type EdgeMethodArgs<M extends EdgeClientMethod> = Parameters<(typeof MapsServer)[M]>;
export type EdgeMethodResult<M extends EdgeClientMethod> = Awaited<ReturnType<(typeof MapsServer)[M]>>;

export type EdgeMethodRequestMap = {
  geocode: { address: EdgeMethodArgs<'geocode'>[0] };
  getRouteDistance: { origin: EdgeMethodArgs<'getRouteDistance'>[0]; destination: EdgeMethodArgs<'getRouteDistance'>[1]; travelMode?: EdgeMethodArgs<'getRouteDistance'>[2] };
  getStaticMapImage: EdgeMethodArgs<'getStaticMapImage'>[0];
  getWeather: { lat: EdgeMethodArgs<'getWeather'>[0]; lng: EdgeMethodArgs<'getWeather'>[1] };
  reverseGeocode: { lat: EdgeMethodArgs<'reverseGeocode'>[0]; lng: EdgeMethodArgs<'reverseGeocode'>[1] };
  snapToRoads: { path: EdgeMethodArgs<'snapToRoads'>[0] };
};

export type EdgeMethodRequest<M extends EdgeClientMethod> = EdgeMethodRequestMap[M];

export type EdgeFunctionRequestMap = {
  maps_geocode: EdgeMethodRequest<'geocode'> | EdgeMethodRequest<'reverseGeocode'>;
  maps_roads_snap: EdgeMethodRequest<'snapToRoads'>;
  maps_routes: EdgeMethodRequest<'getRouteDistance'>;
  maps_static: EdgeMethodRequest<'getStaticMapImage'>;
  maps_weather: EdgeMethodRequest<'getWeather'>;
};

export type EdgeFunctionResponseMap = {
  maps_geocode: EdgeMethodResult<'geocode'> | EdgeMethodResult<'reverseGeocode'>;
  maps_roads_snap: EdgeMethodResult<'snapToRoads'>;
  maps_routes: EdgeMethodResult<'getRouteDistance'>;
  maps_static: EdgeMethodResult<'getStaticMapImage'>;
  maps_weather: EdgeMethodResult<'getWeather'>;
};

export type EdgeFunctionRequest<F extends EdgeFunctionName> = EdgeFunctionRequestMap[F];
export type EdgeFunctionResponse<F extends EdgeFunctionName> = EdgeFunctionResponseMap[F];

export type EdgeFunctionContractMap = {
  [F in EdgeFunctionName]: {
    request: EdgeFunctionRequest<F>;
    response: EdgeFunctionResponse<F>;
  };
};

export type EdgeFunctionContract<F extends EdgeFunctionName> = EdgeFunctionContractMap[F];

export type EdgeMethodContractMap = {
  [M in EdgeClientMethod]: {
    functionName: EdgeFunctionForMethod<M>;
    request: EdgeMethodRequest<M>;
    response: EdgeMethodResult<M>;
  };
};

export type EdgeMethodContract<M extends EdgeClientMethod> = EdgeMethodContractMap[M];

export function isEdgeFunctionName(value: string): value is EdgeFunctionName {
  return (EDGE_FUNCTIONS as readonly string[]).includes(value);
}

