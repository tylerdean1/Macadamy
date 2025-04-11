import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  GoogleMap,
  Marker,
  Polyline,
  Polygon,
  useJsApiLoader
} from '@react-google-maps/api';

type Mode = 'point' | 'segment' | 'polygon';

interface MapModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (wkt: string) => void;
}

const containerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 27.9944,
  lng: -81.7603,
};

export const MapModal: React.FC<MapModalProps> = ({ open, onClose, onConfirm }) => {
  const [mode, setMode] = useState<Mode>('point');
  const [startPoint, setStartPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<google.maps.LatLngLiteral[]>([]);
  const [segmentDistance, setSegmentDistance] = useState<number | null>(null); // distance in meters

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
  });

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    if (mode === 'point') {
      setStartPoint({ lat, lng });
    }

    if (mode === 'segment') {
      if (!startPoint) {
        setStartPoint({ lat, lng });
        setEndPoint(null);
        setRoutePath([]);
        setSegmentDistance(null);
      } else if (!endPoint) {
        setEndPoint({ lat, lng });
        await fetchDirections(startPoint, { lat, lng });
      }
    }

    if (mode === 'polygon') {
      setPolygonPoints(prev => [...prev, { lat, lng }]);
    }
  };

  const fetchDirections = async (
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral
  ) => {
    const directionsService = new google.maps.DirectionsService();
    const result = await directionsService.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
    });

    if (result.routes.length > 0) {
      const points = result.routes[0].overview_path.map(p => ({
        lat: p.lat(),
        lng: p.lng()
      }));
      setRoutePath(points);

      // Get the distance in meters from the first leg
      const meters = result.routes[0].legs?.[0]?.distance?.value || 0;
      setSegmentDistance(meters);
    }
  };

  const handleConfirm = () => {
    if (mode === 'point' && startPoint) {
      const wkt = `POINT(${startPoint.lng} ${startPoint.lat})`;
      onConfirm(wkt);
      onClose();
    }

    if (mode === 'segment' && routePath.length > 1) {
      const wkt = `LINESTRING(${routePath.map(p => `${p.lng} ${p.lat}`).join(', ')})`;
      onConfirm(wkt);
      onClose();
    }

    if (mode === 'polygon' && polygonPoints.length >= 3) {
      const closed = [...polygonPoints, polygonPoints[0]];
      const wkt = `POLYGON((${closed.map(p => `${p.lng} ${p.lat}`).join(', ')}))`;
      onConfirm(wkt);
      onClose();
    }
  };

  const handleModeChange = (value: Mode) => {
    setMode(value);
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
            <h2 className="text-xl font-semibold text-white line-through" id="map-modal-title">Select Map Location</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="mb-4">
            <label htmlFor="selection-mode" className="block text-sm text-gray-400 mb-1">
              Selection Mode
            </label>
            <select
              id="selection-mode"
              value={mode}
              onChange={(e) => handleModeChange(e.target.value as Mode)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded"
            >
              <option value="point">Point</option>
              <option value="segment">Street Segment</option>
              <option value="polygon">Zone (Polygon)</option>
            </select>
          </div>

          {!isLoaded ? (
            <div className="text-white text-center">Loading map...</div>
          ) : (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={startPoint || polygonPoints[0] || defaultCenter}
              zoom={startPoint || polygonPoints.length ? 16 : 10}
              onClick={handleMapClick}
            >
              {mode === 'point' && startPoint && <Marker position={startPoint} />}

              {mode === 'segment' && startPoint && (
                <Marker position={startPoint} label="A" />
              )}
              {mode === 'segment' && endPoint && (
                <Marker position={endPoint} label="B" />
              )}
              {mode === 'segment' && routePath.length > 0 && (
                <Polyline
                  path={routePath}
                  options={{
                    strokeColor: '#00bfff',
                    strokeWeight: 4,
                  }}
                />
              )}

              {mode === 'polygon' && polygonPoints.length > 1 && (
                <Polygon
                  path={[...polygonPoints, polygonPoints[0]]}
                  options={{
                    strokeColor: '#00FF00',
                    fillColor: '#00FF0080',
                    strokeWeight: 2,
                  }}
                />
              )}

              {mode === 'polygon' &&
                polygonPoints.map((point, i) => (
                  <Marker key={`poly-pt-${i}`} position={point} label={(i + 1).toString()} />
                ))}
            </GoogleMap>
          )}

          {mode === 'segment' && segmentDistance !== null && (
            <div className="mt-2 text-sm text-white">
              <strong>Segment Length:</strong>{' '}
              {(segmentDistance * 3.28084).toFixed(0)} ft (
              {(segmentDistance / 1609.344).toFixed(2)} mi)
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
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
              onClick={handleConfirm}
              disabled={
                (mode === 'point' && !startPoint) ||
                (mode === 'segment' && routePath.length < 2) ||
                (mode === 'polygon' && polygonPoints.length < 3)
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
