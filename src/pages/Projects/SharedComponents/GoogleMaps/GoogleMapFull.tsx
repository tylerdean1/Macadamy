import { Component, createRef } from 'react';
import { googleMapsLoader } from '@/lib/utils/googleMapsLoader';
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

interface State {
  visibility: Record<string, boolean>;
  showPanel: boolean;
  userLoc: google.maps.LatLngLiteral;
  contract: Contract | null;
  wbsGroups: WbsItem[];
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
type OverlayShape =
  | google.maps.Marker
  | google.maps.Polyline
  | google.maps.Polygon;

interface LineItem {
  id: string;
  coordinates?: GeometryData | null;
}

interface MapItem {
  id: string;
  map_number: string;
  coordinates?: GeometryData | null;
  line_items: LineItem[];
}

interface WbsItem {
  id: string;
  wbs_number: string;
  coordinates?: GeometryData | null;
  maps: MapItem[];
}

interface Contract {
  coordinates?: GeometryData | null;
}

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
      .forEach((ll: google.maps.LatLng) => bounds.extend(ll));
  } else if (ov instanceof google.maps.Polygon) {
    ov
      .getPaths()
      .getArray()
      .forEach((path: google.maps.MVCArray<google.maps.LatLng>) =>
        path.getArray().forEach((ll: google.maps.LatLng) => bounds.extend(ll)),
      );
  }
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
export class GoogleMapFull extends Component<Props, State> {
  static displayName = 'GoogleMapFull';

  // Refs
  private mapDivRef = createRef<HTMLDivElement>();
  private searchInputRef = createRef<HTMLInputElement>();
  private mapRef: google.maps.Map | null = null;
  private overlaysRef: Record<string, OverlayShape> = {};

  // For external access to methods
  public clearVisibleOverlays = () => {
    Object.values(this.overlaysRef).forEach(o => o.setMap(null));
    this.overlaysRef = {};
  };

  public resetView = () => {
    if (!this.mapRef) return;
    const b = new google.maps.LatLngBounds();
    Object.entries(this.overlaysRef)
      .filter(([id]) => this.state.visibility[id])
      .forEach(([, ov]) => extendBoundsWithOverlay(b, ov));

    if (!b.isEmpty()) {
      this.mapRef.fitBounds(b);
    } else {
      const ctr =
        getGeometryCenter(this.props.focusGeometry) ??
        getGeometryCenter(this.state.contract?.coordinates) ??
        this.state.userLoc;
      this.mapRef.setCenter(ctr);
      this.mapRef.setZoom(12);
    }
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      visibility: {},
      showPanel: typeof props.showPanel === 'boolean' ? props.showPanel : true,
      userLoc: {
        lat: 39.8283,
        lng: -98.5795,
      },
      contract: null,
      wbsGroups: [],
    };
  }

  // Load contract data directly with inline RPC calls
  loadContractData = async () => {
    try {
      const { contractId } = this.props;

      // Inline RPC for fetching contract data
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch contract data: ${response.statusText}`);
      }

      const contractData: unknown = await response.json();
      if (typeof contractData === 'object' && contractData !== null && 'contract' in contractData && 'wbsGroups' in contractData) {
        const typedData = contractData as { contract: Contract; wbsGroups: WbsItem[] };
        this.setState({
          contract: typedData.contract,
          wbsGroups: typedData.wbsGroups
        }, () => {
          this.buildVisibilityMap();
          this.drawAllOverlays();
        });
      }
    } catch (error) {
      console.error("Error loading contract data:", error);
    }
  }

  buildVisibilityMap = () => {
    const { contract, wbsGroups } = this.state;
    if (!contract?.coordinates || !wbsGroups.length) return;

    const v: Record<string, boolean> = { contract: true };
    wbsGroups.forEach((w) => {
      v[`wbs-${w.id}`] = true;
      w.maps.forEach((m) => {
        v[`map-${m.id}`] = true;
        m.line_items.forEach((li) => (v[`line-${li.id}`] = true));
      });
    });
    this.setState({ visibility: v });
  }

  drawGeometry = (
    id: string,
    geometry: GeometryData | null | undefined,
    style: {
      strokeColor: string;
      fillColor: string;
      fillOpacity: number;
      strokeWeight: number;
    },
  ) => {
    const gMap = this.mapRef;
    if (!gMap || !geometry) return;

    if (!this.state.visibility[id]) {
      this.overlaysRef[id]?.setMap(null);
      return;
    }

    this.overlaysRef[id]?.setMap(null);

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

    if (shape !== null) this.overlaysRef[id] = shape;
  }

  drawAllOverlays = () => {
    const { contract, wbsGroups } = this.state;
    if (!Array.isArray(wbsGroups) || wbsGroups.length === 0) return;

    const items = [
      { id: 'contract', geom: contract?.coordinates, col: '#34A853' },
      ...wbsGroups.map((w) => ({
        id: `wbs-${w.id}`,
        geom: w.coordinates,
        col: '#FBBC05',
      })),
      ...wbsGroups.flatMap((w) =>
        w.maps.map((m) => ({
          id: `map-${m.id}`,
          geom: m.coordinates,
          col: '#4285F4',
        }))
      ),
      ...wbsGroups.flatMap((w) =>
        w.maps.flatMap((m) =>
          m.line_items.map((li) => ({
            id: `line-${li.id}`,
            geom: li.coordinates,
            col: '#EA4335',
          }))
        )
      ),
    ];

    items.forEach(i => {
      if (typeof i === 'object' && i !== null && typeof i.id === 'string' && i.id) {
        this.drawGeometry(i.id, i.geom, {
          strokeColor: i.col,
          fillColor: i.col,
          fillOpacity: 0.15,
          strokeWeight: 2,
        });
      }
    });
  }

  setupDrawingManager = () => {
    const gMap = this.mapRef;
    if (!gMap || this.props.mode !== 'edit') return;

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
              .map((ll: google.maps.LatLng) => [ll.lng(), ll.lat()]),
          };
        } else if (ev.overlay instanceof google.maps.Polygon) {
          geom = {
            type: 'Polygon',
            coordinates: [
              ev.overlay
                .getPath()
                .getArray()
                .map((ll: google.maps.LatLng) => [ll.lng(), ll.lat()]),
            ],
          };
        }
        if (geom && this.props.onSave) {
          this.props.onSave(geom);
        }
      },
    );

    return dm;
  }

  initializeMap = async () => {
    if (!this.mapDivRef.current) return;

    try {
      // Load Google Maps with Places library
      await googleMapsLoader.load();

      // Check if Places library is available
      if (!('places' in google.maps) || typeof google.maps.places !== 'object' || google.maps.places == null) {
        console.error("Google Maps Places library is not loaded");
        // Try to load Places library
        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      const centre =
        getGeometryCenter(this.props.focusGeometry) ??
        getGeometryCenter(this.state.contract?.coordinates) ??
        this.state.userLoc;

      if (this.mapDivRef.current !== null && this.mapDivRef.current !== undefined) {
        this.mapRef = new google.maps.Map(this.mapDivRef.current, {
          center: centre,
          zoom: 12,
        });
      }

      /* Place Autocomplete */
      if (this.searchInputRef.current && this.mapRef) {
        try {
          const autocomplete = new google.maps.places.Autocomplete(
            this.searchInputRef.current,
            {
              fields: ['geometry', 'name'],
              types: ['geocode', 'establishment']
            }
          );

          autocomplete.bindTo('bounds', this.mapRef);

          google.maps.event.addListener(autocomplete, 'place_changed', () => {
            const place = autocomplete.getPlace();

            if (!place.geometry || !place.geometry.location) {
              console.warn("Returned place contains no geometry");
              return;
            }

            const loc = place.geometry.location;
            if (this.mapRef) {
              this.mapRef.setCenter(loc);
              this.mapRef.setZoom(16);

              new google.maps.Marker({
                map: this.mapRef,
                position: loc,
                animation: google.maps.Animation.DROP,
                title: place.name
              });
            }
          });
        } catch (error) {
          console.error("Error setting up Places Autocomplete:", error);
        }
      }

      // Set up drawing manager
      const drawingManager = this.setupDrawingManager();

      // Load contract data after map initialization
      void this.loadContractData();

      return () => {
        if (drawingManager) drawingManager.setMap(null);
      };
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
    }
  }

  componentDidMount() {
    void this.initializeMap();
  }

  componentDidUpdate(prevProps: Props) {
    // If contract ID changes, reload data
    if (prevProps.contractId !== this.props.contractId) {
      void this.loadContractData();
    }

    // Recenter when focus geometry changes
    if (prevProps.focusGeometry !== this.props.focusGeometry && this.mapRef) {
      const ctr =
        getGeometryCenter(this.props.focusGeometry) ??
        getGeometryCenter(this.state.contract?.coordinates);

      if (ctr) {
        this.mapRef.setCenter(ctr);
        this.mapRef.setZoom(12);
      }
    }

    // Redraw overlays if visibility changes
    if (prevProps.focusGeometry !== this.props.focusGeometry ||
      prevProps.contractId !== this.props.contractId) {
      this.drawAllOverlays();
    }
  }

  togglePanelVisibility = () => {
    this.setState(prevState => ({
      showPanel: !prevState.showPanel
    }));
  }

  centerOnUserLocation = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      const loc = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      this.setState({ userLoc: loc });
      if (this.mapRef) {
        this.mapRef.setCenter(loc);
      }
    });
  }

  render() {
    const { height = 600, mode } = this.props;
    const { showPanel } = this.state;

    return (
      <div className="relative">
        <div ref={this.mapDivRef} style={{ height, width: '100%' }} />

        {/* Search input */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[320px]">
          <input
            ref={this.searchInputRef}
            type="text"
            placeholder="Search location…"
            className="w-full px-3 py-2 border rounded shadow bg-white text-sm focus:outline-none"
          />
        </div>

        {/* Center-on-user */}
        {mode === 'edit' && (
          <button
            aria-label="Center on my location"
            onClick={this.centerOnUserLocation}
            className="absolute bottom-4 left-[75%] z-10 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            <Crosshair className="w-5 h-5" />
          </button>
        )}

        {/* Toggle Layers */}
        <button
          onClick={this.togglePanelVisibility}
          className="absolute bottom-4 left-4 z-10 px-3 py-2 text-sm rounded bg-gray-800 text-white hover:bg-gray-700 flex items-center shadow-md"
        >
          <Layers3 className="w-5 h-5 mr-2" />
          {showPanel ? 'Hide Layers' : 'Show Layers'}
        </button>
      </div>
    );
  }
}