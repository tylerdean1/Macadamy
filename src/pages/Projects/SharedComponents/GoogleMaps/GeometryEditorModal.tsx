import { Component, createRef, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, RefreshCcw, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { googleMapsLoader } from '@/lib/utils/googleMapsLoader';
import { parseWktToGeoJson, convertToGooglePath } from '@/lib/utils/geometryUtils';
import { supabase } from '@/lib/supabase';
import type { GeometryData } from '@/lib/types';

import { GeometryTypeButton } from './GeometryTypeButton';

interface MapModalProps {
  open: boolean;
  onClose: () => void;
  table: 'maps' | 'wbs' | 'line_items' | 'projects';
  targetId: string;
  existingWKT: string | null;
  onSaveSuccess?: () => void;
}

interface MapModalState {
  geometry: GeometryData | null;
  saving: boolean;
  activeShape: google.maps.Marker | google.maps.Polyline | google.maps.Polygon | null;
  activeGeometryType: 'Point' | 'LineString' | 'Polygon';
  initialGeometry: GeometryData | null;
  mapInstance?: google.maps.Map | null;
  drawingManager?: google.maps.drawing.DrawingManager | null;
  errorMsg?: string;
}

export class MapModal extends Component<MapModalProps, MapModalState> {
  private mapDivRef = createRef<HTMLDivElement>();

  constructor(props: MapModalProps) {
    super(props);
    this.state = {
      geometry: null,
      saving: false,
      activeShape: null,
      activeGeometryType: 'Point',
      initialGeometry: null,
    };
  }

  componentDidMount() {
    this.hydrateGeometry();
    void this.initializeMap();
  }

  componentDidUpdate(prevProps: MapModalProps) {
    if (prevProps.open !== this.props.open || prevProps.existingWKT !== this.props.existingWKT) {
      this.hydrateGeometry();
    }

    if (prevProps.open !== this.props.open && this.props.open) {
      void this.initializeMap();
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

  hydrateGeometry = () => {
    const { open, existingWKT } = this.props;
    if (open && typeof existingWKT === 'string' && existingWKT.trim() !== '') {
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
            if (typeof mapInstance.setCenter === 'function') {
              mapInstance.setCenter(position);
            }
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
    if (typeof wkt !== 'string' || wkt.trim() === '') {
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
    this.props.onSaveSuccess?.();
  }

  render() {
    const { open, onClose } = this.props;
    const { saving, activeGeometryType } = this.state;

    return (
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform ease-out duration-300 transition-all"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform ease-in duration-200 transition-all"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold">Map Geometry Editor</h2>
                          <button
                            onClick={onClose}
                            className="rounded-md p-2 text-gray-400 hover:text-gray-500"
                          >
                            <span className="sr-only">Close panel</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 p-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Geometry Type
                            </label>
                            <div className="mt-1">
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
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="h-96 rounded-lg border" ref={this.mapDivRef} />
                        </div>
                      </div>

                      <div className="border-t border-gray-200">
                        <div className="flex items-center justify-between p-4">
                          <button
                            onClick={onClose}
                            className="inline-flex items-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200"
                          >
                            <X className="mr-2 h-5 w-5" aria-hidden="true" />
                            Close
                          </button>

                          <div className="flex flex-1 justify-end space-x-2 p-4">
                            <button
                              // onClick={this.refreshContractData} // Removed: method does not exist
                              className="inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                              disabled
                            >
                              <RefreshCcw className="mr-2 h-5 w-5" aria-hidden="true" />
                              Refresh Data
                            </button>

                            <button
                              onClick={() => { void this.handleSave(); }}
                              disabled={saving}
                              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                              {saving ? (
                                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4zm16 0a8 8 0 01-8 8v-8h8z"></path>
                                </svg>
                              ) : (
                                <Save className="mr-2 h-5 w-5" aria-hidden="true" />
                              )}
                              Save Geometry
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    );
  }
}