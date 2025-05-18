import { useState } from 'react';
import { MapPinned } from 'lucide-react';
import { MapPreview } from '@/pages/Contract/SharedComponents/GoogleMaps/MapPreview';
import { MapModal } from '@/pages/Contract/SharedComponents/GoogleMaps/GeometryEditorModal';
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
  /** Disable the button (e.g. during loading states) */
  disabled?: boolean;
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
  disabled = false,
}: GeometryButtonProps) {
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);

  // Validate required props
  const isValid = Boolean(targetId) && Boolean(table);
  const isDisabled = disabled || !isValid;

  const handleButtonClick = () => {
    if (!isDisabled) {
      setOpen(true);
    }
  };

  const handleSaveSuccess = () => {
    if (onSaveSuccess && typeof onSaveSuccess === 'function') {
      try {
        onSaveSuccess();
      } catch (error) {
        console.error('Error in onSaveSuccess callback:', error);
      }
    }
  };

  // Safely check if geometry data is valid for preview
  const hasValidGeometry =
    Boolean(geometry) &&
    (
      (geometry && Array.isArray(geometry.coordinates)) ||
      (geometry && typeof geometry.coordinates === 'object' && geometry.coordinates !== null)
    );

  return (
    <div className="relative inline-block">
      {/* Clickable text / icon */}
      <div
        onMouseEnter={() => !isDisabled && hasValidGeometry && setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="inline-block"
      >
        <button
          onClick={handleButtonClick}
          className={`text-sm flex items-center gap-1 ${
            isDisabled
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-blue-600 dark:text-blue-400 hover:underline'
          }`}
          disabled={isDisabled}
          type="button"
        >
          <MapPinned size={16} />
          {label}
        </button>

        {/* Hover map preview - only show if we have valid geometry */}
        {hover && hasValidGeometry && (
          <div
            className="absolute top-full left-1/2 mt-2 -translate-x-1/2 z-50 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg pointer-events-none overflow-hidden"
            role="tooltip"
            aria-label="Map preview"
            style={{ width: '400px', height: '250px' }}
          >            <div className="w-full h-full">
              <MapPreview
                wktGeometry={wkt}
                width="100%"
                height="100%"
              />
            </div>
          </div>
        )}
      </div>

      {/* Editing modal - only render when needed */}
      {!isDisabled && (
        <MapModal
          open={open}
          onClose={() => setOpen(false)}
          table={table}
          targetId={targetId}
          existingWKT={wkt}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}