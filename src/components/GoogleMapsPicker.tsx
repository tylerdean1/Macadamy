import { useEffect } from 'react';
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const GoogleMapsPicker = () => {
  useEffect(() => {
    const initMap = async () => {
      await customElements.whenDefined('gmp-map');

      const map = document.querySelector('gmp-map') as HTMLElement & {
        innerMap?: google.maps.Map;
        center?: google.maps.LatLngLiteral;
        zoom?: number;
      };

      const marker = document.querySelector('gmp-advanced-marker') as HTMLElement & {
        position?: google.maps.LatLngLiteral | null;
      };

      const placePicker = document.querySelector('gmpx-place-picker') as HTMLElement & {
        value?: {
          location?: google.maps.LatLngLiteral;
          name?: string;
          viewport?: google.maps.LatLngBoundsLiteral;
          displayName?: string;
          formattedAddress?: string;
        };
        addEventListener: (type: string, callback: () => void) => void;
      };

      const infowindow = new google.maps.InfoWindow();

      if (map?.innerMap) {
        map.innerMap.setOptions({ mapTypeControl: false });
      }

      placePicker?.addEventListener('gmpx-placechange', () => {
        const place = placePicker?.value;
        if (!place?.location) {
          alert("No details available for: " + place?.name);
          infowindow.close();
          if (marker) marker.position = null;
          return;
        }

        if (place.viewport && map?.innerMap) {
          map.innerMap.fitBounds(place.viewport);
        } else if (map) {
          map.center = place.location;
          map.zoom = 17;
        }

        if (marker) {
          marker.position = place.location;
        }

        infowindow.setContent(`
          <strong>${place.displayName}</strong><br>
          <span>${place.formattedAddress}</span>
        `);

        if (map?.innerMap) {
            infowindow.open(map.innerMap!, marker as unknown as google.maps.MVCObject);
        }
      });
    };

    document.addEventListener('DOMContentLoaded', initMap);
  }, []);

  return (
    <>
      <script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js"
      />
      <gmpx-api-loader key={apiKey} solution-channel="GMP_GE_mapsandplacesautocomplete_v2" />
      <gmp-map
        center="40.749933,-73.98633"
        zoom="13"
        map-id="DEMO_MAP_ID"
        style={{ height: '400px' } as React.CSSProperties}
      >
        <div slot="control-block-start-inline-start" style={{ padding: 20 }}>
          <gmpx-place-picker placeholder="Enter an address" />
        </div>
        <gmp-advanced-marker />
      </gmp-map>
    </>
  );
};

export default GoogleMapsPicker;
