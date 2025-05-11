import { useEffect, useRef } from 'react';
import { googleMapsLoader } from '@/lib/utils/googleMapsLoader';
import type { GeometryData } from '@/lib/types';
import { geometryToPath, getGeometryCenter } from '@/lib/utils/mapUtils';

interface MapPreviewProps {
  geometry: GeometryData;
  height?: number;
  width?: number;
  /** Override default zoom (otherwise 12 for polygons, 14 otherwise) */
  zoom?: number;
}

/**
 * Lightweight, non‑interactive map preview (read‑only).
 */
export function MapPreview({
  geometry,
  height = 200,
  width = 300,
  zoom,
}: MapPreviewProps) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef.current) return;

    (async () => {
      await googleMapsLoader.load();

      const center = getGeometryCenter(geometry) ?? { lat: 39.8283, lng: -98.5795 };
      const defaultZoom = geometry.type === 'Polygon' ? 12 : 14;
      const map = new google.maps.Map(divRef.current!, {
        center,
        zoom: zoom ?? defaultZoom,
        disableDefaultUI: true,
      });

      switch (geometry.type) {
        case 'Point': {
          const [lng, lat] = geometry.coordinates as [number, number];
          new google.maps.Marker({ map, position: { lat, lng } });
          break;
        }
        case 'LineString': {
          new google.maps.Polyline({
            map,
            path: geometryToPath(geometry),
            strokeColor: '#4285F4',
            strokeWeight: 2,
          });
          break;
        }
        case 'Polygon': {
          new google.maps.Polygon({
            map,
            paths: geometryToPath(geometry),
            strokeColor: '#34A853',
            fillColor: '#34A853',
            fillOpacity: 0.15,
            strokeWeight: 1,
          });
          break;
        }
      }
    })();
  }, [geometry, zoom]);

  return <div ref={divRef} style={{ height, width }} />;
}