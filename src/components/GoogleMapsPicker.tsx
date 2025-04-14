import { useEffect } from 'react'; // Import React hooks to manage lifecycle

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Fetch the Google Maps API key from environment variables

// GoogleMapsPicker component for selecting locations using Google Maps
const GoogleMapsPicker = () => {
  useEffect(() => {
    const initMap = async () => {
      await customElements.whenDefined('gmp-map'); // Wait until the custom element GMP-map is defined

      const map = document.querySelector('gmp-map') as HTMLElement & {
        innerMap?: google.maps.Map; // Type of Google Maps instance
        center?: google.maps.LatLngLiteral; // Center of the map
        zoom?: number; // Zoom level of the map
      };

      const marker = document.querySelector('gmp-advanced-marker') as HTMLElement & {
        position?: google.maps.LatLngLiteral | null; // Position of the marker on the map
      };

      const placePicker = document.querySelector('gmpx-place-picker') as HTMLElement & {
        value?: { // Value structure of selected place
          location?: google.maps.LatLngLiteral;
          name?: string;
          viewport?: google.maps.LatLngBoundsLiteral;
          displayName?: string;
          formattedAddress?: string;
        };
        addEventListener: (type: string, callback: () => void) => void; // Event listener for place changes
      };

      const infowindow = new google.maps.InfoWindow(); // Info window for displaying place details

      if (map?.innerMap) {
        map.innerMap.setOptions({ mapTypeControl: false }); // Disable map type control for UI simplicity
      }

      // Add an event listener for the place picker to handle selection
      placePicker?.addEventListener('gmpx-placechange', () => {
        const place = placePicker?.value; // Get the currently selected place
        if (!place?.location) {
          alert("No details available for: " + place?.name); // Alert if the location is not valid
          infowindow.close(); // Close the info window if no location
          if (marker) marker.position = null; // Reset marker position
          return;
        }

        // Fit the map to the selected place's viewport or center the map
        if (place.viewport && map?.innerMap) {
          map.innerMap.fitBounds(place.viewport);
        } else if (map) {
          map.center = place.location; // Center map at selected location
          map.zoom = 17; // Set zoom level for detail
        }

        if (marker) {
          marker.position = place.location; // Update marker position to the selected location
        }

        // Set content for the info window
        infowindow.setContent(`
          <strong>${place.displayName}</strong><br>
          <span>${place.formattedAddress}</span>
        `);

        // Open the info window at the marker's position
        if (map?.innerMap) {
          infowindow.open(map.innerMap!, marker as unknown as google.maps.MVCObject);
        }
      });
    };

    // Init the Google Maps when the DOM content is loaded
    document.addEventListener('DOMContentLoaded', initMap);
  }, []); // Empty dependency array ensures this runs once

  return (
    <>
      {/* Load Google Maps API module */}
      <script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js"
      />
      {/* Load the Google Maps API with the provided key */}
      <gmpx-api-loader key={apiKey} solution-channel="GMP_GE_mapsandplacesautocomplete_v2" />
      <gmp-map
        center="40.749933,-73.98633" // Initial center for the map
        zoom="13" // Initial zoom level
        map-id="DEMO_MAP_ID" // Required map ID to integrate with Google's services
        style={{ height: '400px' } as React.CSSProperties} // Set height for the map
      >
        <div slot="control-block-start-inline-start" style={{ padding: 20 }}>
          <gmpx-place-picker placeholder="Enter an address" /> {/* Input for user to select a place */}
        </div>
        <gmp-advanced-marker /> {/* Marker to show selected location */}
      </gmp-map>
    </>
  );
};

export default GoogleMapsPicker; // Export the Maps Picker component