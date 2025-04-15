import React, { useState } from 'react'; // Import React and useState hook
import { Input } from '@/components/ui/input'; // Import custom Input component
import { Button } from '@/components/ui/button'; // Import custom Button component
import { MapModal } from '@/components/contract/MapModal'; // Import MapModal component for location selection
import { supabase } from '@/supabase'; // Import supabase client
import { GoogleMap, Marker, Polyline, Polygon, useJsApiLoader } from '@react-google-maps/api'; // Import Google Maps components
import type { TablesInsert } from '@/types/supabase'; // Import type for Supabase insert
import { toast } from 'sonner'; // Import toast for notifications

// Define props for MapsForm component
interface MapsFormProps {
  contractId: string; // ID of the associated contract
  wbsId: string; // ID of the associated WBS
  onMapSaved?: () => void; // Optional callback to trigger map refetch from parent
}

// MapsForm component for handling map-related information
export const MapsForm: React.FC<MapsFormProps> = ({ contractId, wbsId, onMapSaved }) => {
  // State for managing form inputs
  const [mapNumber, setMapNumber] = useState(''); // Map number input
  const [locationDescription, setLocationDescription] = useState(''); // Description input
  const [coordinatesWkt, setCoordinatesWkt] = useState<string | null>(null); // WKT coordinates
  const [modalOpen, setModalOpen] = useState(false); // State for modal visibility
  const [submitting, setSubmitting] = useState(false); // State for submission status

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!, // Load the API key from env variables
  });

  // Handle saving the map data
  const handleSave = async () => {
    // Ensure all required fields are filled
    if (!coordinatesWkt || !mapNumber || !locationDescription) {
      toast.error('Please fill out all fields and choose a location.'); // Show error if fields are empty
      return;
    }

    setSubmitting(true); // Set submitting state to true

    // Prepare data for insertion into Supabase
    const insertData: TablesInsert<'maps'> = {
      contract_id: contractId,
      wbs_id: wbsId,
      map_number: mapNumber,
      location_description: locationDescription,
      coordinates: coordinatesWkt,
    };

    // Insert data into Supabase
    const { error } = await supabase.from('maps').insert([insertData]);

    setSubmitting(false); // Reset submitting state

    // Handle successful or failed insert
    if (error) {
      console.error(error); // Log error for debugging
      toast.error('Failed to save map'); // Notify user of failure
    } else {
      toast.success('Map saved successfully!'); // Notify user of success
      // Reset form fields
      setMapNumber('');
      setLocationDescription('');
      setCoordinatesWkt(null);
      setModalOpen(false); // Close modal
      if (onMapSaved) onMapSaved(); // Call callback if provided
    }
  };

  // Parse WKT coordinates for visualization
  const parsedPath = coordinatesWkt ? parseWKT(coordinatesWkt) : null;

  return (
    <div className="space-y-4">
      <Input
        label="Map Number" // Label for map number input
        value={mapNumber} // Bound value for input
        onChange={(e) => setMapNumber(e.target.value)} // Update state on input change
      />
      <Input
        label="Location Description" // Label for location description input
        value={locationDescription} // Bound value for input
        onChange={(e) => setLocationDescription(e.target.value)} // Update state on input change
      />

      <Button variant="outline" onClick={() => setModalOpen(true)}> {/* Button to open location selection modal */}
        Choose Location
      </Button>

      {/* Render Google Map if coordinates are provided and the API is loaded */}
      {coordinatesWkt && isLoaded && parsedPath && (
        <div className="mt-2 h-64 w-full border border-gray-700 rounded">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }} // Set map container size
            zoom={15}
            center={parsedPath.center} // Center the map on the selected path
          >
            {/* Render markers or shapes based on path type */}
            {parsedPath.type === 'point' && <Marker position={parsedPath.center} />}
            {parsedPath.type === 'line' && (
              <Polyline
                path={parsedPath.path}
                options={{ strokeColor: '#00bfff', strokeWeight: 4 }} // Style for polyline
              />
            )}
            {parsedPath.type === 'polygon' && (
              <Polygon
                path={parsedPath.path}
                options={{
                  fillColor: '#00FF0080',
                  strokeColor: '#00FF00',
                  strokeWeight: 2,
                }} // Style for polygon
              />
            )}
          </GoogleMap>
        </div>
      )}

      {/* Button to save the map */}
      <Button onClick={handleSave} disabled={submitting}> 
        {submitting ? 'Saving...' : 'Save Map'} {/* Show loading text while submitting */}
      </Button>

      {/* Modal for selecting map coordinates */}
      <MapModal
        open={modalOpen} // Modal state
        onClose={() => setModalOpen(false)} // Close modal
        onConfirm={(wkt) => {
          setCoordinatesWkt(wkt); // Set WKT coordinates on confirmation
          setModalOpen(false); // Close modal
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
        return { lat, lng }; // Return latitude and longitude as object
      });

  // Determine WKT type and extract coordinates
  if (wkt.startsWith('POINT')) {
    const point = coords(wkt.replace(/^POINT\(|\)$/g, ''))[0];
    return { type: 'point', path: [point], center: point }; // Return point type
  }

  if (wkt.startsWith('LINESTRING')) {
    const path = coords(wkt.replace(/^LINESTRING\(|\)$/g, ''));
    const center = path[Math.floor(path.length / 2)];
    return { type: 'line', path, center }; // Return line type
  }

  if (wkt.startsWith('POLYGON')) {
    const path = coords(wkt.replace(/^POLYGON\(\(|\)\)$/g, ''));
    const center = path[Math.floor(path.length / 2)];
    return { type: 'polygon', path, center }; // Return polygon type
  }

  return null; // Return null for unrecognized format
}