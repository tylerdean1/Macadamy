import { Loader } from '@googlemaps/js-api-loader';

export const googleMapsLoader: Loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  version: 'weekly',
  id: '__googleMapsScriptId',
  libraries: ['drawing', 'geometry', 'places']
});
