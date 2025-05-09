import React from 'react';
import { Button, IconButton } from '@mui/material';
import MapPinIcon from '@mui/icons-material/PinDrop';
import {
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { LineItemsTable } from '@/pages/Contract/ContractDasboardComponents/LineItemsTable';
import type { WBSGroup, ProcessedMap } from '@/lib/types';

interface WbsSectionProps {
  group: WBSGroup;
  isExpanded: boolean;
  onToggle: (wbsId: string) => void;
  onMapClick: (map: ProcessedMap) => void;
  onViewWbsMap: () => void;
  expandedMaps: string[];
  onToggleMap: (mapId: string) => void;

  /** CRUD callbacks */
  onAddWbs?: () => void;          // not used inside but available for symmetry
  onDeleteWbs?: () => void;
  onAddMap?: () => void;
  onDeleteMap?: (mapId: string) => void;
  onAddLine?: (mapId: string) => void;
  onDeleteLine?: (lineId: string) => void;
}

export const WbsSection: React.FC<WbsSectionProps> = ({
  group,
  isExpanded,
  onToggle,
  onMapClick,
  onViewWbsMap,
  expandedMaps,
  onToggleMap,
  onAddMap,
  onDeleteWbs,
  onDeleteMap,
  onAddLine,
  onDeleteLine,
}) => (
  <div className="border border-background-lighter rounded-lg overflow-hidden">
    {/* ────────── WBS HEADER ────────── */}
    <div
      onClick={() => onToggle(group.wbs)}
      className="w-full bg-background px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-background-light transition-colors gap-4 cursor-pointer"
    >
      <div className="flex items-center space-x-4">
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
        <div>
          <h3 className="text-lg font-semibold text-white">WBS {group.wbs}</h3>
          <p className="text-sm text-gray-400">{group.description}</p>
        </div>
      </div>

      {/* WBS‑level action buttons */}
      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
        {onAddMap && (
          <IconButton size="small" title="Add Map" onClick={onAddMap}>
            <PlusCircle className="w-4 h-4 text-primary" />
          </IconButton>
        )}
        <Button
          variant="outlined"
          size="small"
          startIcon={<MapPinIcon />}
          onClick={onViewWbsMap}
        >
          View WBS Map
        </Button>
        {onDeleteWbs && (
          <IconButton size="small" title="Delete WBS" onClick={onDeleteWbs}>
            <Trash2 className="w-4 h-4 text-red-400" />
          </IconButton>
        )}
      </div>
    </div>

    {/* ────────── MAP LIST ────────── */}
    {isExpanded && (
      <div className="bg-background-light border-t border-background-lighter">
        {group.maps.map(map => (
          <div key={map.id} className="border-b border-background-lighter last:border-b-0">
            {/* Map header */}
            <button
              onClick={() => onToggleMap(map.id)}
              className="w-full px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-background transition-colors gap-4"
            >
              <div className="flex items-center space-x-4">
                {expandedMaps.includes(map.id) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <div>
                  <h4 className="text-md font-medium text-white">Map {map.map_number}</h4>
                  <p className="text-sm text-gray-400">{map.location_description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <Button
                  variant="text"
                  size="small"
                  startIcon={<MapPinIcon />}
                  onClick={() => onMapClick(map)}
                >
                  View
                </Button>
                {onDeleteMap && (
                  <IconButton size="small" title="Delete Map" onClick={() => onDeleteMap(map.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </IconButton>
                )}
              </div>
            </button>

            {/* Map body */}
            {expandedMaps.includes(map.id) && (
              <div className="overflow-x-auto px-6 pb-4">
                <LineItemsTable
                  items={map.line_items}
                  onDeleteLine={onDeleteLine}
                />
                {onAddLine && (
                  <button
                    className="text-xs text-primary mt-2"
                    onClick={() => onAddLine(map.id)}
                  >
                    + Add Line Item
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);