import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, RefreshCcw, Save, Trash2, Layers3 } from 'lucide-react';
import { parseWKT } from '@/lib/utils/parseWKT';
import { geometryToWKT } from '@/lib/utils/wktUtils';
import { supabase } from '@/lib/supabase';
import type { GeometryData } from '@/lib/types';
import { useContractData } from '@/hooks/useContractData';
import { GoogleMapFull, GoogleMapFullRef } from './GoogleMapFull';

interface MapModalProps {
  open: boolean;
  onClose: () => void;
  table: 'maps' | 'wbs' | 'line_items' | 'contracts';
  targetId: string;
  existingWKT: string | null;
  onSaveSuccess?: () => void;
}

export function MapModal({
  open,
  onClose,
  table,
  targetId,
  existingWKT,
  onSaveSuccess,
}: MapModalProps) {
  const [geometry, setGeometry] = useState<GeometryData | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPanel, setShowPanel] = useState(true);

  const mapRef = useRef<GoogleMapFullRef | null>(null);
  const { refresh: refreshContractData, contract } = useContractData(
    table === 'contracts' ? targetId : undefined,
  );

  /* hydrate geometry when modal opens */
  useEffect(() => {
    if (open && existingWKT) {
      setGeometry(parseWKT(existingWKT));
    }
    if (!open) {
      setGeometry(null);
      setErrorMsg('');
    }
  }, [open, existingWKT]);

  const handleSave = async () => {
    if (!geometry) return;
    setSaving(true);

    const { error } = await supabase
      .from(table)
      .update({ coordinates: geometryToWKT(geometry) })
      .eq('id', targetId);

    setSaving(false);

    if (error) {
      setErrorMsg('Failed to save geometry. Please try again.');
      return;
    }

    onClose();
    refreshContractData();
    onSaveSuccess?.();
  };

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
                onClick={handleSave}
                disabled={!geometry || saving}
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                <Save size={18} />
                Save
              </button>
              <button
                onClick={refreshContractData}
                className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                <RefreshCcw size={18} />
                Refresh
              </button>
              <button
                onClick={() => mapRef.current?.clearVisibleOverlays()}
                className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                <Trash2 size={18} />
                Clear
              </button>
              <button
                onClick={() => setShowPanel(p => !p)}
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

            {/* Map */}
            {table === 'contracts' || contract ? (
              <GoogleMapFull
                ref={mapRef}
                contractId={
                  table === 'contracts' ? targetId : contract!.id
                }
                mode="edit"
                height={500}
                onSave={setGeometry}
                showPanel={showPanel}
                focusGeometry={geometry}
              />
            ) : (
              <div className="h-[500px] flex items-center justify-center text-gray-500">
                Loading map…
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}