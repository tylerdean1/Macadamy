import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapModal } from '@/components/contract/MapModal';
import { supabase } from '@/supabase';
import { GoogleMap, Marker, Polyline, Polygon, useJsApiLoader } from '@react-google-maps/api';
import type { TablesInsert } from '@/types/supabase';
import { toast } from 'sonner'; // Make sure this is installed

interface MapsFormProps {
  contractId: string;
  wbsId: string;
  onMapSaved?: () => void; // Trigger map refetch from parent
}

export const MapsForm: React.FC<MapsFormProps> = ({ contractId, wbsId, onMapSaved }) => {
  const [mapNumber, setMapNumber] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [coordinatesWkt, setCoordinatesWkt] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
  });

  const handleSave = async () => {
    if (!coordinatesWkt || !mapNumber || !locationDescription) {
      toast.error('Please fill out all fields and choose a location.');
      return;
    }

    setSubmitting(true);

    const insertData: TablesInsert<'maps'> = {
      contract_id: contractId,
      wbs_id: wbsId,
      map_number: mapNumber,
      location_description: locationDescription,
      coordinates: coordinatesWkt,
    };

    const { error } = await supabase.from('maps').insert([insertData]);

    setSubmitting(false);

    if (error) {
      console.error(error);
      toast.error('Failed to save map');
    } else {
      toast.success('Map saved successfully!');
      setMapNumber('');
      setLocationDescription('');
      setCoordinatesWkt(null);
      setModalOpen(false);
      if (onMapSaved) onMapSaved();
    }
  };

  const parsedPath = coordinatesWkt ? parseWKT(coordinatesWkt) : null;

  return (
    <div className="space-y-4">
      <Input
        label="Map Number"
        value={mapNumber}
        onChange={(e) => setMapNumber(e.target.value)}
      />
      <Input
        label="Location Description"
        value={locationDescription}
        onChange={(e) => setLocationDescription(e.target.value)}
      />

      <Button variant="outline" onClick={() => setModalOpen(true)}>
        Choose Location
      </Button>

      {coordinatesWkt && isLoaded && parsedPath && (
        <div className="mt-2 h-64 w-full border border-gray-700 rounded">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            zoom={15}
            center={parsedPath.center}
          >
            {parsedPath.type === 'point' && <Marker position={parsedPath.center} />}
            {parsedPath.type === 'line' && (
              <Polyline
                path={parsedPath.path}
                options={{ strokeColor: '#00bfff', strokeWeight: 4 }}
              />
            )}
            {parsedPath.type === 'polygon' && (
              <Polygon
                path={parsedPath.path}
                options={{
                  fillColor: '#00FF0080',
                  strokeColor: '#00FF00',
                  strokeWeight: 2,
                }}
              />
            )}
          </GoogleMap>
        </div>
      )}

      <Button onClick={handleSave} disabled={submitting}>
        {submitting ? 'Saving...' : 'Save Map'}
      </Button>

      <MapModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={(wkt) => {
          setCoordinatesWkt(wkt);
          setModalOpen(false);
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// 🔍 Basic WKT Parser (for visualization only)
// ─────────────────────────────────────────────

function parseWKT(wkt: string): {
  type: 'point' | 'line' | 'polygon';
  path: { lat: number; lng: number }[];
  center: { lat: number; lng: number };
} | null {
  const coords = (input: string) =>
    input
      .trim()
      .split(',')
      .map((pair) => {
        const [lng, lat] = pair.trim().split(' ').map(Number);
        return { lat, lng };
      });

  if (wkt.startsWith('POINT')) {
    const point = coords(wkt.replace(/^POINT\(|\)$/g, ''))[0];
    return { type: 'point', path: [point], center: point };
  }

  if (wkt.startsWith('LINESTRING')) {
    const path = coords(wkt.replace(/^LINESTRING\(|\)$/g, ''));
    const center = path[Math.floor(path.length / 2)];
    return { type: 'line', path, center };
  }

  if (wkt.startsWith('POLYGON')) {
    const path = coords(wkt.replace(/^POLYGON\(\(|\)\)$/g, ''));
    const center = path[Math.floor(path.length / 2)];
    return { type: 'polygon', path, center };
  }

  return null;
}
