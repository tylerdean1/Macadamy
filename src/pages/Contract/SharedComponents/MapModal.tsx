import { Component, createRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GoogleMapFull } from './GoogleMaps/GoogleMapFull';
import type { GeometryData } from '@/lib/types';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  mapId?: string;
  mode: 'view' | 'edit';
  onSave?: (geometry: GeometryData) => void;
  initialGeometry?: GeometryData | null;
  title?: string;
}

interface State {
  mapData: GeometryData | null;
  loading: boolean;
  error: string | null;
}

export class MapModal extends Component<Props, State> {
  private mapRef = createRef<GoogleMapFull>();

  constructor(props: Props) {
    super(props);
    this.state = {
      mapData: null,
      loading: false,
      error: null
    };
  }

  componentDidMount() {
    if (this.props.isOpen && typeof this.props.mapId === 'string' && this.props.mapId.length > 0) {
      void this.fetchMapData();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if ((this.props.isOpen && !prevProps.isOpen) ||
      (this.props.mapId !== prevProps.mapId && typeof this.props.mapId === 'string' && this.props.mapId.length > 0)) {
      void this.fetchMapData();
    }
  }

  fetchMapData = async () => {
    const { contractId, mapId } = this.props;
    if (typeof mapId !== 'string' || mapId.length === 0) return;

    this.setState({ loading: true, error: null });

    try {
      // Direct inline RPC call
      const response = await fetch(`/api/contracts/${contractId}/maps/${mapId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch map data: ${response.statusText}`);
      }

      const data = (await response.json()) as GeometryData;
      this.setState({ mapData: data, loading: false });
    } catch (error) {
      console.error("Error fetching map data:", error);
      this.setState({
        error: error instanceof Error ? error.message : "Failed to load map data",
        loading: false
      });
    }
  }

  handleSave = async (geometry: GeometryData) => {
    const { contractId, mapId, onSave } = this.props;

    if (onSave) {
      onSave(geometry);
      return;
    }

    if (typeof mapId !== 'string' || mapId.length === 0) return;

    this.setState({ loading: true, error: null });

    try {
      // Direct inline RPC call to save map geometry
      const response = await fetch(`/api/contracts/${contractId}/maps/${mapId}/geometry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ geometry })
      });

      if (!response.ok) {
        throw new Error(`Failed to save map geometry: ${response.statusText}`);
      }

      const updatedData = (await response.json()) as GeometryData;
      this.setState({
        mapData: updatedData,
        loading: false
      });
    } catch (error) {
      console.error("Error saving map geometry:", error);
      this.setState({
        error: error instanceof Error ? error.message : "Failed to save map geometry",
        loading: false
      });
    }
  }

  resetMapView = () => {
    this.mapRef.current?.resetView();
  }

  render() {
    const { isOpen, onClose, contractId, mode, initialGeometry, title } = this.props;
    const { loading, error } = this.state;

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{typeof title === 'string' && title.length > 0 ? title : "Map View"}</span>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="relative h-[75vh]">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}

            {typeof error === 'string' && error.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-100/80 z-10">
                <div className="bg-white p-4 rounded shadow-lg">
                  <h3 className="font-bold text-red-500">Error</h3>
                  <p>{error}</p>
                  <Button onClick={() => { void this.fetchMapData(); }} className="mt-2">
                    Retry
                  </Button>
                </div>
              </div>
            )}

            <GoogleMapFull
              ref={this.mapRef}
              contractId={contractId}
              mode={mode}
              height={750}
              onSave={(geometry: GeometryData) => { void this.handleSave(geometry); }}
              focusGeometry={initialGeometry}
            />
          </div>

          <div className="flex justify-between mt-4">
            <Button onClick={this.resetMapView} variant="outline">
              Reset View
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}
