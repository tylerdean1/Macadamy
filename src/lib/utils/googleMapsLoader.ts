import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { getOptionalEnv } from '@/utils/env-validator';

const mapsApiKey = getOptionalEnv('VITE_GOOGLE_MAPS_API_KEY', '');

if (mapsApiKey === '' && typeof import.meta !== 'undefined' && 'env' in import.meta && import.meta.env?.DEV) {
  console.warn('Google Maps API key is missing. Map features will be unavailable.');
}

let loadPromise: Promise<void> | null = null;

async function loadGoogleMaps(): Promise<void> {
  if (loadPromise) return loadPromise;

  setOptions({
    key: mapsApiKey,
    v: 'weekly',
    libraries: ['drawing', 'geometry', 'places'],
    mapIds: [],
    solutionChannel: 'macadamy',
  });

  loadPromise = Promise.all([
    importLibrary('maps'),
    importLibrary('places'),
    importLibrary('drawing'),
    importLibrary('geometry'),
  ]).then(() => undefined);

  return loadPromise;
}

export const googleMapsLoader = {
  load: loadGoogleMaps,
};
