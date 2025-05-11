import { useState } from 'react';
import { MapPinned } from 'lucide-react';
import { MapPreview } from '@/pages/Contract/SharedComponents/GoogleMaps/MapPreview';
import { MapModal } from '@/pages/Contract/SharedComponents/GoogleMaps/MapModal';
import type { GeometryData } from '@/lib/types';

interface GeometryButtonProps {
  geometry: GeometryData | null;
  /** Original WKT string stored in the DB (or null) */
  wkt: string | null;
  /** Supabase table you want to update */
  table: 'contracts' | 'wbs' | 'maps' | 'line_items';
  /** Row id inside that table */
  targetId: string;
  /** Link‑text shown to the user (e.g. “View geometry”) */
  label: string;
  /** Optional callback after a successful save */
  onSaveSuccess?: () => void;
}

/**
 * A small button that:
 *  • shows a hover-preview of the geometry
 *  • opens a <MapModal /> to edit / create geometry
 */
export function GeometryButton({
  geometry,
  wkt,
  table,
  targetId,
  label,
  onSaveSuccess,
}: GeometryButtonProps) {
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Clickable text / icon */}
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="inline-block"
      >
        <button
          onClick={() => setOpen(true)}
          className="text-sm flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
        >
          <MapPinned size={16} />
          {label}
        </button>

        {/* Hover map preview */}
        {hover && geometry && (
          <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg pointer-events-none">
            <MapPreview geometry={geometry} height={250} width={400} zoom={14} />
          </div>
        )}
      </div>

      {/* Editing modal */}
      <MapModal
        open={open}
        onClose={() => setOpen(false)}
        table={table}
        targetId={targetId}
        existingWKT={wkt}
        onSaveSuccess={onSaveSuccess}
      />
    </div>
  );
}