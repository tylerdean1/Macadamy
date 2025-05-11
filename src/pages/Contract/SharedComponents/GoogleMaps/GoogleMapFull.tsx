import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { googleMapsLoader } from '@/lib/utils/googleMapsLoader';
import { useContractData } from '@/hooks/useContractData';
import type { GeometryData } from '@/lib/types';
import { Crosshair, Layers3 } from 'lucide-react';

export interface GoogleMapFullRef {
  clearVisibleOverlays: () => void;
  resetView: () => void;
}

interface Props {
  contractId: string;
  mode: 'view' | 'edit';
  height?: number;
  onSave?: (geom: GeometryData) => void;
  showPanel?: boolean;
  /** Geometry the map should centre on first (e.g. existing WKT being edited) */
  focusGeometry?: GeometryData | null;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
type OverlayShape =
  | google.maps.Marker
  | google.maps.Polyline
  | google.maps.Polygon;

const getGeometryCenter = (
  geometry?: GeometryData | null,
): google.maps.LatLngLiteral | undefined => {
  if (geometry?.type === 'Point') {
    const [lng, lat] = geometry.coordinates as [number, number];
    return { lat, lng };
  }
};

function extendBoundsWithOverlay(
  bounds: google.maps.LatLngBounds,
  ov: OverlayShape,
) {
  if (ov instanceof google.maps.Marker) {
    bounds.extend(ov.getPosition()!);
  } else if (ov instanceof google.maps.Polyline) {
    ov
      .getPath()
      .getArray()
      .forEach(ll => bounds.extend(ll));
  } else if (ov instanceof google.maps.Polygon) {
    ov
      .getPaths()
      .getArray()
      .forEach(path =>
        path.getArray().forEach(ll => bounds.extend(ll)),
      );
  }
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
export const GoogleMapFull = forwardRef<GoogleMapFullRef, Props>(
  (
    {
      contractId,
      mode,
      height = 600,
      onSave,
      showPanel: showPanelProp = true,
      focusGeometry,
    },
    ref,
  ) => {
    /* ---------- refs ---------- */
    const mapDivRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const overlaysRef = useRef<Record<string, OverlayShape>>({});

    /* ---------- state ---------- */
    const [visibility, setVisibility] = useState<Record<string, boolean>>({});
    const [showPanel, setShowPanel] = useState(showPanelProp);
    const { contract, wbsGroups } = useContractData(contractId);
    const [userLoc, setUserLoc] = useState<google.maps.LatLngLiteral>({
      lat: 39.8283,
      lng: -98.5795,
    });

    /* ---------- imperative API ---------- */
    useImperativeHandle(ref, () => ({
      clearVisibleOverlays() {
        Object.values(overlaysRef.current).forEach(o => o.setMap(null));
        overlaysRef.current = {};
      },
      resetView() {
        if (!mapRef.current) return;
        const b = new google.maps.LatLngBounds();
        Object.entries(overlaysRef.current)
          .filter(([id]) => visibility[id])
          .forEach(([, ov]) => extendBoundsWithOverlay(b, ov));

        if (!b.isEmpty()) {
          mapRef.current.fitBounds(b);
        } else {
          const ctr =
            getGeometryCenter(focusGeometry) ??
            getGeometryCenter(contract?.coordinates) ??
            userLoc;
          mapRef.current.setCenter(ctr);
          mapRef.current.setZoom(12);
        }
      },
    }));

    /* ---------- draw helper ---------- */
    const drawGeometry = useCallback(
      (
        id: string,
        geometry: GeometryData | null | undefined,
        style: {
          strokeColor: string;
          fillColor: string;
          fillOpacity: number;
          strokeWeight: number;
        },
      ) => {
        const gMap = mapRef.current;
        if (!gMap || !geometry) return;

        if (!visibility[id]) {
          overlaysRef.current[id]?.setMap(null);
          return;
        }

        overlaysRef.current[id]?.setMap(null);

        let shape: OverlayShape | null = null;
        switch (geometry.type) {
          case 'Point': {
            const [lng, lat] = geometry.coordinates as [number, number];
            shape = new google.maps.Marker({
              map: gMap,
              position: { lat, lng },
            });
            break;
          }
          case 'LineString': {
            const path = (geometry.coordinates as [number, number][]).map(
              ([lng, lat]) => ({ lat, lng }),
            );
            shape = new google.maps.Polyline({ map: gMap, path, ...style });
            break;
          }
          case 'Polygon': {
            const rings = geometry.coordinates as [number, number][][];
            const path = rings[0].map(([lng, lat]) => ({ lat, lng }));
            shape = new google.maps.Polygon({ map: gMap, paths: path, ...style });
            break;
          }
        }

        if (shape) overlaysRef.current[id] = shape;
      },
      [visibility],
    );

    /* ---------- bootstrap map ---------- */
    useEffect(() => {
      if (!mapDivRef.current) return;
      (async () => {
        await googleMapsLoader.load();

        const centre =
          getGeometryCenter(focusGeometry) ??
          getGeometryCenter(contract?.coordinates) ??
          userLoc;

        if (mapDivRef.current) {
          mapRef.current = new google.maps.Map(mapDivRef.current, {
            center: centre,
            zoom: 12,
          });
        }

        /* Place Autocomplete */
        if (searchInputRef.current) {
          searchInputRef.current.setAttribute('gmp-place-search', '');

          type AutoEvent = CustomEvent<{ place: google.maps.places.PlaceResult }>;
          searchInputRef.current.addEventListener(
            'gmpx-placeautocomplete-select',
            ((e: AutoEvent) => {
              const loc = e.detail?.place?.geometry?.location;
              if (!loc) return;
              mapRef.current!.setCenter(loc);
              mapRef.current!.setZoom(16);
              new google.maps.Marker({ map: mapRef.current!, position: loc });
            }) as unknown as EventListener,
          );
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run once

    /* ---------- recenter when data arrives ---------- */
    useEffect(() => {
      if (!mapRef.current) return;
      const ctr =
        getGeometryCenter(focusGeometry) ??
        getGeometryCenter(contract?.coordinates);
      if (ctr) {
        mapRef.current.setCenter(ctr);
        mapRef.current.setZoom(12);
      }
    }, [focusGeometry, contract?.coordinates]);

    /* ---------- build visibility map ---------- */
    useEffect(() => {
      if (!contract?.coordinates || !wbsGroups.length) return;

      const v: Record<string, boolean> = { contract: true };
      wbsGroups.forEach(w => {
        v[`wbs-${w.id}`] = true;
        w.maps.forEach(m => {
          v[`map-${m.id}`] = true;
          m.line_items.forEach(li => (v[`line-${li.id}`] = true));
        });
      });
      setVisibility(v);
    }, [contract?.coordinates, wbsGroups]);

    /* ---------- (re)draw overlays ---------- */
    useEffect(() => {
      const items = [
        { id: 'contract', geom: contract?.coordinates, col: '#34A853' },
        ...wbsGroups.map(w => ({
          id: `wbs-${w.id}`,
          geom: w.coordinates,
          col: '#FBBC05',
        })),
        ...wbsGroups.flatMap(w =>
          w.maps.map(m => ({
            id: `map-${m.id}`,
            geom: m.coordinates,
            col: '#4285F4',
          })),
        ),
        ...wbsGroups.flatMap(w =>
          w.maps.flatMap(m =>
            m.line_items.map(li => ({
              id: `line-${li.id}`,
              geom: li.coordinates,
              col: '#EA4335',
            })),
          ),
        ),
      ];

      items.forEach(i =>
        drawGeometry(i.id, i.geom, {
          strokeColor: i.col,
          fillColor: i.col,
          fillOpacity: 0.15,
          strokeWeight: 2,
        }),
      );
    }, [contract, wbsGroups, visibility, drawGeometry]);

    /* ---------- drawing manager (edit only) ---------- */
    useEffect(() => {
      const gMap = mapRef.current;
      if (!gMap || mode !== 'edit') return;

      const dm = new google.maps.drawing.DrawingManager({
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.BOTTOM_CENTER,
          drawingModes: [
            google.maps.drawing.OverlayType.MARKER,
            google.maps.drawing.OverlayType.POLYLINE,
            google.maps.drawing.OverlayType.POLYGON,
          ],
        },
        markerOptions: { draggable: true },
        polylineOptions: { editable: true },
        polygonOptions: { editable: true },
      });
      dm.setMap(gMap);

      google.maps.event.addListener(
        dm,
        'overlaycomplete',
        (ev: google.maps.drawing.OverlayCompleteEvent) => {
          dm.setDrawingMode(null);

          let geom: GeometryData | null = null;
          if (ev.overlay instanceof google.maps.Marker) {
            const p = ev.overlay.getPosition();
            if (p) geom = { type: 'Point', coordinates: [p.lng(), p.lat()] };
          } else if (ev.overlay instanceof google.maps.Polyline) {
            geom = {
              type: 'LineString',
              coordinates: ev.overlay
                .getPath()
                .getArray()
                .map(ll => [ll.lng(), ll.lat()]),
            };
          } else if (ev.overlay instanceof google.maps.Polygon) {
            geom = {
              type: 'Polygon',
              coordinates: [
                ev.overlay
                  .getPath()
                  .getArray()
                  .map(ll => [ll.lng(), ll.lat()]),
              ],
            };
          }
          if (geom) {
            onSave?.(geom);
          }
        },
      );

      return () => dm.setMap(null);
    }, [mode, onSave]);

    /* ---------------- JSX ---------------- */
    return (
      <div className="relative">
        <div ref={mapDivRef} style={{ height, width: '100%' }} />

        {/* Search input */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[320px]">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search location…"
            className="w-full px-3 py-2 border rounded shadow bg-white text-sm focus:outline-none"
          />
        </div>

        {/* Center-on-user */}
        {mode === 'edit' && (
          <button
            aria-label="Center on my location"
            onClick={() =>
              navigator.geolocation?.getCurrentPosition(pos => {
                const loc = {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                };
                setUserLoc(loc);
                mapRef.current?.setCenter(loc);
              })
            }
            className="absolute bottom-4 left-[75%] z-10 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            <Crosshair className="w-5 h-5" />
          </button>
        )}

        {/* Toggle Layers */}
        <button
          onClick={() => setShowPanel(p => !p)}
          className="absolute bottom-4 left-4 z-10 px-3 py-2 text-sm rounded bg-gray-800 text-white hover:bg-gray-700 flex items-center shadow-md"
        >
          <Layers3 className="w-5 h-5 mr-2" />
          {showPanel ? 'Hide Layers' : 'Show Layers'}
        </button>
      </div>
    );
  },
);

GoogleMapFull.displayName = 'GoogleMapFull';