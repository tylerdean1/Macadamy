import { Loader } from '@googlemaps/js-api-loader';
import { getOptionalEnvAny } from '@/utils/env-validator';

const mapsApiKey = getOptionalEnvAny(
  ['NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', 'VITE_GOOGLE_MAPS_API_KEY'],
  ''
);

if (mapsApiKey === '' && typeof import.meta !== 'undefined' && 'env' in import.meta && import.meta.env?.DEV) {
  console.warn('Google Maps API key is missing. Map features will be unavailable.');
}

export const googleMapsLoader: Loader = new Loader({
  apiKey: mapsApiKey,
  version: 'weekly',
  id: '__googleMapsScriptId',
  libraries: ['drawing', 'geometry', 'places']
});
