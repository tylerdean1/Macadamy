import { useEffect, useRef } from 'react';

interface Props {
  geometry: GeoJSON.Geometry | null;
  height?: number;
}

export function GoogleMapPreview({ geometry, height = 200 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!geometry || !ref.current || !window.google) return;

    const map = new google.maps.Map(ref.current, {
      center: { lat: 0, lng: 0 },
      zoom: 12,
    });
    mapRef.current = map;

    const drawGeometry = () => {
      if (geometry.type === 'Point') {
        const [lng, lat] = geometry.coordinates as [number, number];
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map,
        });
        map.setCenter(marker.getPosition()!);
      } else if (geometry.type === 'LineString') {
        const path = (geometry.coordinates as [number, number][]).map(([lng, lat]) => ({ lat, lng }));
        new google.maps.Polyline({
          path,
          strokeColor: '#00f',
          strokeWeight: 2,
          map,
        });
        map.fitBounds(boundsFromLatLngs(path));
      } else if (geometry.type === 'Polygon') {
        const path = (geometry.coordinates as [number, number][][])[0].map(([lng, lat]) => ({ lat, lng }));
        new google.maps.Polygon({
          paths: path,
          strokeColor: '#f00',
          fillColor: '#f003',
          strokeWeight: 1,
          map,
        });
        map.fitBounds(boundsFromLatLngs(path));
      }
    };

    const boundsFromLatLngs = (points: { lat: number; lng: number }[]) => {
      const bounds = new google.maps.LatLngBounds();
      points.forEach((p) => bounds.extend(p));
      return bounds;
    };

    drawGeometry();
  }, [geometry]);

  return <div ref={ref} style={{ height, width: '100%' }} />;
}