import React, { useState } from 'react';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { Modal } from '@/pages/StandardPages/StandardPageComponents/modal';
import {
  GoogleMap,
  Marker,
  Polyline,
  Polygon,
  useJsApiLoader,
} from '@react-google-maps/api';
import { supabase } from '@/lib/supabase';

type Mode = 'point' | 'segment' | 'polygon';
type Level = 'contract' | 'wbs' | 'map' | 'line';
type TableName = 'contracts' | 'wbs' | 'maps' | 'line_items';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 27.9944,
  lng: -81.7603,
};

export interface MapModalProps {
  open: boolean;
  onClose: () => void;
  targetId: string;
  level: Level;
  onConfirm: (wkt: string) => void;
  mapLocations?: { lat: number; lng: number; label?: string }[]; // ✅ added
}

export const MapModal: React.FC<MapModalProps> = ({
  open,
  onClose,
  targetId,
  level,
  onConfirm,
  mapLocations, // ✅ added
}) => {
  const [mode, setMode] = useState<Mode>('point');
  const [startPoint, setStartPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<google.maps.LatLngLiteral[]>([]);
  const [segmentDistance, setSegmentDistance] = useState<number | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
  });

  const levelToTable: Record<Level, TableName> = {
    contract: 'contracts',
    wbs: 'wbs',
    map: 'maps',
    line: 'line_items',
  };

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
        lng: p.lng(),
      }));
      setRoutePath(points);
      const meters = result.routes[0].legs?.[0]?.distance?.value || 0;
      setSegmentDistance(meters);
    }
  };

  const handleConfirm = async () => {
    let wkt = '';

    if (mode === 'point' && startPoint) {
      wkt = `POINT(${startPoint.lng} ${startPoint.lat})`;
    } else if (mode === 'segment' && routePath.length > 1) {
      const linestring = routePath.map(p => `${p.lng} ${p.lat}`).join(', ');
      wkt = `LINESTRING(${linestring})`;
    } else if (mode === 'polygon' && polygonPoints.length >= 3) {
      const closed = [...polygonPoints, polygonPoints[0]];
      const polygonWKT = closed.map(p => `${p.lng} ${p.lat}`).join(', ');
      wkt = `POLYGON((${polygonWKT}))`;
    }

    if (wkt) {
      const table = levelToTable[level];
      await supabase.from(table).update({ coordinates: wkt }).eq('id', targetId);
      onConfirm(wkt);
    }

    onClose();
  };

  const handleModeChange = (value: Mode) => {
    setMode(value);
    setStartPoint(null);
    setEndPoint(null);
    setRoutePath([]);
    setPolygonPoints([]);
    setSegmentDistance(null);
  };

  const isConfirmDisabled = () => {
    if (mode === 'point') return !startPoint;
    if (mode === 'segment') return routePath.length < 2;
    if (mode === 'polygon') return polygonPoints.length < 3;
    return true;
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Select Map Location">
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
          {/* Existing selection markers */}
          {mode === 'point' && startPoint && <Marker position={startPoint} />}
          {mode === 'segment' && startPoint && <Marker position={startPoint} label="A" />}
          {mode === 'segment' && endPoint && <Marker position={endPoint} label="B" />}
          {mode === 'segment' && routePath.length > 0 && (
            <Polyline path={routePath} options={{ strokeColor: '#00bfff', strokeWeight: 4 }} />
          )}
          {mode === 'polygon' && polygonPoints.length > 1 && (
            <Polygon
              path={[...polygonPoints, polygonPoints[0]]}
              options={{ strokeColor: '#00FF00', fillColor: '#00FF0080', strokeWeight: 2 }}
            />
          )}
          {mode === 'polygon' &&
            polygonPoints.map((point, i) => (
              <Marker key={`poly-pt-${i}`} position={point} label={(i + 1).toString()} />
            ))}

          {/* ✅ Additional reference pins */}
          {mapLocations?.map((loc, idx) => (
            <Marker
              key={`ref-${idx}`}
              position={{ lat: loc.lat, lng: loc.lng }}
              label={loc.label}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }}
            />
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
            if (mode === 'point') setStartPoint(null);
            if (mode === 'segment') {
              setStartPoint(null);
              setEndPoint(null);
              setRoutePath([]);
              setSegmentDistance(null);
            }
            if (mode === 'polygon') setPolygonPoints([]);
          }}
        >
          Reset
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirm} disabled={isConfirmDisabled()}>
          Confirm Location
        </Button>
      </div>
    </Modal>
  );
};
