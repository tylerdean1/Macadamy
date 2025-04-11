import React from 'react';
import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

type LocationPin = {
  lat: number;
  lng: number;
  label?: string;
};

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapLocations: LocationPin[];
}

const containerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 35.2271, // Adjust default center as needed
  lng: -80.8431,
};

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, mapLocations }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
  });

  // For a better UX, you might calculate bounds to ensure all pins are visible
  const center = mapLocations.length > 0 ? mapLocations[0] : defaultCenter;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box 
        sx={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 900,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 2,
          borderRadius: 2,
        }}
      >
        <IconButton 
          onClick={onClose} 
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
          >
            {mapLocations.map((location, i) => (
              <Marker 
                key={i}
                position={{ lat: location.lat, lng: location.lng }}
                label={location.label}
              />
            ))}
          </GoogleMap>
        ) : (
          <div>Loading Map...</div>
        )}
      </Box>
    </Modal>
  );
};

export default MapModal;
