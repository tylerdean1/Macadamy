import React from 'react'; // Import React
import { Modal, Box, IconButton } from '@mui/material'; // Import Material-UI components
import CloseIcon from '@mui/icons-material/Close'; // Import close icon
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'; // Import Google Maps components

// LocationPin type for handling marker positions
type LocationPin = {
  lat: number; // Latitude
  lng: number; // Longitude
  label?: string; // Optional label for the pin
};

// Define the props for the MapModal component
interface MapModalProps {
  isOpen: boolean; // Controls the modal's open state
  onClose: () => void; // Function to call when modal is closed
  mapLocations: LocationPin[]; // Array of locations to display on the map
}

// Container style for the Google Map
const containerStyle = {
  width: '100%',
  height: '400px', // Set height for the map
};

// Default center coordinates for the map (adjust as needed)
const defaultCenter = {
  lat: 35.2271, // Latitude
  lng: -80.8431, // Longitude
};

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, mapLocations }) => {
  // Load the Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!, // Fetch the API key from environment variables
  });

  // Set the center of the map based on provided locations
  const center = mapLocations.length > 0 ? mapLocations[0] : defaultCenter;

  return (
    <Modal open={isOpen} onClose={onClose}> {/* Modal control for open state */}
      <div>
        <Box 
          sx={{ 
            position: 'absolute',
            top: '50%', // Center the modal vertically
            left: '50%', // Center the modal horizontally
            transform: 'translate(-50%, -50%)', // Shift position to perfectly center
            width: '90%',
            maxWidth: 900, // Maximum width for larger screens
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 2, // Padding
            borderRadius: 2, // Rounded corners
          }}
        >
          <IconButton 
            onClick={onClose} // Close modal on button click
            sx={{ position: 'absolute', top: 8, right: 8 }} // Position close button
          >
            <CloseIcon /> {/* Display close icon */}
          </IconButton>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle} // Set the map container style
              center={center} // Center the map
              zoom={10} // Default zoom level
            >
              {/* Render markers for each location pin */}
              {mapLocations.map((location, i) => (
                <Marker 
                  key={i} // Unique key for each marker
                  position={{ lat: location.lat, lng: location.lng }} // Set marker position
                  label={location.label} // Set optional marker label
                />
              ))}
            </GoogleMap>
          ) : (
            <div>Loading Map...</div> // Show loading state for the map
          )}
        </Box>
      </div>
    </Modal>
  );
};

export default MapModal; // Export the MapModal component