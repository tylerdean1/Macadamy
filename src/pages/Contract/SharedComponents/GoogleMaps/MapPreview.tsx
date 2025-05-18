import { useEffect, useRef, useState } from 'react';
import { googleMapsLoader } from '@/lib/utils/googleMapsLoader';
import { parseWktToGeoJson, convertToGooglePath } from '@/lib/utils/geometryUtils';
import type { GeometryData } from '@/lib/types';

interface MapPreviewProps {
  wktGeometry: string | null;
  width?: string;
  height?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Lightweight, non‑interactive map preview (read‑only).
 */
export function MapPreview({
  wktGeometry,
  width = '100%',
  height = '200px',
  className = '',
  onClick,
}: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [geometry, setGeometry] = useState<GeometryData | null>(null);

  // Parse WKT to GeoJSON on wktGeometry change
  useEffect(() => {
    if (wktGeometry) {
      const geoJson = parseWktToGeoJson(wktGeometry);
      setGeometry(geoJson);
    } else {
      setGeometry(null);
    }
  }, [wktGeometry]);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        await googleMapsLoader.load();
        const map = new google.maps.Map(mapRef.current!, {
          center: { lat: 35.77, lng: -78.64 }, // Default center (Raleigh, NC)
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        setMapInstance(map);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, []);

  // Draw geometry on the map when both map and geometry are available
  useEffect(() => {
    if (!mapInstance || !geometry) return;

    // Clear existing overlays
    mapInstance.overlayMapTypes.clear();
    mapInstance.data.forEach((feature) => {
      mapInstance.data.remove(feature);
    });

    try {
      // Different handling based on geometry type
      switch (geometry.type) {
        case 'Point': {
          const position = convertToGooglePath(geometry) as google.maps.LatLng;

          new google.maps.Marker({
            position,
            map: mapInstance,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              scale: 7,
            },
          });

          mapInstance.setCenter(position);
          mapInstance.setZoom(15);
          break;
        }

        case 'LineString': {
          const path = convertToGooglePath(geometry) as google.maps.LatLng[];

          new google.maps.Polyline({
            path,
            map: mapInstance,
            strokeColor: '#4285F4',
            strokeWeight: 5,
            strokeOpacity: 0.8,
          });

          // Fit bounds to the line
          const bounds = new google.maps.LatLngBounds();
          path.forEach((point) => bounds.extend(point));
          mapInstance.fitBounds(bounds);
          break;
        }

        case 'Polygon': {
          const paths = convertToGooglePath(geometry) as google.maps.LatLng[][];

          new google.maps.Polygon({
            paths: paths[0], // Use the outer ring
            map: mapInstance,
            strokeColor: '#4285F4',
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillColor: '#4285F4',
            fillOpacity: 0.35,
          });

          // Fit bounds to the polygon
          const bounds = new google.maps.LatLngBounds();
          paths[0].forEach((point) => bounds.extend(point));
          mapInstance.fitBounds(bounds);
          break;
        }        default:
          console.warn('Unsupported geometry type:', String(geometry.type));
      }
    } catch (error) {
      console.error('Error rendering geometry:', error);
    }
  }, [mapInstance, geometry]);

  return (
    <div
      ref={mapRef}
      style={{ width, height }}
      className={`rounded-md overflow-hidden border border-gray-700 ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    />
  );
}