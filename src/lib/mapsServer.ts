// SERVER-ONLY: do not import into Vite client bundle.
import { supabase } from '@/lib/supabase';

export type TravelMode = 'DRIVE' | 'BICYCLE' | 'WALK' | 'TWO_WHEELER';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteDistanceResult {
  distanceMeters: number;
  durationSeconds: number;
  polylineEncoded?: string;
}

export interface WeatherResult {
  condition: string | null;
  temperatureCelsius: number | null;
  precipitationProbability: number | null;
  windSpeedKph: number | null;
}

export interface GeocodeResult {
  formattedAddress: string | null;
  location: LatLng | null;
  placeId?: string | null;
}

export interface SnappedRoadPoint {
  location: LatLng;
  placeId: string | null;
  originalIndex: number | null;
}

export interface StaticMapMarker {
  lat: number;
  lng: number;
  label?: string;
}

export interface StaticMapPath {
  points: Array<{ lat: number; lng: number }>;
  weight?: number;
}

export interface StaticMapRequest {
  center: { lat: number; lng: number };
  zoom: number;
  size: { width: number; height: number };
  maptype?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  markers?: StaticMapMarker[];
  paths?: StaticMapPath[];
}

type GeocodeRequest = { address: string } | { lat: number; lng: number };

type DenoRuntime = {
  env: {
    get(name: string): string | undefined;
  };
};

if (typeof window !== 'undefined') {
  throw new Error('SERVER-ONLY: mapsServer.ts must not run in the Vite client bundle.');
}

function readServerEnv(name: string): string | undefined {
  const denoLike = globalThis as { Deno?: DenoRuntime };
  const fromDeno = denoLike.Deno?.env?.get(name);
  if (typeof fromDeno === 'string' && fromDeno.trim() !== '') {
    return fromDeno.trim();
  }

  const nodeLike = globalThis as { process?: { env?: Record<string, string | undefined> } };
  const fromNode = nodeLike.process?.env?.[name];
  if (typeof fromNode === 'string' && fromNode.trim() !== '') {
    return fromNode.trim();
  }

  return undefined;
}

function getRequiredServerEnv(name: string): string {
  const value = readServerEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const GOOGLE_MAPS_SERVER_KEY = getRequiredServerEnv('GOOGLE_MAPS_SERVER_KEY');

async function getAccessTokenOrThrow(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }

  const token = data.session?.access_token;
  if (!token) {
    throw new Error('User session is required to call maps functions.');
  }

  return token;
}

async function invokeJson<Req extends Record<string, unknown>, Res>(
  functionName: string,
  body: Req,
): Promise<Res> {
  const accessToken = await getAccessTokenOrThrow();

  const { data, error } = await supabase.functions.invoke<Res>(functionName, {
    body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-google-maps-server-key': GOOGLE_MAPS_SERVER_KEY,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data == null) {
    throw new Error(`${functionName} returned an empty response.`);
  }

  return data;
}

export async function getRouteDistance(
  origin: LatLng,
  destination: LatLng,
  travelMode: TravelMode = 'DRIVE',
): Promise<RouteDistanceResult> {
  return invokeJson<{ origin: LatLng; destination: LatLng; travelMode?: TravelMode }, RouteDistanceResult>(
    'maps_routes',
    { origin, destination, travelMode },
  );
}

export async function getWeather(lat: number, lng: number): Promise<WeatherResult> {
  return invokeJson<{ lat: number; lng: number }, WeatherResult>('maps_weather', { lat, lng });
}

export async function geocode(address: string): Promise<GeocodeResult> {
  return invokeJson<GeocodeRequest, GeocodeResult>('maps_geocode', { address });
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
  return invokeJson<GeocodeRequest, GeocodeResult>('maps_geocode', { lat, lng });
}

export async function snapToRoads(path: LatLng[]): Promise<SnappedRoadPoint[]> {
  const result = await invokeJson<{ path: LatLng[] }, { path: SnappedRoadPoint[] }>('maps_roads_snap', { path });
  return Array.isArray(result.path) ? result.path : [];
}

export async function getStaticMapImage(request: StaticMapRequest): Promise<Blob> {
  const accessToken = await getAccessTokenOrThrow();

  const { data, error } = await supabase.functions.invoke<Blob>('maps_static', {
    body: request,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-google-maps-server-key': GOOGLE_MAPS_SERVER_KEY,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data == null) {
    throw new Error('maps_static returned an empty response.');
  }

  return data;
}
