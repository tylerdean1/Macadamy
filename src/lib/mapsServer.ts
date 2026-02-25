import { supabase } from '@/lib/supabase';
import { getRequiredEnvAny } from '@/utils/env-validator';

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

const SUPABASE_URL = getRequiredEnvAny(['VITE_SUPABASE_URL']);
const SUPABASE_PUBLISHABLE = getRequiredEnvAny(['VITE_SUPABASE_PUBLISHABLE_TOKEN']);

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

  const response = await fetch(`${SUPABASE_URL}/functions/v1/maps_static`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_PUBLISHABLE,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Failed to fetch static map image.');
    throw new Error(errorText || 'Failed to fetch static map image.');
  }

  return response.blob();
}
