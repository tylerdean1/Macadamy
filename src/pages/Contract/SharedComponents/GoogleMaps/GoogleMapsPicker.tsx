import { useEffect, useRef } from 'react';

interface GoogleMapsPickerProps {
  defaultGeometry?: string;
  onGeometryChange?: (wkt: string) => void;
}

const GoogleMapsPicker: React.FC<GoogleMapsPickerProps> = ({
  defaultGeometry,
  onGeometryChange,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const currentShapeRef = useRef<google.maps.Polygon | google.maps.Polyline | google.maps.Marker | null>(null);

  useEffect(() => {
    const loadMap = async () => {
      if (!window.google || !mapRef.current) return;
  
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 40.749933, lng: -73.98633 },
        zoom: 13,
        mapTypeId: 'roadmap',
      });
  
      const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            google.maps.drawing.OverlayType.MARKER,
            google.maps.drawing.OverlayType.POLYLINE,
            google.maps.drawing.OverlayType.POLYGON,
          ]
        },
        markerOptions: { draggable: true },
        polylineOptions: { editable: true },
        polygonOptions: { editable: true },
      });
  
      drawingManager.setMap(map);
      drawingManagerRef.current = drawingManager;
  
      google.maps.event.addListener(
        drawingManager,
        'overlaycomplete',
        (event: google.maps.drawing.OverlayCompleteEvent) => {
          if (currentShapeRef.current) {
            currentShapeRef.current.setMap(null);
          }
          currentShapeRef.current = event.overlay as typeof currentShapeRef.current;
  
          let wkt = '';
          if (event.type === google.maps.drawing.OverlayType.POLYGON) {
            const path = (event.overlay as google.maps.Polygon).getPath();
            wkt = `POLYGON ((${path.getArray().map((p) => `${p.lng()} ${p.lat()}`).join(', ')}))`;
          } else if (event.type === google.maps.drawing.OverlayType.POLYLINE) {
            const path = (event.overlay as google.maps.Polyline).getPath();
            wkt = `LINESTRING (${path.getArray().map((p) => `${p.lng()} ${p.lat()}`).join(', ')})`;
          } else if (event.type === google.maps.drawing.OverlayType.MARKER) {
            const pos = (event.overlay as google.maps.Marker).getPosition();
            if (pos) {
              wkt = `POINT (${pos.lng()} ${pos.lat()})`;
            }
          }
  
          if (onGeometryChange && wkt) {
            onGeometryChange(wkt);
          }
        }
      );
    };
  
    loadMap();
  }, [defaultGeometry, onGeometryChange]);

  return <div ref={mapRef} style={{ height: '400px', width: '100%' }} />;
};

export default GoogleMapsPicker;