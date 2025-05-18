import { Component, createRef, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, RefreshCcw, Save, Trash2, Layers3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { googleMapsLoader } from '@/lib/utils/googleMapsLoader';
import { parseWktToGeoJson, convertToGooglePath } from '@/lib/utils/geometryUtils';
import { supabase } from '@/lib/supabase';
import type { GeometryData } from '@/lib/types';
import type { GoogleMapFullRef } from './GoogleMapFull';
import { GeometryTypeButton } from './GeometryTypeButton';

interface MapModalProps {
  open: boolean;
  onClose: () => void;
  table: 'maps' | 'wbs' | 'line_items' | 'contracts';
  targetId: string;
  existingWKT: string | null;
  onSaveSuccess?: () => void;
}

interface MapModalState {
  geometry: GeometryData | null;
  saving: boolean;
  errorMsg: string;
  showPanel: boolean;
  mapInstance: google.maps.Map | null;
  drawingManager: google.maps.drawing.DrawingManager | null;
  activeShape: google.maps.Marker | google.maps.Polyline | google.maps.Polygon | null;
  activeGeometryType: 'Point' | 'LineString' | 'Polygon';
  initialGeometry: GeometryData | null;
  contractData: unknown;
}

export class MapModal extends Component<MapModalProps, MapModalState> {
  private mapRef = createRef<GoogleMapFullRef>();
  private mapDivRef = createRef<HTMLDivElement>();

  constructor(props: MapModalProps) {
    super(props);
    this.state = {
      geometry: null,
      saving: false,
      errorMsg: '',
      showPanel: true,
      mapInstance: null,
      drawingManager: null,
      activeShape: null,
      activeGeometryType: 'Point',
      initialGeometry: null,
      contractData: null
    };
  }

  componentDidMount() {
    this.hydrateGeometry();
    this.initializeMap();
    
    if (this.props.table === 'contracts' && this.props.targetId) {
      this.fetchContractData();
    }
  }

  componentDidUpdate(prevProps: MapModalProps) {
    if (prevProps.open !== this.props.open || prevProps.existingWKT !== this.props.existingWKT) {
      this.hydrateGeometry();
    }

    if (prevProps.open !== this.props.open && this.props.open) {
      this.initializeMap();
    }

    if (prevProps.targetId !== this.props.targetId && 
        this.props.table === 'contracts' && this.props.targetId) {
      this.fetchContractData();
    }

    if (this.state.mapInstance && 
        (!prevProps.open && this.props.open || 
         prevProps.existingWKT !== this.props.existingWKT)) {
      this.drawInitialGeometry();
    }
  }

  componentWillUnmount() {
    // Clean up resources
    if (this.state.activeShape) {
      this.state.activeShape.setMap(null);
    }
    if (this.state.drawingManager) {
      this.state.drawingManager.setMap(null);
    }
  }

  fetchContractData = async () => {
    if (!this.props.targetId || this.props.table !== 'contracts') return;
    
    try {
      // Direct inline RPC call
      const response = await fetch(`/api/contracts/${this.props.targetId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch contract data: ${response.statusText}`);
      }

      const data = await response.json();
      this.setState({ contractData: data });
    } catch (error) {
      console.error("Error fetching contract data:", error);
      toast.error("Failed to load contract data");
    }
  }

  refreshContractData = () => {
    this.fetchContractData();
  }

  hydrateGeometry = () => {
    const { open, existingWKT } = this.props;
    
    if (open && existingWKT) {
      const geoJson = parseWktToGeoJson(existingWKT);
      this.setState({ 
        geometry: geoJson,
        initialGeometry: geoJson
      });

      if (geoJson) {
        this.setState({
          activeGeometryType: geoJson.type as 'Point' | 'LineString' | 'Polygon'
        });
      }
    }
    
    if (!open) {
      this.setState({
        geometry: null,
        errorMsg: ''
      });
    }
  }

  initializeMap = async () => {
    const { open } = this.props;
    if (!open || !this.mapDivRef.current) return;
    
    try {
      await googleMapsLoader.load();
      
      // Initialize the map
      const mapInstanceRef = new google.maps.Map(this.mapDivRef.current, {
        center: { lat: 35.77, lng: -78.64 }, // Default center (Raleigh, NC)
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
      });
      
      this.setState({ mapInstance: mapInstanceRef });
      
      // Initialize the drawing manager
      const drawingMgrRef = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.MARKER,
        drawingControl: false, // We'll use our own UI
        markerOptions: {
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 7,
          }
        },
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 5,
          strokeOpacity: 0.8,
          editable: true,
          draggable: true,
        },
        polygonOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 2,
          strokeOpacity: 0.8,
          fillColor: '#4285F4',
          fillOpacity: 0.35,
          editable: true,
          draggable: true,
        }
      });
      
      drawingMgrRef.setMap(mapInstanceRef);
      this.setState({ drawingManager: drawingMgrRef });
      
      // Setup drawing complete event handler
      google.maps.event.addListener(drawingMgrRef, 'overlaycomplete', this.handleOverlayComplete);
    } catch (error) {
      console.error("Error loading Google Maps:", error);
      toast.error("Failed to load map editor");
    }
  }

  handleOverlayComplete = (event: google.maps.drawing.OverlayCompleteEvent) => {
    // Remove the previous shape if any
    if (this.state.activeShape) {
      this.state.activeShape.setMap(null);
    }
    
    // Only handle marker, polyline, and polygon types
    if (
      event.overlay instanceof google.maps.Marker ||
      event.overlay instanceof google.maps.Polyline ||
      event.overlay instanceof google.maps.Polygon
    ) {
      this.setState({ activeShape: event.overlay });
    }
    
    // Convert to geometry
    let geom: GeometryData | null = null;
    
    if (event.overlay instanceof google.maps.Marker) {
      const position = event.overlay.getPosition();
      if (position) {
        geom = {
          type: 'Point',
          coordinates: [position.lng(), position.lat()]
        };
      }
    } else if (event.overlay instanceof google.maps.Polyline) {
      const path = event.overlay.getPath();
      const points = Array.from({ length: path.getLength() }, (_, i) => {
        const point = path.getAt(i);
        return [point.lng(), point.lat()];
      });
      
      geom = {
        type: 'LineString',
        coordinates: points
      };
    } else if (event.overlay instanceof google.maps.Polygon) {
      const path = event.overlay.getPath();
      const points = Array.from({ length: path.getLength() }, (_, i) => {
        const point = path.getAt(i);
        return [point.lng(), point.lat()];
      });
      
      geom = {
        type: 'Polygon',
        coordinates: [points]
      };
    }
    
    if (geom) {
      this.setState({ geometry: geom });
    }
  }

  drawInitialGeometry = () => {
    const { mapInstance, initialGeometry, activeShape } = this.state;
    
    if (!mapInstance || !initialGeometry) return;
    
    // Clear any existing shapes
    if (activeShape) {
      activeShape.setMap(null);
    }
    
    try {
      // Different handling based on geometry type
      switch (initialGeometry.type) {
        case 'Point': {
          const position = convertToGooglePath(initialGeometry);
          
          if (position instanceof google.maps.LatLng) {
            const marker = new google.maps.Marker({
              position,
              map: mapInstance,
              draggable: true,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                scale: 7,
              }
            });
            
            this.setState({ activeShape: marker });
            mapInstance.setCenter(position);
            mapInstance.setZoom(15);
          }
          break;
        }
        
        case 'LineString': {
          const path = convertToGooglePath(initialGeometry);
          
          if (Array.isArray(path) && path.every(p => p instanceof google.maps.LatLng)) {
            const polyline = new google.maps.Polyline({
              path,
              map: mapInstance,
              strokeColor: '#4285F4',
              strokeWeight: 5,
              strokeOpacity: 0.8,
              editable: true,
              draggable: true
            });
            
            this.setState({ activeShape: polyline });
            
            // Fit bounds to the line
            const bounds = new google.maps.LatLngBounds();
            path.forEach(point => bounds.extend(point));
            mapInstance.fitBounds(bounds);
          }
          break;
        }
        
        case 'Polygon': {
          const paths = convertToGooglePath(initialGeometry);
          
          if (Array.isArray(paths) && Array.isArray(paths[0]) && 
              paths[0].every(p => p instanceof google.maps.LatLng)) {
            const polygon = new google.maps.Polygon({
              paths: paths[0], // Use the outer ring
              map: mapInstance,
              strokeColor: '#4285F4',
              strokeWeight: 2,
              strokeOpacity: 0.8,
              fillColor: '#4285F4',
              fillOpacity: 0.35,
              editable: true,
              draggable: true
            });
            
            this.setState({ activeShape: polygon });
            
            // Fit bounds to the polygon
            const bounds = new google.maps.LatLngBounds();
            paths[0].forEach(point => bounds.extend(point));
            mapInstance.fitBounds(bounds);
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error rendering initial geometry:', error);
      toast.error('Failed to display the existing geometry');
    }
  }

  handleGeometryTypeChange = (type: 'Point' | 'LineString' | 'Polygon') => {
    const { drawingManager, activeShape } = this.state;
    
    if (!drawingManager) return;
    
    this.setState({ activeGeometryType: type });
    
    // Clear existing shape
    if (activeShape) {
      activeShape.setMap(null);
      this.setState({ activeShape: null });
    }
    
    // Set the appropriate drawing mode
    switch (type) {
      case 'Point':
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.MARKER);
        break;
      case 'LineString':
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
        break;
      case 'Polygon':
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
        break;
    }
  }

  getWktFromShape = (): string | null => {
    const { activeShape } = this.state;
    
    if (!activeShape) return null;
    
    try {
      if (activeShape instanceof google.maps.Marker) {
        const position = activeShape.getPosition();
        if (!position) return null;
        
        return `POINT(${position.lng()} ${position.lat()})`;
      } else if (activeShape instanceof google.maps.Polyline) {
        const path = activeShape.getPath();
        const points = Array.from({ length: path.getLength() }, (_, i) => {
          const point = path.getAt(i);
          return `${point.lng()} ${point.lat()}`;
        });
        
        return `LINESTRING(${points.join(', ')})`;
      } else if (activeShape instanceof google.maps.Polygon) {
        const path = activeShape.getPath();
        const points = Array.from({ length: path.getLength() }, (_, i) => {
          const point = path.getAt(i);
          return `${point.lng()} ${point.lat()}`;
        });
        
        // Ensure the polygon is closed by repeating the first point
        if (path.getLength() > 0) {
          const firstPoint = path.getAt(0);
          points.push(`${firstPoint.lng()} ${firstPoint.lat()}`);
        }
        
        return `POLYGON((${points.join(', ')}))`;
      }
    } catch (error) {
      console.error('Error converting shape to WKT:', error);
      toast.error('Failed to create geometry');
    }
    
    return null;
  }

  handleSave = async () => {
    const wkt = this.getWktFromShape();
    
    if (!wkt) {
      toast.error('Please draw a shape on the map first');
      return;
    }

    this.setState({ saving: true });

    const { error } = await supabase
      .from(this.props.table)
      .update({ coordinates: wkt })
      .eq('id', this.props.targetId);

    this.setState({ saving: false });

    if (error) {
      this.setState({ errorMsg: 'Failed to save geometry. Please try again.' });
      return;
    }

    this.props.onClose();
    this.refreshContractData();
    this.props.onSaveSuccess?.();
  }

  clearVisibleOverlays = () => {
    if (this.mapRef.current) {
      this.mapRef.current.clearVisibleOverlays();
    }
    
    if (this.state.activeShape) {
      this.state.activeShape.setMap(null);
      this.setState({ activeShape: null, geometry: null });
    }
  }

  togglePanel = () => {
    this.setState(prevState => ({ showPanel: !prevState.showPanel }));
  }

  render() {
    const { open, onClose } = this.props;
    const { saving, errorMsg, showPanel, geometry, activeGeometryType } = this.state;

    if (!open) return null;

    return (
      <Transition show={open} as={Fragment}>
        <Dialog onClose={onClose} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-5xl w-full p-6 relative">
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 text-gray-500 hover:text-black"
              >
                <X size={20} />
              </button>

              <Dialog.Title className="text-lg font-semibold mb-4">
                Edit Location Geometry
              </Dialog.Title>

              {/* Toolbar */}
              <div className="flex flex-wrap gap-2 items-center mb-4">
                <button
                  onClick={this.handleSave}
                  disabled={!geometry || saving}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={18} />
                  Save
                </button>
                <button
                  onClick={this.refreshContractData}
                  className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  <RefreshCcw size={18} />
                  Refresh
                </button>
                <button
                  onClick={this.clearVisibleOverlays}
                  className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  <Trash2 size={18} />
                  Clear
                </button>
                <button
                  onClick={this.togglePanel}
                  className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  <Layers3 size={18} />
                  {showPanel ? 'Hide Layers' : 'Show Layers'}
                </button>
                {errorMsg && (
                  <span className="text-red-600 text-sm ml-2" aria-live="assertive">
                    {errorMsg}
                  </span>
                )}
              </div>

              {/* Map container */}
              <div ref={this.mapDivRef} className="h-[500px] w-full rounded-md overflow-hidden border border-gray-300" />

              <div className="mt-4 flex space-x-2">
                <GeometryTypeButton 
                  type="Point"
                  isActive={activeGeometryType === 'Point'}
                  onClick={() => this.handleGeometryTypeChange('Point')}
                />
                <GeometryTypeButton 
                  type="LineString"
                  isActive={activeGeometryType === 'LineString'}
                  onClick={() => this.handleGeometryTypeChange('LineString')}
                />
                <GeometryTypeButton 
                  type="Polygon"
                  isActive={activeGeometryType === 'Polygon'}
                  onClick={() => this.handleGeometryTypeChange('Polygon')}
                />
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    );
  }
}