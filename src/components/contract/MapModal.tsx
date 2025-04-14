import React, { useState } from 'react'; // Import React and useState hook
import { Dialog } from '@headlessui/react'; // Import Dialog component for modal functionality
import { X } from 'lucide-react'; // Import close icon
import { Button } from '@/components/ui/button'; // Import custom Button component
import {
  GoogleMap,
  Marker,
  Polyline,
  Polygon,
  useJsApiLoader // Import Google Maps components
} from '@react-google-maps/api'; // Import Google Maps API for React

// Define the selection mode type
type Mode = 'point' | 'segment' | 'polygon';

// Define props for MapModal component
interface MapModalProps {
  open: boolean; // State to control modal visibility
  onClose: () => void; // Callback to handle modal close
  onConfirm: (wkt: string) => void; // Callback to handle confirmed location with WKT
}

// Default style for the map container
const containerStyle = {
  width: '100%',
  height: '400px',
};

// Default center for the map
const defaultCenter = {
  lat: 27.9944,
  lng: -81.7603,
};

// MapModal component for selecting map locations
export const MapModal: React.FC<MapModalProps> = ({ open, onClose, onConfirm }) => {
  // State for managing map interaction
  const [mode, setMode] = useState<Mode>('point'); // Current selection mode
  const [startPoint, setStartPoint] = useState<{ lat: number; lng: number } | null>(null); // Starting point for segment
  const [endPoint, setEndPoint] = useState<{ lat: number; lng: number } | null>(null); // End point for segment
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]); // Path for route
  const [polygonPoints, setPolygonPoints] = useState<google.maps.LatLngLiteral[]>([]); // Points for polygon
  const [segmentDistance, setSegmentDistance] = useState<number | null>(null); // Distance of the selected segment

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!, // API key from environment variables
  });

  // Handle map click events to set points based on mode
  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return; // Check if latLng is valid
    const lat = e.latLng.lat(); // Get latitude
    const lng = e.latLng.lng(); // Get longitude

    if (mode === 'point') {
      setStartPoint({ lat, lng }); // Set starting point for point mode
    }

    if (mode === 'segment') {
      if (!startPoint) {
        setStartPoint({ lat, lng }); // Set start point
        setEndPoint(null);
        setRoutePath([]); // Clear existing path
        setSegmentDistance(null);
      } else if (!endPoint) {
        setEndPoint({ lat, lng }); // Set end point
        await fetchDirections(startPoint, { lat, lng }); // Fetch directions for the selected segment
      }
    }

    if (mode === 'polygon') {
      setPolygonPoints(prev => [...prev, { lat, lng }]); // Add point to polygon points
    }
  };

  // Fetch directions between two points for the segment
  const fetchDirections = async (
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral
  ) => {
    const directionsService = new google.maps.DirectionsService(); // Create a new Directions Service instance
    const result = await directionsService.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING, // Specify travel mode
    });

    if (result.routes.length > 0) {
      const points = result.routes[0].overview_path.map(p => ({
        lat: p.lat(),
        lng: p.lng()
      }));
      setRoutePath(points); // Set the route path from the directions response

      // Get the distance in meters from the first leg
      const meters = result.routes[0].legs?.[0]?.distance?.value || 0; // Get distance
      setSegmentDistance(meters); // Set segment distance
    }
  };

  // Handle confirmation of selected map location
  const handleConfirm = () => {
    if (mode === 'point' && startPoint) {
      const wkt = `POINT(${startPoint.lng} ${startPoint.lat})`; // Create WKT for point
      onConfirm(wkt); // Call the confirmation callback
      onClose(); // Close the modal
    }

    if (mode === 'segment' && routePath.length > 1) {
      const wkt = `LINESTRING(${routePath.map(p => `${p.lng} ${p.lat}`).join(', ')})`; // Create WKT for line segment
      onConfirm(wkt); // Call the confirmation callback
      onClose(); // Close the modal
    }

    if (mode === 'polygon' && polygonPoints.length >= 3) {
      const closed = [...polygonPoints, polygonPoints[0]]; // Close the polygon
      const wkt = `POLYGON((${closed.map(p => `${p.lng} ${p.lat}`).join(', ')}))`; // Create WKT for polygon
      onConfirm(wkt); // Call the confirmation callback
      onClose(); // Close the modal
    }
  };

  // Handle mode change and reset state
  const handleModeChange = (value: Mode) => {
    setMode(value); // Set selection mode
    // Reset all state when mode changes
    setStartPoint(null);
    setEndPoint(null);
    setRoutePath([]);
    setPolygonPoints([]);
    setSegmentDistance(null);
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div role="dialog" className="w-full max-w-4xl bg-background-light rounded-lg shadow-lg p-6 border border-background-lighter">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Select Map Location</h2> {/* Modal title */}
            <Button
              onClick={onClose} // Close modal when clicked
              variant="ghost"
              size="sm"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" /> {/* Close icon */}
            </Button>
          </div>

          {/* Selection mode dropdown */}
          <div className="mb-4">
            <label htmlFor="selection-mode" className="block text-sm text-gray-400 mb-1">
              Selection Mode
            </label>
            <select
              id="selection-mode"
              value={mode}
              onChange={(e) => handleModeChange(e.target.value as Mode)} // Change mode on selection
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded"
            >
              <option value="point">Point</option>
              <option value="segment">Street Segment</option>
              <option value="polygon">Zone (Polygon)</option>
            </select>
          </div>

          {/* Google Map */}
          {!isLoaded ? (
            <div className="text-white text-center">Loading map...</div> // Show loading message
          ) : (
            <GoogleMap
              mapContainerStyle={containerStyle} // Set map container styles
              center={startPoint || polygonPoints[0] || defaultCenter} // Center the map
              zoom={startPoint || polygonPoints.length ? 16 : 10} // Adjust zoom level
              onClick={handleMapClick} // Handle clicks on the map
            >
              {/* Render markers or shapes based on path type */}
              {mode === 'point' && startPoint && <Marker position={startPoint} />} // Point marker

              {mode === 'segment' && startPoint && (
                <Marker position={startPoint} label="A" /> // Start point marker
              )}
              {mode === 'segment' && endPoint && (
                <Marker position={endPoint} label="B" /> // End point marker
              )}
              {mode === 'segment' && routePath.length > 0 && (
                <Polyline
                  path={routePath} // Draw line segment
                  options={{
                    strokeColor: '#00bfff',
                    strokeWeight: 4,
                  }}
                />
              )}

              {mode === 'polygon' && polygonPoints.length > 1 && (
                <Polygon
                  path={[...polygonPoints, polygonPoints[0]]} // Draw polygon
                  options={{
                    strokeColor: '#00FF00',
                    fillColor: '#00FF0080',
                    strokeWeight: 2,
                  }}
                />
              )}

              {mode === 'polygon' &&
                polygonPoints.map((point, i) => (
                  <Marker key={`poly-pt-${i}`} position={point} label={(i + 1).toString()} /> // Polygon point markers
                ))}
            </GoogleMap>
          )}

          {/* Display segment length if applicable */}
          {mode === 'segment' && segmentDistance !== null && (
            <div className="mt-2 text-sm text-white">
              <strong>Segment Length:</strong>{' '}
              {(segmentDistance * 3.28084).toFixed(0)} ft (
              {(segmentDistance / 1609.344).toFixed(2)} mi) {/* Convert meters to feet and miles */}
            </div>
          )}

          {/* Confirm and Cancel buttons */}
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                // Reset states when reset is clicked
                if (mode === 'point') {
                  setStartPoint(null);
                }
                if (mode === 'segment') {
                  setStartPoint(null);
                  setEndPoint(null);
                  setRoutePath([]);
                  setSegmentDistance(null);
                }
                if (mode === 'polygon') {
                  setPolygonPoints([]);
                }
              }}
            >
              Reset
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm} // Confirm selected location
              disabled={
                (mode === 'point' && !startPoint) || // Disable if no start point
                (mode === 'segment' && routePath.length < 2) || // Disable if not drawn segment
                (mode === 'polygon' && polygonPoints.length < 3) // Disable if polygon has less than 3 points
              }
            >
              Confirm Location
            </Button>
          </div>
        </div>
      </div> 
    </Dialog>
  );
};
